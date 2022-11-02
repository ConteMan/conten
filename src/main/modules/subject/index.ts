import SubjectModel from '@main/models/subject'

export type SubjectPlatforms = 'douban' | 'bgm'
export type SubjectMode = 'increment' | 'full'

export type SubjectType = 'movie' | 'book' | 'music'
export type SubjectStatus = 'collect' | 'do' | 'wish'
export interface SubjectSyncParams {
  type: SubjectType
  status: SubjectStatus
  startPage: number
  endPage: number
}

export interface ListArgsType {
  type: SubjectType
  status: SubjectStatus
  page: number
  pageSize: number
}

class Subject {
  static types() {
    return [
      'movie',
      'book',
      'music',
    ]
  }

  static statuses() {
    return [
      'collect',
      'do',
      'wish',
    ]
  }

  /**
   * 条目列表
   * @param type - 类型，movie, book, music
   * @param status - 状态，wish, do, collect
   * @param page - 页码
   * @param pageSize - 页大小
   */
  static async list(args: ListArgsType = { type: 'book', status: 'do', page: 1, pageSize: 15 }) {
    try {
      const { type, status, page, pageSize } = args
      const res = await SubjectModel.findAndCountAll({
        where: {
          type,
          status,
        },
        offset: (page - 1) * pageSize,
        limit: pageSize,
        order: [
          ['info_at', 'DESC'],
        ],
        raw: true,
      })
      return res
    }
    catch (e) {
      return false
    }
  }
}

export default Subject
