import { DataTypes } from 'sequelize'

console.log('>>> model module')

const Module = global.sequelize?.define('module', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  config: {
    type: DataTypes.JSON
  },
  user: {
    type: DataTypes.JSON
  },
  user_updated_at: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'modules',

  createdAt: 'created_at',
  updatedAt: 'updated_at',

  paranoid: true,
  deletedAt: 'deleted_at',
});

export default Module