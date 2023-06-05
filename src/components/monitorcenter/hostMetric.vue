<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" @click="hostList">
        新增
      </el-button>
      <el-button class="filter-item"  type="danger" style="margin-left: 10px;" @click="deleteData( )">
        删除
      </el-button>
      <el-button class="filter-item"  type="primary" style="margin-left: 10px;"  @click="handleFilter">
        刷新
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      highlight-current-row
      style="width: 100%;"
      fit
      @select-all="handleSelectAll"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <!--ID-->
      <el-table-column
        type="selection"
        width="50"
        align="center">
      </el-table-column>
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="100px" :class-name="getSortClass('id')"  v-if="$parent.$options.name !== 'Metric'">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主机IP" width="400px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.ip_address }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleFilter" />

    <el-dialog :title="textMap[hostsDialogStatus]" :visible.sync="hostsDialogFormVisible" :modal="false">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="主机与指标关系" name="objectData" v-if="showObjectHost">
          <host-metric-create :sys-info="this.sysInfo" :metric-id="this.metricId"/>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
import {
  createHostInfo,
  updateHostInfo,
  deleteHostInfo,
  fetchHostInfoList,
  fetchHostsBySysId
} from '@/api/monitorcenter/hosts'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import hostMetricCreate from "@/components/monitorcenter/hostMetricCreate";
import { fetchSysInfoList } from '@/api/monitorcenter/sysinfo'
import ObjectMetric from "@/components/monitorcenter/objectMetric";
import {deleteHostsMetrics, get_hostbymetric_sys} from "@/api/monitorcenter/metrics";

export default {
  name: 'hostInfo',
  components: {
    hostMetricCreate,
  },
  directives: { waves },
  props: {
    sysInfo: {
      type: [String, Number],
      default: null
    },
    metricId: {
      type: Number,
      required: true
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
    // typeFilter(type) {
    //   return calendarTypeKeyValue[type]
    // }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      showDialog: false,
      selectedRows: [],
      showCreateTime: {
        type: Boolean,
        default: false,
      },
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: ['新交易监管系统', '业务管理系统平台', '互联网交易平台'],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        timestamp: new Date(),
        ip_address: '',
        sys_id: '',
        status: 'published',
        host_id: ''
      },
      dialogFormVisible: false,
      hostsDialogFormVisible: false,
      hostsDialogStatus: false,
      showObjectHost: false,
      activeTab: 'objectData',
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }],
        ip_address: [
          { required: true, message: 'Please input the IP address', trigger: 'blur' },
          { validator: this.validateIP, trigger: 'blur' },
        ]
      },
      downloadLoading: false
    }
  },
  async created() {
    this.handleFilter()
    this.getSysInfoList()
  },
  methods: {
    validateIP(rule, value, callback) {
      const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (value && !ipPattern.test(value)) {
        callback(new Error('Invalid IP address'));
      } else {
        callback();
      }
    },
    handleSelectAll(selection) {
      this.selectedRows = selection;
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },
    handleClose(done) {
      this.showDialog = false;
      done();
    },
    getList() {
      // 调用接口获取数据
      console.log("下面是子页面系统id")
      console.log(this.sysInfo)
      fetchHostInfoList().then(response => {
        // 将获取到的数据赋值给 list 属性
        this.list = response.data

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    fetchHosts() {
      console.log("下面是子页面系统id")
      console.log(this.sysInfo)
      console.log("下面是子页面指标id")
      console.log(this.metricId)
      if (this.sysInfo) {
        this.listLoading = true
        const sys_id = this.sysInfo
        const id = this.metricId
        get_hostbymetric_sys(sys_id, id).then((response) => {
          this.list = response.data

          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      } else {
        this.getList()
      }
    },
    async deleteData() {
      if (this.selectedRows.length === 0) {
        this.$message({
          message: '请选择要删除的主机',
          type: 'warning',
          duration: 2000
        })
        return
      }

      try {
        let hostIds = this.selectedRows.map(row => row.id);
        const metric_id = this.metricId
        const sys_id = this.sysInfo

        const data = {
          host_ids: hostIds,
        };

        // 遍历选中的主机
        for (const row of this.selectedRows) {
          await deleteHostsMetrics(data, metric_id, sys_id)
        }

        this.$message({
          message: '关联关系删除成功',
          type: 'success',
          duration: 2000
        })

        // 重新获取主机列表
        this.handleFilter()
      } catch (error) {
        console.error('Error deleting the relationship:', error)
        this.$message({
          message: '关联关系删除失败',
          type: 'error',
          duration: 2000
        })
      }
    },
    getSysInfoList() {
      fetchSysInfoList().then(response => {
        console.log(response.data) // 添加这一行来检查返回的数据
        this.sysInfoList = response.data // 直接使用返回的数组
      }).catch(error => {
        console.error('Error fetching system info list:', error) // 打印出错误信息
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchHosts()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    hostList(row) {
      console.log("这是临时系统ID")
      console.log(this.sysInfo)
      console.log("下面是子页面指标id")
      console.log(this.metricId)
      if (!this.sysInfo) {
        this.$message({
          message: '请选择系统',
          type: 'warning',
          duration: 2000
        })
        return
      }
      this.temp = Object.assign({}, row)
      this.hostsDialogStatus = 'list'
      this.hostsDialogFormVisible = true
      this.showObjectHost = true
      this.showDialog = true
      this.dialogFormVisible =true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          console.log(this.temp)
          createHostInfo(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          const host_id = this.temp.id
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464

          // 修改这里，将tempData作为参数传递
          updateHostInfo(host_id, tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          }).catch(error => {
            this.$notify({
              title: 'Error',
              message: 'Update Failed',
              type: 'error',
              duration: 2000
            })
            console.error('Error updating host info:', error)
          })
        }
      })
    },
    handleDelete(row, index) {
      console.log('handleDelete triggered')
      const host_id = row.id
      console.log(host_id)
      deleteHostInfo(host_id).then(() => {
        // 删除成功后从列表中移除记录
        this.list.splice(index, 1)
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
      }).catch(error => {
        this.$notify({
          title: 'Error',
          message: 'Delete Failed',
          type: 'error',
          duration: 2000
        })
        console.error('Error deleting host info:', error)
      })
    },
    handleDownload() {
      // this.downloadLoading = true
      // import('@/vendor/Export2Excel').then(excel => {
      //   const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
      //   const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
      //   const data = this.formatJson(filterVal)
      //   excel.export_json_to_excel({
      //     header: tHeader,
      //     data,
      //     filename: 'table-list'
      //   })
      //   this.downloadLoading = false
      // })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
