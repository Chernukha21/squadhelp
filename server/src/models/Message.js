module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'Messages',
    {
      _id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING(24),
      },
      sender: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      body: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      chat: {
        allowNull: false,
        type: DataTypes.STRING(24),
      },
    },
    {
      tableName: 'Messages',
      timestamps: true,
    },
  );

  return Message;
};
