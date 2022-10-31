import { DataTypes } from 'sequelize'
import DB, { DBType } from '../app/db'

const Config = DB.getDB(DBType.SQLITE3)?.define('config', {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  des: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'string',
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  group_key: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'configs',

  createdAt: 'created_at',
  updatedAt: 'updated_at',

  paranoid: true,
  deletedAt: 'deleted_at',
})

export default Config
