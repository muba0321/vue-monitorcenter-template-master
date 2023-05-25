import request from '@/utils/request'

/**
 * 获取监控对象列表
 * */
export function fetchMetricsList(metricType) {
  return request({
    url: '/metrics/',
    method: 'get',
    params: {
      metric_type: metricType
    }
  })
}
/***
 根据指定系统id获取指标信息
 * **/
export function fetchMetricsBySysId(sys_id, metric_type) {
  return request({
    url: '/metrics/sysinfo/'+ sys_id +'/'+ metric_type +'/',
    method: 'get'
  })
}

// 创建指标信息关联系统
export function createMetrics(data) {
  return request({
    url: '/metrics/sysinfo/',
    method: 'post',
    data
  })
}

export function fetchRelateData(sys_id, metric_type) {
  return request({
    url: 'metrics_summary/'+ sys_id +'/'+ metric_type +'/',
    method: 'get'
  })
}
//同步公共指标
export function syncCommonMetrics() {
  return request({
    url: '/metrics/add_common_metric_to_all_sys/',
    method: 'post'
  })
}

// 删除指标信息
export function deletemetrcis(id) {
  return request({
    url: `/metrics/${id}/`,
    method: 'delete'
  })
}

// 更新指标信息
export function updatemetrics(id, data) {
  return request({
    url: `/metrics/${id}/`,
    method: 'patch',
    data
  })
}
//创建指定系统和指标id以后与主机的关联关系
export function sys_metric_host_create(data) {
  return request({
    url: `metrics/create_with_hosts/`,
    method: 'post',
    data
  })
}
//根据指定的系统和指标id查询到该指标的关联的主机信息
export function get_hostbymetric_sys(sys_id, id) {
  return request({
    url: `/sys_metric_hosts/${sys_id}/${id}/`,
    method: 'get'
  })
}
//删除指定的系统和指标下与对应的主机信息的关联关系
export function deleteHostsMetrics(data, metric_id, sys_id) {
  return request({
    url: `/remove_hostByMetric_Sys/${metric_id}/${sys_id}/`,
    method: 'delete',
    data
  })
}


//根据指定的系统和指标id查询到该指标的关联的主机信息
export function get_objectByMetric_sys(sys_id, id) {
  return request({
    url: `/sys_metric_objects/${sys_id}/${id}/`,
    method: 'get'
  })
}

//删除指定的系统和指标下与对应的对象模块信息的关联关系
export function deleteObjectsMetrics(data, metric_id, sys_id) {
  return request({
    url: `/remove_objectByMetric_Sys/${metric_id}/${sys_id}/`,
    method: 'delete',
    data
  })
}
//创建指定系统和指标id以后与对象模块的关联关系
export function sys_metric_object_create(data) {
  return request({
    url: `/metrics_object_relation/`,
    method: 'post',
    data
  })
}
