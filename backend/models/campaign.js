const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Campaign', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    segmentId: { type: DataTypes.BIGINT },
    ownerId: { type: DataTypes.BIGINT },
    messageTemplate: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('PENDING','SENT','COMPLETED'), defaultValue: 'PENDING' }
  }, { tableName: 'campaigns', timestamps: true });
};
