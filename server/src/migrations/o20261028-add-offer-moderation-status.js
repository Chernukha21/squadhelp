module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.addColumn(
        { tableName: 'Offers', schema: 'public' },
        'moderationStatus',
        {
          type: Sequelize.ENUM('pending', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'approved',
        },
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE public."Offers"
         ALTER COLUMN "moderationStatus" SET DEFAULT 'pending';`,
        { transaction }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn(
        { tableName: 'Offers', schema: 'public' },
        'moderationStatus',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS public."enum_Offers_moderationStatus";',
        { transaction }
      );
    });
  },
};
