// migrations/create-user-schema.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createSchema('public', { ifNotExists: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropSchema('public', { cascade: true });
  }
};