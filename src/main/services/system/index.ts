import { checkTask } from '@main/services/task'

class System {
  /**
 * 定时任务
 */
  async schedule() {
    await checkTask()
    return true
  }
}

export default new System()
