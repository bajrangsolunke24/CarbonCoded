'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('panchayat_users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      village: { type: Sequelize.STRING(100) },
      taluka: { type: Sequelize.STRING(100) },
      district: { type: Sequelize.STRING(100) },
      bank_account: { type: Sequelize.STRING(20) },
      ifsc: { type: Sequelize.STRING(11) },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('panchayat_users');
  },
};
