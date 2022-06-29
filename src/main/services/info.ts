import InfoModel from '@main/models/info'
import type { Info } from '@main/types/info'

/**
 * 新建或更新
 * @param data - 数据
 */
export async function createOrUpdate(data: Info) {
  try {
    const [res, created] = await InfoModel.findOrCreate({
      where: {
        slug: data.slug,
      },
    })
    res.set(data)
    await res.save()
    return { res, created }
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> Services Info >> createOrUpdate', e)
    return false
  }
}

/**
 * 批量新建或更新
 * @param infos - 数据
 */
export async function bulkCreateOrUpdate(infos: any[] = []) {
  try {
    if (!infos.length)
      return false

    let createdCount = 0
    let updatedCount = 0
    for (const item of infos) {
      const [res, created] = await InfoModel.findOrCreate({
        where: {
          slug: item.slug,
        },
        defaults: item,
      })
      if (created) {
        createdCount++
      }
      else {
        res.set(item)
        await res.save()
        updatedCount++
      }
    }

    return { createdCount, updatedCount }
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> Services Info >> bulkCreateOrUpdate', e)
    return false
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
        platform: type.split(','),
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
    console.log('>>> Services Info >> list', e)
    return []
  }
}

/**
 * 操作 - 删除、收集等
 * @param action - 操作 delete | collect
 * @param id - ID
 */
export async function action(action: 'delete' | 'collect' = 'delete', id: number) {
  try {
    if (action === 'delete') {
      if (!id)
        return false

      const item = await InfoModel.findByPk(id)
      if (!item)
        return false

      item.destroy()
      return await item.save()
    }
    return true
  }
  catch (e) {
    return false
  }
}
