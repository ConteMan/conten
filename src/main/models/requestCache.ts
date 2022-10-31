import { DataTypes } from 'sequelize'
import DB, { DBType } from '../app/db'

const RequestCache = DB.getDB(DBType.SQLITE3)?.define('requestCache', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSON,
  },
  expired: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'request_cache',

  createdAt: 'created_at',
  updatedAt: 'updated_at',

  paranoid: false,
})

export default RequestCache
