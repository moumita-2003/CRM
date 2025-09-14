const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Order', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.STRING, unique: true },
    customerId: { type: DataTypes.BIGINT },
    amount: { type: DataTypes.DECIMAL(12,2) },
    items: { type: DataTypes.JSON },
    createdAtCustom: { type: DataTypes.DATE, field: 'created_at' }
  }, { tableName: 'orders', timestamps: false });
};
