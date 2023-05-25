<template>
  <div>
    <el-container>
      <el-aside width="200px" class="sidebar">
        <el-menu
          router
          default-active="1"
          background-color="rgb(24, 29, 41)"
          text-color="#fff"
          active-text-color="#409eff"
          collapse-transition
          :collapse="isCollapse"
        >
          <el-menu-item index="1" :route="{ name: 'Metric' }">
            <i class="el-icon-s-custom"></i>
            <span slot="title">监控指标</span>
          </el-menu-item>
          <el-menu-item index="2" :route="{ name: 'Host' }">
            <i class="el-icon-s-home"></i>
            <span slot="title">监控主机</span>
          </el-menu-item>
          <el-menu-item index="3" :route="{ name: 'Object' }">
            <i class="el-icon-s-flag"></i>
            <span slot="title">监控对象</span>
          </el-menu-item>
        </el-menu>
        <el-button
          class="collapse-btn"
          icon="el-icon-arrow-left"
          @click="isCollapse = !isCollapse"
        ></el-button>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isCollapse: false,
    };
  },
};
</script>

<style scoped>
.sidebar {
  background-color: rgb(24, 29, 41);
  position: relative;
}

.collapse-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgb(24, 29, 41);
  border: none;
  color: #fff;
}
</style>
