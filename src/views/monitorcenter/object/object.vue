<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="sysInfo" placeholder="请选择系统平台"  style="width: 240px" class="filter-item" filterable @change="handleFilter">
        <el-option v-for="item in systemList" :key="item.id" :label="`${item.Sys_name} (${item.Sys_abbreviation})`" :value="item.id" />
      </el-select>
      <el-button  class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter()">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
<!--      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="syncObject">-->
<!--        同步-->
<!--      </el-button>-->
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      highlight-current-row
      style="width: 100%;"
    >
      <!--对象层级-->
      <el-table-column label="序号"  sortable="custom" align="center" width="80">
        <template v-slot="{ row, $index }">
          <span>{{ $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="对象层级" width="220px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.object_type.display }}</span>
        </template>
      </el-table-column>
      <!--对象名称-->
      <el-table-column label="对象名称" width="240px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.object_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="对象描述" width="240px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.object_desc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="信创服务" width="240px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.is_xc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建方式" width="240px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.create_type }}</span>
        </template>
      </el-table-column>
      <!--创建时间-->
<!--      <el-table-column v-if="showCreateTime" label="创建时间" width="230px" align="center">-->
<!--        <template slot-scope="{row}">-->
<!--          <span>{{ row.update_time }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <!--操作-->
      <el-table-column label="操作" align="center" width="400" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row,systemList)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="deleteData(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

<!--    <pagination v-show="total>0" :total="total" :page.sync=".page" :limit.sync=".limit" @pagination="handleFilter" />-->

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item v-if="dialogStatus === 'create'" label="系统名" prop="sys_id">
          <el-select v-model="temp.system_id" class="filter-item" placeholder="请选择"  filterable>
            <el-option v-for="item in systemList" :key="item.id" :label="item.Sys_name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="对象类型" prop="object_type">
          <el-select v-model="temp.object_type" placeholder="请选择指标类型">
            <el-option
              v-for="(item, index) in objectTypeOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="对象名称" prop="object_name">
            <el-input v-model="temp.object_name"  placeholder="必填， 示例：thanos_cmdb "/>
        </el-form-item>
        <el-form-item label="对象描述" prop="object_name">
          <el-input v-model="temp.object_desc" placeholder="非必填， 示例：Thnaos的cmdb服务"/>
        </el-form-item>
        <el-form-item label="信创服务" prop="object_type">
          <el-select v-model="temp.is_xc" placeholder="请选择指标类型">
            <el-option
              v-for="(item, index) in XcTypeOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
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
  fetchObjectList,
  fetchSysInfoList,
  createObject,
  updateObject,
  deleteObject,
  fetchObjBySys_id
} from '@/api/monitorcenter/object'
// import waves from '@/directive/waves'
import {fetchHostsBySysId} from "@/api/monitorcenter/hosts";
import {sync_thanos_host, sync_thanos_objects, sync_thanos_xcobjects} from "@/api/monitorcenter/sysinfo"; // waves directive

export default {
  name: 'Object',
  // directives: { waves },
  filters: {
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      systemList: [],
      sysInfo: 1,
      showDialog: false,
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
        object_desc: '',
        is_xc: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
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
      ],
      XcTypeOptions: [
        { label: "信创服务", value: "True" },
        { label: "非信创服务", value: "False" },
      ]
    }
  },
  created() {
    this.fetchObjects(),
    this.getSysInfoList()
  },
  methods: {
    getList() {
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
    handleClose(done) {
      this.showDialog = false;
      done();
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
        system_id: this.sysInfo,
        object_type: '',
        object_name: ''
      }
    },
    syncObject() {
      sync_thanos_objects(),
      sync_thanos_xcobjects().then(() => {
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
      this.$set(this.temp, 'object_type', row.object_type.value);
      console.log(row.is_xc);
      this.$set(this.temp, 'is_xc', row.is_xc);
      this.dialogStatus = 'update';
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
    deleteData(row, index) {if (!this.sysInfo) {
      this.$message({
        message: '请选择系统',
        type: 'warning',
        duration: 2000
      })
      return
    }

      console.log(index)
      deleteObject(row.id).then(() => {
        this.list.splice(index, 1)
        this.$notify({
          title: 'Success',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
      })
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
