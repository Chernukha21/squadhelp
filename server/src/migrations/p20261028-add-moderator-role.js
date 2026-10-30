module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TYPE public."enum_Users_role"
       ADD VALUE IF NOT EXISTS 'moderator';`,
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async transaction => {
      const options = { transaction };

      await queryInterface.sequelize.query(
        'LOCK TABLE public."Users" IN ACCESS EXCLUSIVE MODE;',
        options,
      );

      const [moderators] = await queryInterface.sequelize.query(
        `SELECT "id"
         FROM public."Users"
         WHERE "role"::text = 'moderator'
         LIMIT 1;`,
        options,
      );

      if (moderators.length > 0) {
        throw new Error(
          'Cannot rollback: moderator accounts still exist',
        );
      }

      const [columns] = await queryInterface.sequelize.query(
        `SELECT column_default
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'Users'
           AND column_name = 'role';`,
        options,
      );

      const originalDefault = columns[0].column_default;

      await queryInterface.sequelize.query(
        `ALTER TABLE public."Users"
           ALTER COLUMN "role" DROP DEFAULT;

         ALTER TYPE public."enum_Users_role"
           RENAME TO "enum_Users_role_with_moderator";

         CREATE TYPE public."enum_Users_role"
           AS ENUM ('customer', 'creator');

         ALTER TABLE public."Users"
           ALTER COLUMN "role"
           TYPE public."enum_Users_role"
           USING "role"::text::public."enum_Users_role";

         DROP TYPE public."enum_Users_role_with_moderator";`,
        options,
      );

      if (originalDefault !== null) {
        await queryInterface.sequelize.query(
          `ALTER TABLE public."Users"
           ALTER COLUMN "role" SET DEFAULT ${originalDefault};`,
          options,
        );
      }
    });
  },
};
