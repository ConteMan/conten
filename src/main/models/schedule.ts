import { DataTypes } from 'sequelize'

const Schedule = global.sequelize?.define('schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  crontab: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  next_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  enable: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'schedules',

  createdAt: 'created_at',
  updatedAt: 'updated_at',

  paranoid: true,
  deletedAt: 'deleted_at',
})

export default Schedule
