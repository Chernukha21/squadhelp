module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction =
      await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable(
        'Chats',
        {
          _id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING(24),
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal(
              'CURRENT_TIMESTAMP'
            ),
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal(
              'CURRENT_TIMESTAMP'
            ),
          },
        },
        { transaction }
      );

      await queryInterface.createTable(
        'Messages',
        {
          _id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING(24),
          },
          sender: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
              model: 'Users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          body: {
            allowNull: false,
            type: Sequelize.TEXT,
          },
          chat: {
            allowNull: false,
            type: Sequelize.STRING(24),
            references: {
              model: 'Chats',
              key: '_id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal(
              'CURRENT_TIMESTAMP'
            ),
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal(
              'CURRENT_TIMESTAMP'
            ),
          },
        },
        { transaction }
      );

      await queryInterface.createTable(
        'ConversationParticipants',
        {
          chat: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING(24),
            references: {
              model: 'Chats',
              key: '_id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          userId: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.INTEGER,
            references: {
              model: 'Users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          blackList: {
            allowNull: false,
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          favoriteList: {
            allowNull: false,
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
        },
        { transaction }
      );

      await queryInterface.createTable(
        'Catalogs',
        {
          _id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING(24),
          },
          userId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
              model: 'Users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          catalogName: {
            allowNull: false,
            type: Sequelize.TEXT,
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal(
              'CURRENT_TIMESTAMP'
            ),
          },
        },
        { transaction }
      );

      await queryInterface.createTable(
        'CatalogChats',
        {
          catalogId: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING(24),
            references: {
              model: 'Catalogs',
              key: '_id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          chatId: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING(24),
            references: {
              model: 'Chats',
              key: '_id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async queryInterface => {
    const transaction =
      await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable(
        'CatalogChats',
        { transaction }
      );

      await queryInterface.dropTable(
        'ConversationParticipants',
        { transaction }
      );

      await queryInterface.dropTable(
        'Messages',
        { transaction }
      );

      await queryInterface.dropTable(
        'Catalogs',
        { transaction }
      );

      await queryInterface.dropTable(
        'Chats',
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
