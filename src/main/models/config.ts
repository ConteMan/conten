import { DataTypes } from 'sequelize'

console.log('>>> model config')

const Config = global.sequelize?.define('config', {
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'configs',

  createdAt: 'created_at',
  updatedAt: 'updated_at',

  paranoid: true,
  deletedAt: 'deleted_at',
});

export default Config