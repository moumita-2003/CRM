const { Sequelize } = require('sequelize');
require('dotenv').config();
const UserModel = require('./user');
const CustomerModel = require('./customer');
const OrderModel = require('./order');
const SegmentModel = require('./segment');
const CampaignModel = require('./campaign');
const CommLogModel = require('./communication_log');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'mini_crm',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

const User = UserModel(sequelize);
const Customer = CustomerModel(sequelize);
const Order = OrderModel(sequelize);
const Segment = SegmentModel(sequelize);
const Campaign = CampaignModel(sequelize);
const CommunicationLog = CommLogModel(sequelize);

// Associations
Customer.hasMany(Order, { foreignKey: 'customerId' });
Order.belongsTo(Customer, { foreignKey: 'customerId' });

Segment.belongsTo(User, { foreignKey: 'ownerId' });
Campaign.belongsTo(Segment, { foreignKey: 'segmentId' });
Campaign.belongsTo(User, { foreignKey: 'ownerId' });

CommunicationLog.belongsTo(Campaign, { foreignKey: 'campaignId' });
CommunicationLog.belongsTo(Customer, { foreignKey: 'customerId' });

async function init() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true }); // for dev; use migrations for prod
  console.log('DB synced');
}

module.exports = {
  sequelize,
  User,
  Customer,
  Order,
  Segment,
  Campaign,
  CommunicationLog,
  init
};

// If run directly, init DB
if (require.main === module) {
  init().catch(err => {
    console.error('Failed to init DB', err);
    process.exit(1);
  });
}
