import { DataTypes } from 'sequelize'
import DB, { DBType } from '../app/db'

const Log = DB.getDB(DBType.SQLITE3)?.define('log', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  level: {
    type: DataTypes.TINYINT,
    defaultValue: 2,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  desc: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  detail: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  info_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'logs',

  createdAt: 'created_at',
  updatedAt: 'updated_at',

  paranoid: true,
  deletedAt: 'deleted_at',
})

export default Log
