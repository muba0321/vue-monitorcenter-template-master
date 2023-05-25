import request from '@/utils/request'

/**
 * 获取所以监控对象信息列表
 * */
export function fetchObjectList() {
  return request({
    url: '/objects/api/',
    method: 'get'
  })
}

/**
 * 新增监控对象信息列表
 * */
export function createObject(data) {
  return request({
    url: '/create-object-link-system/',
    method: 'post',
    data
  })
}

/**
 * 编辑监控对象信息列表
 * */
export function updateObject(id, data) {
  return request({
    url: 'monitor_objects/update/' + id + '/',
    method: 'patch',
    data
  })
}

/**
 * 删除监控对象信息列表
 * */
export function deleteObject(id) {
  return request({
    url: 'monitor_objects/delete/' + id + '/',
    method: 'delete'
  })
}

/**
 * 获取系统信息
 * */
export function fetchSysInfoList() {
  return request({
    url: '/sysinfo/api/',
    method: 'get'
  })
}

// 根据系统id获取主机信息
export function fetchObjBySys_id(system_id) {
  return request({
    url: 'monitor_objects/system/' + system_id + '/',
    method: 'get'
  })
}
