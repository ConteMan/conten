import MigrationModel from '@main/models/migration'
import LogModel from '@main/models/log'
import { LevelEnum } from '@main/enums/logEnum'
import { DataTypes } from 'sequelize'

type Migration = Record<string, any>
const migrations: Migration = {
  log_2022_06_14_001: log_2022_06_14_001(),
  log_2022_06_02_001: log_2022_06_02_001(),
}

/**
 * 条目表增加 info_at 字段
 */
async function log_2022_06_14_001() {
  try {
    const queryInterface = await LogModel.sequelize?.getQueryInterface()

    if (queryInterface) {
      await queryInterface.addColumn('subjects', 'info_at', {
        type: DataTypes.DATE,
        defaultValue: new Date(),
      })
    }
    return true
  }
  catch (e) {
    return false
  }
}

/**
 * 日志表增加 level 字段
 */
async function log_2022_06_02_001() {
  try {
    const queryInterface = await LogModel.sequelize?.getQueryInterface()

    if (queryInterface) {
      await queryInterface.addColumn('logs', 'level', {
        type: DataTypes.TINYINT,
        defaultValue: LevelEnum.INFO,
      })
    }
    return true
  }
  catch (e) {
    return false
  }
}

/**
 * 执行迁移
 * - 查询数据库中的所有已执行的迁移，排除已执行
 */
export async function migrate() {
  try {
    const migrationDeals = await MigrationModel.findAll({
      attributes: ['name'],
      raw: true,
    })
    const migrationDealNames = migrationDeals.map((item: any) => {
      return item.name
    })

    const migrationNames = Object.keys(migrations)

    // eslint-disable-next-line no-console
    console.log('>>> migrate:', migrationDealNames, migrationNames)

    if (migrationDeals.length === migrationNames.length)
      return true

    migrationNames.forEach(async (item: string) => {
      if (!migrationDealNames.includes(item)) {
        await migrations[item]
        await MigrationModel.create({
          name: item,
          status: 1,
        })
      }
    })
    return true
  }
  catch (e) {
    return false
  }
}
