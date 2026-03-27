'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('carbon_credit_count', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      total_issued: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      total_available: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      total_sold: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      last_updated: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('carbon_credit_count');
  },
};
