module.exports = (sequelize, DataTypes) => {
  const CatalogChat = sequelize.define(
    'CatalogChats',
    {
      catalogId: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING(24),
      },
      chatId: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING(24),
      },
    },
    {
      tableName: 'CatalogChats',
      timestamps: false,
    },
  );

  return CatalogChat;
};
