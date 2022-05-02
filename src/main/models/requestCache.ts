import { DataTypes } from 'sequelize'

const RequestCache = global.sequelize.define('requestCache', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data: {
    type: DataTypes.JSON,
  },
  expired: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 'request_cache',

  createdAt: 'created_at',
  updatedAt: 'updated_at',

  paranoid: false,
});

export default RequestCache
