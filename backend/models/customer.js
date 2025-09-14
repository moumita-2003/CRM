const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Customer', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    customerId: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    lastVisit: { type: DataTypes.DATE },
    totalSpend: { type: DataTypes.DECIMAL(12,2), defaultValue: 0.0 },
    visits: { type: DataTypes.INTEGER, defaultValue: 0 },
    metadata: { type: DataTypes.JSON }
  }, { tableName: 'customers', timestamps: true });
};
