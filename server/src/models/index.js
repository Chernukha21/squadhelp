
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const configPath = env === 'production' ? path.join(__dirname, '..', '..', '..',
  'src/server/config/postgresConfig.json') : path.join(__dirname, '..',
  '/config/postgresConfig.json');
const config = require(configPath)[ env ];
const db = {};

const sequelize = new Sequelize(config.database, config.username,
  config.password, config);

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== basename) &&
      (file.slice(-3) === '.js');
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[ model.name ] = model;
  });

db[ 'Contests' ].belongsTo(db[ 'Users' ],
  { foreignKey: 'userId', sourceKey: 'id' });
db[ 'Contests' ].hasMany(db[ 'Offers' ],
  { foreignKey: 'contestId', targetKey: 'id' });

db[ 'Users' ].hasMany(db[ 'Offers' ],
  { foreignKey: 'userId', targetKey: 'id' });
db[ 'Users' ].hasMany(db[ 'Contests' ],
  { foreignKey: 'userId', targetKey: 'id' });
db[ 'Users' ].hasMany(db[ 'Ratings' ],
  { foreignKey: 'userId', targetKey: 'id' });

db[ 'Offers' ].belongsTo(db[ 'Users' ],
  { foreignKey: 'userId', sourceKey: 'id' });
db[ 'Offers' ].belongsTo(db[ 'Contests' ],
  { foreignKey: 'contestId', sourceKey: 'id' });
db[ 'Offers' ].hasOne(db[ 'Ratings' ],
  { foreignKey: 'offerId', targetKey: 'id' });

db[ 'Ratings' ].belongsTo(db[ 'Users' ],
  { foreignKey: 'userId', targetKey: 'id' });
db[ 'Ratings' ].belongsTo(db[ 'Offers' ],
  { foreignKey: 'offerId', targetKey: 'id' });


db.Chats.hasMany(db.Messages, {
  foreignKey: 'chat',
  sourceKey: '_id',
  as: 'messages',
});

db.Messages.belongsTo(db.Chats, {
  foreignKey: 'chat',
  targetKey: '_id',
  as: 'conversation',
});

db.Users.hasMany(db.Messages, {
  foreignKey: 'sender',
  sourceKey: 'id',
  as: 'sentMessages',
});

db.Messages.belongsTo(db.Users, {
  foreignKey: 'sender',
  targetKey: 'id',
  as: 'senderUser',
});

db.Chats.hasMany(db.ConversationParticipants, {
  foreignKey: 'chat',
  sourceKey: '_id',
  as: 'participantRows',
});

db.ConversationParticipants.belongsTo(db.Chats, {
  foreignKey: 'chat',
  targetKey: '_id',
  as: 'conversation',
});

db.Users.hasMany(db.ConversationParticipants, {
  foreignKey: 'userId',
  sourceKey: 'id',
  as: 'chatParticipations',
});

db.ConversationParticipants.belongsTo(db.Users, {
  foreignKey: 'userId',
  targetKey: 'id',
  as: 'user',
});

db.Users.hasMany(db.Catalogs, {
  foreignKey: 'userId',
  sourceKey: 'id',
  as: 'catalogs',
});

db.Catalogs.belongsTo(db.Users, {
  foreignKey: 'userId',
  targetKey: 'id',
  as: 'owner',
});

db.Catalogs.hasMany(db.CatalogChats, {
  foreignKey: 'catalogId',
  sourceKey: '_id',
  as: 'catalogLinks',
});

db.CatalogChats.belongsTo(db.Catalogs, {
  foreignKey: 'catalogId',
  targetKey: '_id',
  as: 'catalog',
});

db.Chats.hasMany(db.CatalogChats, {
  foreignKey: 'chatId',
  sourceKey: '_id',
  as: 'catalogLinks',
});

db.CatalogChats.belongsTo(db.Chats, {
  foreignKey: 'chatId',
  targetKey: '_id',
  as: 'chat',
});

db.Catalogs.belongsToMany(db.Chats, {
  through: db.CatalogChats,
  foreignKey: 'catalogId',
  otherKey: 'chatId',
  as: 'chats',
});

db.Chats.belongsToMany(db.Catalogs, {
  through: db.CatalogChats,
  foreignKey: 'chatId',
  otherKey: 'catalogId',
  as: 'catalogs',
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
