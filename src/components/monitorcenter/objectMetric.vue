<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" @click="objectList">
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
      @select-all="handleSelectAll"
      @selection-change="handleSelectionChange"
    >
      <!--对象层级-->
      <el-table-column
        type="selection"
        width="50"
        align="center">
      </el-table-column>
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="90px" :class-name="getSortClass('id')" v-if="$parent.$options.name !== 'Metric'">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="对象层级" width="380px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.object_type.display }}</span>
        </template>
      </el-table-column>
      <!--对象名称-->
      <el-table-column label="对象名称" width="400px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.object_name }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!--    <pagination v-show="total>0" :total="total" :page.sync=".page" :limit.sync=".limit" @pagination="handleFilter" />-->
    <el-dialog :title="textMap[objectsDialogStatus]" :visible.sync="objectsDialogFormVisible" :modal="false">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="对象与指标关联" name="objectData" v-if="showObjectHost">
          <object-metric-create :sys-info="this.sysInfo" :metric-id="this.metricId"/>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
<script>
import {
  fetchObjectList,
  fetchSysInfoList,
  createObject,
  updateObject,
  deleteObject,
  fetchObjBySys_id
} from '@/api/monitorcenter/object'
import waves from '@/directive/waves'
import objectMetricCreate from '@/components/monitorcenter/objectMetricCreate.vue'
import {fetchHostsBySysId} from "@/api/monitorcenter/hosts";
import {
  deleteHostsMetrics,
  deleteObjectsMetrics,
  get_hostbymetric_sys,
  get_objectByMetric_sys
} from "@/api/monitorcenter/metrics";
import hostMetricCreate from "@/components/monitorcenter/hostMetricCreate"; // waves directive

export default {
  name: 'ObjectMetric',
  directives: { waves },
  components: {
    objectMetricCreate,
  },
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
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      systemList: [],
      showDialog: false,
      selectedRows: [],
      showCreateTime: {
        type: Boolean,
        default: true,
      },
      total: 0,
      listLoading: true,
      showReviewer: false,
      // 临时弹窗表单
      temp: {
        system_id: '',
        object_type: '',
        object_name: '',
      },
      dialogFormVisible: false,
      objectsDialogFormVisible: false,
      objectsDialogStatus: false,
      showObjectHost: false,
      activeTab: 'objectData',
      dialogStatus: '',
      textMap: {
        create: '新增'
      },
      dialogPvVisible: false,
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      objectTypeOptions: [
        { label: "本地服务", value: "local_service" },
        { label: "容器服务", value: "container" },
      ]
    }
  },
  created() {
    this.handleFilter()
  },
  methods: {
    getList() {
      console.log("下面是子页面系统id")
      console.log(this.sysInfo)
      this.listLoading = true
      fetchObjectList().then(response => {
        this.list = response.data
        // this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    objectList(row) {
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
      this.objectsDialogStatus = 'list'
      this.objectsDialogFormVisible = true
      this.showObjectHost = true
      this.$nextTick(() => {
        if (this.$refs['dataForm']) {
          this.$refs['dataForm'].clearValidate()
        } else {
          console.warn('')
        }
      })
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
    fetchObjects() {
      console.log("下面是子页面系统id")
      console.log(this.sysInfo)
      if (this.sysInfo) {
        this.listLoading = true
        const sys_id = this.sysInfo
        const id = this.metricId
        get_objectByMetric_sys(sys_id, id).then((response) => {
          this.list = response.data

          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      // }
      } else {
        this.getList()
      }
    },
    getSysInfoList() {
      fetchSysInfoList().then(response => {
        this.systemList = response.data // 直接使用返回的数组
      }).catch(error => {
        console.error('Error fetching system info list:', error) // 打印出错误信息
      })
    },
    handleFilter() {
      this.fetchObjects()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    resetTemp() {
      this.temp = {
        system_id: '',
        object_type: '',
        object_name: ''
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
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        console.log(this.temp)
        if (valid) {
          createObject(this.temp).then(() => {
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
      console.log(this.temp)
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
          console.log(tempData)
          updateObject(this.temp.id, tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
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
        let objectIds = this.selectedRows.map(row => row.id);
        const metric_id = this.metricId
        const sys_id = this.sysInfo

        const data = {
          object_ids: objectIds,
        };

        // 遍历选中的主机
        for (const row of this.selectedRows) {
          await deleteObjectsMetrics(data, metric_id, sys_id)
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

    // handleFetchPv(pv) {
    //   fetchPv(pv).then(response => {
    //     this.pvData = response.data.pvData
    //     this.dialogPvVisible = true
    //   })
    // },
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
    getSortClass: function(key) {
      const sort = this.temp.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
