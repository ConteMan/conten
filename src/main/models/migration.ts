import { DataTypes } from 'sequelize'
import DB, { DBType } from '../app/db'

const Migration = DB.getDB(DBType.SQLITE3)?.define('migration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0, // 1: 已执行, 2: 已回滚
  },
}, {
  tableName: 'migrations',

  createdAt: 'created_at',
  updatedAt: 'updated_at',

  paranoid: false,
})

export default Migration
