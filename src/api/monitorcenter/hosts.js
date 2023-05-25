import request from '@/utils/request'

// 获取所有主机信息列表
export function fetchHostInfoList(query) {
  return request({
    url: '/hostinfo/api/',
    method: 'get',
    params: query
  })
}

// 根据id获取主机信息记录
export function fetchHostInfo(hostInfoId) {
  return request({
    url: `/hostdetail/api/${hostInfoId}/`,
    method: 'get'
  })
}

// 获取指定系统id的主机信息
export function fetchHostsBySysId(sys_id) {
  return request({
    url: `/hosts_by_sys_id/${sys_id}/`,
    method: 'get'
  })
}

// 创建主机信息
export function createHostInfo(data) {
  return request({
    url: 'create_host_and_sys_mapping/',
    method: 'post',
    data
  })
}

// 更新主机信息
export function updateHostInfo(hostInfoId, data) {
  return request({
    url: `/hostdetail/api/${hostInfoId}/`,
    method: 'patch',
    data
  })
}

// 删除主机信息
export function deleteHostInfo(host_id) {
  return request({
    url: `/hostdetail/api/${host_id}/`,
    method: 'delete'
  })
}

// // 转换对象模块id为模块名
// export async function getModuleNameById(id) {
//   try {
//     const { data } = await fetchObject(id);
//     return data.data.object_name;
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// }
