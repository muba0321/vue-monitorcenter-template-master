import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  // {
  //   path: '/login',
  //   component: () => import('@/views/monitorcenter/login/index'),
  //   hidden: true
  // },

  {
    path: '/404',
    component: () => import('@/views/monitorcenter/404'),
    hidden: true
  },
  // {
  //   path: '/',
  //   name: 'combinedView',
  //   component: CombinedView
  // },
  // {
  //   path: '/combined',
  //   name: 'CombinedView',
  //   component: () => import('@/views/monitorcenter/CombinedView'),
  //   children: [
  //     {
  //       path: 'metric',
  //       name: 'Metric',
  //       component: () => import('@/views/monitorcenter/metric/metric'),
  //     },
  //     {
  //       path: 'host',
  //       name: 'Host',
  //       component: () => import('@/views/monitorcenter/host-info/HostInfo'),
  //     },
  //     {
  //       path: 'object',
  //       name: 'object',
  //       component: () => import('@/views/monitorcenter/object/object'),
  //     }
  //     ]
  // },
  {
    path: '/',
    component: Layout,
    redirect: '/monitor-center'
  },
  {
    path: '/monitor-center',
    component: Layout,
    redirect: '/monitor-center/metric',
    name: 'MonitorCenter',
    meta: { title: '监控平台管理', icon: 'el-icon-view' },
    children: [
      {
        path: 'object',
        name: 'Object',
        component: () => import('@/views/monitorcenter/object/object'),
        meta: { title: '监控对象', icon: 'table' }
      },
      {
        path: 'metric',
        name: 'Metric',
        component: () => import('@/views/monitorcenter/metric/metric.vue'),
        meta: { title: '监控指标', icon: 'tree' }
      },
      {
        path: 'host-info',
        name: 'HostInfo',
        component: () => import('@/views/monitorcenter/host-info/HostInfo'),
        meta: { title: '主机信息', icon: 'el-icon-s-grid' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
