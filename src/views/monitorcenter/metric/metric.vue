<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="sysInfo" placeholder="请选择系统平台" style="width: 240px" class="filter-item"  filterable  @change="handleFilter">
        <el-option v-for="item in systemList" :key="item.id" :label="item.Sys_name" :value="item.id" />
      </el-select>
      <el-button  class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter()">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-guide" @click="toggleTable">
        视图切换
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-guide" @click="syncMetric">
        同步公共指标
      </el-button>
      <el-button
        class="filter-item"
        type="primary"
        @click="toggleMetrics"
      >
        <template v-if="isCommonMetrics">公共指标</template>
        <template v-else>自定义指标</template>
      </el-button>
    </div>
<!--    <el-loading :fullscreen="true" lock text="正在同步公共指标，请稍候..." :visible="syncing"></el-loading>-->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      class="table-fixed-layout"
      border
      highlight-current-row
      style="width: 100%;"
      v-show="showTable"
    >
      <!--指标ID-->
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <!--对象层级-->
      <el-table-column label="指标名称" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.metric_name }}</span>
        </template>
      </el-table-column>
      <!--对象名称-->
      <el-table-column label="指标简称" width="140px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.metric_ID }}</span>
        </template>
      </el-table-column>
      <!--创建时间-->
      <el-table-column label="指标类型" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.metric_type.display }}</span>
        </template>
      </el-table-column>
      <el-table-column label="指标描述" width="430px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.metric_desc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="采集方式" width="100px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.collect_type.display }}</span>
          </template>
      </el-table-column>
      <el-table-column label="判断方式" width="70px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.trigger_rule.display }}</span>
        </template>
      </el-table-column>
      <el-table-column label="指标阈值" width="100px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.Threshold + row.metric_unit }}</span>
          </template>
      </el-table-column>
      <!--操作-->
      <el-table-column label="操作" align="center" width="400" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row,systemList)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="deleteData(row,$index)">
            删除
          </el-button>
          <el-button type="primary" size="mini" @click="objectList(row)" :row="row">
            监控目标管理
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <BubbleView v-if="showBubbleView" :systems="systems"></BubbleView>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="metricsData"
      class="table-fixed-layout"
      border
      highlight-current-row
      style="width: 100%;"
      v-show="showBubbleView"
    >
      <!--指标ID-->
      <el-table-column  label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="指标名称" prop="metric_name" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.metric_name }}</span>
        </template>
      </el-table-column>
      <!--对象名称-->
      <el-table-column label="指标简称" prop="metric_ID" width="140px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.metric_ID }}</span>
        </template>
      </el-table-column>
      <el-table-column label="指标描述" prop="metric_desc" width="430px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.metric_desc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="指标关联模块数" prop="related_objects_count" width="140px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.related_objects_count }}</span>
        </template>
      </el-table-column>

      <el-table-column label="指标关联主机数" prop="related_hosts_count" width="140px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.related_hosts_count }}</span>
        </template>
      </el-table-column>

      <el-table-column label="指标主机覆盖率" prop="related_hosts_count" width="140px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.related_hosts_count }}</span>
        </template>
      </el-table-column>

      <el-table-column label="指标对象覆盖率" prop="object_coverage" width="140px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.object_coverage }}</span>
        </template>
      </el-table-column>
    </el-table>


