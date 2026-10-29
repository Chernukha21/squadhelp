module.exports = (sequelize, DataTypes) => {
  const ConversationParticipant = sequelize.define(
    'ConversationParticipants',
    {
      chat: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING(24),
      },
      userId: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      blackList: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      favoriteList: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'ConversationParticipants',
      timestamps: false,
    }
  );

  return ConversationParticipant;
};
