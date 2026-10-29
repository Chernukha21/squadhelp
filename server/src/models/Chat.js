module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define(
    'Chats',
    {
      _id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING(24),
      },
    },
    {
      tableName: 'Chats',
      timestamps: true,
    }
  );

  return Chat;
};
