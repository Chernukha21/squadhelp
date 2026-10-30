module.exports = (sequelize, DataTypes) => {
  const Catalog = sequelize.define(
    'Catalogs',
    {
      _id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING(24),
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      catalogName: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'Catalogs',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: false,
    },
  );

  return Catalog;
};
