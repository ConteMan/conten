import { DataTypes } from 'sequelize'

const Subject = global.sequelize?.define('subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: { // 1 movie, 2 book, 3 music, 4 game, 5 other
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: { // 1 wish, 2 do，3 collect, 4 on_hold, 5 dropped
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  status_at: { // { wish_at: xxx, do_at: xxx, collect_at: xxx, on_hold_at: xxx, dropped_at: xxx }
    type: DataTypes.JSON,
    allowNull: true,
  },
  images: { // { default: xxx, medium: xxx, small: xxx }
    type: DataTypes.JSON,
    allowNull: true,
  },
  eps: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  collect_eps: { // 已看集数 [1, 2]
    type: DataTypes.JSON,
    allowNull: true,
  },
  douban_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  douban_data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  imdb_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bgm_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bgm_data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'subjects',

  createdAt: 'created_at',
  updatedAt: 'updated_at',

  paranoid: true,
  deletedAt: 'deleted_at',
})

export default Subject
