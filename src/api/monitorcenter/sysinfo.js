import request from '@/utils/request'

// 获取系统信息
export function fetchSysInfoList() {
  return request({
    url: '/sysinfo/api/',
    method: 'get'
  })
}


export function sync_thanos_host() {
  return request({
    url: '/sync/hosts/',
    method: 'post'
    }
  )
}

export function sync_thanos_objects() {
  return request({
      url: '/sync/objects/',
      method: 'post'
    }
  )
}

export function sync_thanos_xcobjects() {
  return request({
      url: '/sync/xcobjects/',
      method: 'post'
    }
  )
}

export function sync_thanos_system() {
  return request({
      url: '/sync/system/',
      method: 'post'
    }
  )
}
