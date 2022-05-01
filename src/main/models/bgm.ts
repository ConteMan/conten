import { DataTypes } from 'sequelize'

console.log('>>> model bgm')

const Bgm = global.sequelize?.define('bgm', {
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'bgm',

  createdAt: 'created_at',
  updatedAt: 'updated_at',

  paranoid: true,
  deletedAt: 'deleted_at',
});

export default Bgm