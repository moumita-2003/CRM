const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Segment', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    ownerId: { type: DataTypes.BIGINT },
    ruleJson: { type: DataTypes.JSON },
    audienceCount: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, { tableName: 'segments', timestamps: true });
};
