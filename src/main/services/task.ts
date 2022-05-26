import { Op } from 'sequelize'
import TaskModel from '@main/models/task'
import { TASK_STATUS } from '@main/enums/taptapEnum'

/**
 * 获取任务信息
 * @param name - 任务名称
 */
export async function getTask(name: string) {
  try {
    const task = await TaskModel.findOne({
      where: {
        name,
      },
    })
    return task?.toJSON()
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> getTask error: ', e)
    return false
  }
}

/**
 * 添加任务
 * @param name - 任务名称
 * @param data - 任务数据
 */
export async function addTask(name: string, data: any) {
  try {
    const { detail, view_name, window_name, expired_at } = data
    await TaskModel.create({
      name,
      detail,
      view_name,
      window_name,
      expired_at,
      start_at: new Date(),
    })
    return true
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> addTask error: ', e)
    return false
  }
}

/**
 * 更新任务
 * @param name - 任务名称
 * @param data - 任务数据
 */
export async function updateTask(name: string, data: any) {
  try {
    const task = await TaskModel.findOne({
      where: {
        name,
      },
    })
    if (task) {
      await task.update(data)
      return true
    }
    return false
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> updateTask error: ', e)
    return false
  }
}

/**
 * 检查任务，清理过期未完成
 */
export async function checkTask() {
  try {
    const { count, rows } = await TaskModel.findAndCountAll({
      where: {
        expired_at: {
          [Op.lt]: new Date(),
        },
        status: 0,
      },
      raw: true,
    })

    if (count) {
      rows.forEach(async (task: any) => {
        // eslint-disable-next-line no-console
        console.log('>>> checkTask item', task)
        await updateTask(task.name, {
          status: TASK_STATUS.FAIL,
          end_at: new Date(),
        })
        await global.wins?.[task.window_name].close()
      })
    }

    // eslint-disable-next-line no-console
    console.log('>>> checkTask', count)

    return {
      count,
    }
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> checkTask error: ', e)
    return {
      count: 0,
    }
  }
}
