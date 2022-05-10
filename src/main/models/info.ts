import { DataTypes } from 'sequelize'

const Info = global.sequelize?.define('info', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  platform_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data_origin: {
    type: DataTypes.TEXT,
  },
  data: {
    type: DataTypes.JSON,
  },
  is_public: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
  },
  info_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'infos',

  createdAt: 'created_at',
  updatedAt: 'updated_at',

  paranoid: true,
  deletedAt: 'deleted_at',
})

export default Info
