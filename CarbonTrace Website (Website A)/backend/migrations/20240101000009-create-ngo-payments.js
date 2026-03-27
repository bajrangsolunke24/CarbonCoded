'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ngo_payments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      ngo_id: {
        type: Sequelize.INTEGER,
        references: { model: 'ngo_users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      panchayat_id: {
        type: Sequelize.INTEGER,
        references: { model: 'panchayat_users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      land_id: {
        type: Sequelize.INTEGER,
        references: { model: 'registered_lands', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      razorpay_payout_id: { type: Sequelize.STRING(100) },
      quality_score: { type: Sequelize.DECIMAL(5, 2) },
      status: {
        type: Sequelize.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'),
        defaultValue: 'PENDING',
      },
      paid_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('ngo_payments');
  },
};
