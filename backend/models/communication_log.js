const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('CommunicationLog', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    campaignId: { type: DataTypes.BIGINT },
    customerId: { type: DataTypes.BIGINT },
    vendorMessageId: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('SENT','FAILED','PENDING'), defaultValue: 'PENDING' },
    attempt: { type: DataTypes.INTEGER, defaultValue: 0 },
    payload: { type: DataTypes.JSON }
  }, { tableName: 'communication_log', timestamps: true });
};
