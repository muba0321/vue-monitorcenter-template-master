<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.systemId" placeholder="请选择系统平台" clearable style="width: 240px" class="filter-item" filterable @change="handleFilter">
        <el-option v-for="item in sysInfoList" :key="item.id" :label="item.Sys_name" :value="item.id" />
      </el-select>
      <el-button  class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="syncHost">
        同步
      </el-button>
      <!--      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">-->
      <!--        导出-->
      <!--      </el-button>-->
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      highlight-current-row
      style="width: 100%;"
      fit
      @sort-change="sortChange"
    >
      <!--ID-->
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')"  v-if="$parent.$options.name !== 'Metric'">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <!--所属模块-->
      <!--      <el-table-column label="模块ID" width="330px" align="center" >-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span>{{ row.object_name }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <!--主机IP-->
      <el-table-column label="主机IP" width="230px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.ip_address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主机名" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.host_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作系统" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.os_disrtro }}</span>
        </template>
      </el-table-column>
      <el-table-column label="内存大小" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.mem_size }}</span>
        </template>
      </el-table-column>
      <el-table-column label="磁盘大小" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.disk_size }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建方式" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.create_type }}</span>
        </template>
      </el-table-column>
<!--      <el-table-column v-if="showCreateTime" label="创建时间" width="330px" align="center">-->
<!--        <template slot-scope="{row}">-->
<!--          <span>{{ row.update_time }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="操作" align="center" width="400" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row, $index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleFilter" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="180px" style="width: 400px; margin-left:50px;">
        <el-form-item v-if="dialogStatus === 'create'" label="系统名" prop="sys_id">
            <el-select v-model="temp.sys_id" class="filter-item" placeholder="Please select">
              <el-option v-for="item in sysInfoList" :key="item.id" :label="item.Sys_name" :value="item.id" />
            </el-select>
          <span style="color: red;">*</span>
        </el-form-item>
        <el-form-item label="主机IP"  >
          <div style="display: flex; align-items: center;">
            <el-input v-model="temp.ip_address" />
            <span style="color: red;">*</span>
          </div>
        </el-form-item>
        <el-form-item label="主机名"  prop="host_name">
          <el-input v-model="temp.host_name" />
        </el-form-item>
        <el-form-item label="CPU总hz"  prop="cpu_hz">
          <el-input v-model="temp.cpu_hz" />
        </el-form-item>
        <el-form-item label="内存大小"  prop="mem_size">
          <el-input v-model="temp.mem_size" />
        </el-form-item>
        <el-form-item label="硬盘大小"  prop="disk_size">
          <el-input v-model="temp.disk_size" />
        </el-form-item>
        <el-form-item label="操作系统"  prop="os_disrtro">
          <el-input v-model="temp.os_disrtro" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
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
// import waves from '@/directive/waves' // waves directive
// import { parseTime } from '@/utils'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import {fetchSysInfoList, sync_thanos_host, sync_thanos_objects} from '@/api/monitorcenter/sysinfo'

export default {
  name: 'ComplexTable',
  // components: { Pagination },
  // directives: { waves },
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
        host_name: '',
        mem_size: '',
        disk_size: '',
        cpu_hz: '',
        os_disrtro: '',
        create_type: '',
        sys_id: '',
        status: 'published',
        host_id: ''
      },
      dialogFormVisible: false,
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
      downloadLoading: false,
      sysInfoList: []
    }
  },
  async created() {
    this.getList()
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
    handleClose(done) {
      this.showDialog = false;
      done();
    },
    getList() {
      // 调用接口获取数据
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
      if (this.listQuery.systemId) {
        this.listLoading = true
        fetchHostsBySysId(this.listQuery.systemId).then((response) => {
          this.list = response.data

          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      } else {
        this.getList()
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
        type: '',
        sys_id: this.listQuery.systemId,
      }
    },
    syncHost() {
      sync_thanos_host().then(() => {
        this.$notify({
          title: 'Success',
          message: 'Sync Successfully',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
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
      if (!this.listQuery.systemId) {
        this.$message({
          message: '请选择系统',
          type: 'warning',
          duration: 2000
        })
        return
      }
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
