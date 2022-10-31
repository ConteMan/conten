import { DataTypes } from 'sequelize'
import DB, { DBType } from '../app/db'

const Task = DB.getDB(DBType.SQLITE3)?.define('task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  detail: {
    type: DataTypes.JSON,
  },
  view_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  window_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expired_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  start_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: { // 0 进行中， 1 成功 2 失败，3 取消
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'tasks',

  createdAt: 'created_at',
  updatedAt: 'updated_at',

  paranoid: true,
  deletedAt: 'deleted_at',
})

export default Task
