
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Contests', 'domainPreference', {
      allowNull: true,
      type: Sequelize.STRING(32),
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('Contests', 'domainPreference');
  },
};
