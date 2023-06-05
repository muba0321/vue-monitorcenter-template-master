<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" @click="handleAddRelation">
        添加
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
      @sort-change="sortChange"
      @select-all="handleSelectAll"
      @selection-change="handleSelectionChange"
    >
      <!--对象层级-->
      <el-table-column
        type="selection"
        width="50"
        align="center">
      </el-table-column>
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="90px" :class-name="getSortClass('id')" >
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
import {fetchHostsBySysId} from "@/api/monitorcenter/hosts";
import {get_hostbymetric_sys, sys_metric_host_create, sys_metric_object_create} from "@/api/monitorcenter/metrics"; // waves directive

export default {
  name: 'ObjectMetricCreate',
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
        this.$refs['dataForm'].clearValidate()
      })
    },
    async handleAddRelation() {
      if (this.selectedRows.length === 0) {
        this.$message.warning("请至少选择一个主机");
        return;
      }
      console.log("子项目指标id")
      console.log(this.metricId)
      let objectIds = this.selectedRows.map(row => row.id);
      let metrics_id = this.metricId; // 设置为正确的 metrics_id
      let sys_id = this.sysInfo; // 设置为正确的 sys_id

      const postData = {
        metric_id: metrics_id,
        object_ids: objectIds,
        sys_id: sys_id
      };

      try {
        // 使用新的API方法
        const response = await sys_metric_object_create(postData);
        this.$message.success('关联关系创建成功');
      } catch (error) {
        this.$message.error('关联关系创建失败');
        console.error(error);
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
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    fetchObjects() {
      console.log("下面是系统id")
      console.log(this.sysInfo)
      if (this.sysInfo) {
        this.listLoading = true
        const system_id = this.sysInfo
        fetchObjBySys_id(system_id).then((response) => {
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
    getSortClass: function(key) {
      const sort = this.temp.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
