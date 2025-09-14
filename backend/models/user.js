const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    googleId: { type: DataTypes.STRING, unique: true },
    email: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING }
  }, {
    tableName: 'users',
    timestamps: true
  });
};