<!--    <pagination v-show="total>0" :total="total" :page.sync=".page" :limit.sync=".limit" @pagination="handleFilter" />-->
<!--修改和新增指标的对话框-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item v-if="dialogStatus === 'create'" label="系统名" prop="sys_id">
          <el-select v-model="temp.sys_id" class="filter-item" placeholder="请选择">
            <el-option v-for="item in systemList" :key="item.id" :label="item.Sys_name" :value="item.id" />
          </el-select>
          <span style="color: red;">*</span>

        </el-form-item>
        <el-form-item label="监控指标ID">
          <div style="display: flex; align-items: center;">
          <el-input v-model="temp.metric_ID" placeholder="请输入监控指标ID"></el-input>
            <span style="color: red;">*</span>
          </div>
        </el-form-item>
        <el-form-item label="指标名称">
          <div style="display: flex; align-items: center;">
          <el-input v-model="temp.metric_name" placeholder="请输入指标名称"></el-input>
            <span style="color: red;">*</span>
          </div>
        </el-form-item>
        <el-form-item label="指标类型">
          <el-select v-model="temp.metric_type" placeholder="请选择指标类型">
            <el-option
              v-for="(item, index) in metricsTypeOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <span style="color: red;">*</span>
        </el-form-item>
        <el-form-item label="指标描述">
          <div style="display: flex; align-items: center;">
          <el-input v-model="temp.metric_desc" placeholder="请输入指标描述"></el-input>
          <span style="color: red;">*</span>
          </div>
        </el-form-item>
        <el-form-item label="阈值">
          <div style="display: flex; align-items: center;">
          <el-input-number v-model="temp.Threshold" :min="0"></el-input-number>
          <span style="color: red;">*</span>
          </div>
        </el-form-item>
        <el-form-item label="指标单位">
          <el-input v-model="temp.metric_unit" placeholder="请输入指标单位"></el-input>
        </el-form-item>
        <el-form-item label="指标采集类型">
          <el-select v-model="temp.collect_type" placeholder="请选择指标采集类型">
            <el-option
              v-for="(item, index) in collectTypeOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <span style="color: red;">*</span>
        </el-form-item>
        <el-form-item label="触发规则">
          <el-select v-model="temp.trigger_rule" placeholder="请选择触发规则">
            <el-option
              v-for="(item, index) in triggerRuleOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <span style="color: red;">*</span>
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
<!--对监控对象目标的显示和处理页面-->
    <el-dialog :title="textMap[objectDialogStatus]" :visible.sync="objectDialogFormVisible">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="对象数据" name="objectData" v-if="showObjectHost">
          <object-metric :sys-info="currentSysId" :metric-id="currentMetricId" />
        </el-tab-pane>
        <el-tab-pane label="主机数据" name="hostData"  :show-create-time="false" v-if="showObjectHost">
          <host-info :sys-info="currentSysId" :metric-id="currentMetricId" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>

</template>
<script>
import {
  createMetrics, deletemetrcis,
  fetchMetricsBySysId,
  fetchMetricsList, fetchRelateData, syncCommonMetrics, updatemetrics,
} from '@/api/monitorcenter/metrics'
import BubbleView from './BubbleView.vue'
// import waves from '@/directive/waves'
import HostInfo from '@/components/monitorcenter/hostMetric.vue';
import ObjectMetric from "@/components/monitorcenter/objectMetric.vue";
import {fetchSysInfoList} from "@/api/monitorcenter/sysinfo";

