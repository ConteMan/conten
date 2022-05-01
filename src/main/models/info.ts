import { DataTypes } from 'sequelize'

const Info = global.sequelize?.define('info', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  type_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data: {
    type: DataTypes.JSON,
  }
}, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',

  paranoid: true,
  deletedAt: 'deleted_at',
});

export default Info