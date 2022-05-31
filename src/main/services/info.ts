import InfoModel from '@main/models/info'

/**
 * 批量新建或更新
 * @param infos - 更新数据
 */
export async function bulkCreateOrUpdate(infos: any[] = []) {
  try {
    if (!infos.length)
      return false
    for (const item of infos) {
      const [res, created] = await InfoModel.findOrCreate({
        where: {
          slug: item.slug,
        },
        defaults: item,
      })
      if (!created) {
        res.set(item)
        await res.save()
      }
    }
    return true
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> bulkCreateOrUpdate', e)
  }
}

/**
 * 列表
 * @param type - 类型 platform
 * @param page - 页数
 * @param pageSize - 分页大小
 */
export async function list(type = '', page = 1, pageSize = 10) {
  try {
    const offset = (page - 1) * pageSize
    let where = {}
    if (type) {
      where = {
        ...where,
        platform: type,
      }
    }

    const { count, rows } = await InfoModel.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      order: [
        ['info_at', 'DESC'],
      ],
    })
    const dealRows = rows.map((item) => {
      return item.toJSON()
    })
    return {
      count,
      rows: dealRows,
    }
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> info >> list', e)
    return []
  }
}