export default {
  name: 'Object',
  components: {
    HostInfo,
    ObjectMetric,
    BubbleView,
  },
  // directives: { waves },
  filters: {
  },
  data() {
    return {
      metricsData: [],
      showTable: true,
      showBubbleView: false,
      tableKey: 0,
      list: null,
      systemList: [],
      sysInfo: 1,
      metricId: null,
      total: 0,
      listLoading: true,
      showReviewer: false,
      isCommonMetrics: true,  // 新添加的状态
      syncing: false,
      // 临时弹窗表单
      temp: {
        metric_ID: "",
        metric_name: "",
        metric_type: null,
        metric_desc: "",
        Threshold: null,
        metric_unit: "",
        collect_type: null,
        trigger_rule: "",
        sys_id: null
      },
      systems: [
        { title: '系统1', content: '内容1' },
        // ...
        { title: '系统9', content: '内容9' }
      ],
      dialogFormVisible: false,
      objectDialogFormVisible: false,
      objectDialogStatus: false,
      showObjectHost: false,
      currentSysId: null,
      currentMetricId: null,
      activeTab: 'objectData',
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增',
      },
      dialogPvVisible: false,
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        sys_id: [
          { required: true, message: '请选择系统名', trigger: 'change' },
        ],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      metricsTypeOptions: [
        { label: "系统层级", value: 0 },
        { label: "自定义", value: 1 },
        { label: "模块层级", value: 2 },
      ],
      collectTypeOptions: [
        { label: "Agent", value: 0 },
        { label: "插件", value: 1 },
        { label: "脚本", value: 2 },
      ],
      triggerRuleOptions: [
        { label: ">", value: "greater" },
        { label: "<", value: "less" },
        { label: "=", value: "equal" },
        { label: "≠", value: "unequal" },
        { label: "≥", value: "greater_equal" },
        { label: "≤", value: "less_equal" },
      ]
    }
  },
  created() {
    this.getList()
    this.getSysInfoList()
  },
  methods: {
    showRelateData() {
      const metricType = this.isCommonMetrics ? 0 : 1;
      const system_id = this.sysInfo
      fetchRelateData(system_id, metricType).then(response => {
        this.metricsData = response.data.data;
      });
      console
    },
    getList() {
      this.listLoading = true
      const metricType = this.isCommonMetrics ? '系统层级' : '自定义';
      fetchMetricsList(metricType).then(response => {
        this.list = response.data
        // this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    toggleMetrics() {
      this.isCommonMetrics = !this.isCommonMetrics;

      if (this.sysInfo) {
        // 如果 this.sysInfo 有值，调用 fetchMetrics 方法
        this.fetchMetrics().then(response => {
          this.list = response.data
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      } else {
        // 如果 this.sysInfo 没有值，调用 getList 方法
        this.getList().then(response => {
          this.list = response.data
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      }
    },
    syncMetric() {
      this.syncing = true // 开始同步，显示加载指示器
      syncCommonMetrics()
        .then(() => {
          this.$message.success('公共指标同步成功')
        })
        .catch(error => {
          this.$message.error('公共指标同步失败: ' + error.message)
        })
        .finally(() => {
          this.syncing = false // 同步结束，隐藏加载指示器
        })
    },
    toggleTable() {
      this.showTable = !this.showTable; // 切换 el-table 的显示状态
      this.showBubbleView = !this.showBubbleView;

      this.showRelateData().then(response => {
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      });
      console.log('这是metricData的值')
      this.$nextTick(() => {
        // DOM 现在已经更新了
        // `this` 绑定到当前实例
        this.tableKey = Math.random() // 这会触发表格的重新渲染
      })
    },
    objectList(row) {
      this.currentSysId = this.sysInfo;
      this.currentMetricId = row.id;
      if (!this.sysInfo) {
        this.$message({
          message: '请选择系统',
          type: 'warning',
          duration: 2000
        })
        return
      }
      this.temp = Object.assign({}, row)
      this.objectDialogStatus = 'list'
      this.objectDialogFormVisible = true
      this.showObjectHost = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    fetchMetrics() {
      const metric_type = this.isCommonMetrics ? '0' : '1';
      if (this.sysInfo) {
        this.listLoading = true
        const system_id = this.sysInfo
        fetchMetricsBySysId(system_id, metric_type).then((response) => {
          this.list = response.data

          setTimeout(() => {
            this.listLoading = false
          }, 3 * 1000)
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
      this.fetchMetrics()
      this.showRelateData()
      this.getSysInfoList().then(() => {
        // 数据加载完成后，设置sysInfo的值为1
        if (!this.systemList.find(item => item.id === this.sysInfo)) {
          this.sysInfo = null;  // 如果系统列表中没有ID为1的项，清空选中的项
        }
      })
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
        sys_id: this.sysInfo,
        object_type: '',
        object_name: '',
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
        console.log("这是系统id")
        console.log(this.temp.sys_id)
        if (valid) {
          createMetrics(this.temp).then(() => {
            this.dialogFormVisible = false
            this.fetchMetrics()
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
          updatemetrics(this.temp.id, tempData).then(() => {
            this.dialogFormVisible = false
            this.fetchMetrics()
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
    deleteData(row, index) {
      if (!this.sysInfo) {
        this.$message({
          message: '请选择系统',
          type: 'warning',
          duration: 2000
        })
        return
      }
      deletemetrcis(row.id).then(() => {
        this.list.splice(index, 1)
        this.fetchMetrics()
        this.$notify({
          title: 'Success',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    getSortClass: function(key) {
      const sort = this.temp.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
<style>
.table-fixed-layout {
  table-layout: fixed;
}
</style>
