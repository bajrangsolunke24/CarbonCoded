'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('carbon_credit_issuances', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      land_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'registered_lands', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      credits_calculated: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      algorithm_output_json: { type: Sequelize.JSONB },
      approved_by: {
        type: Sequelize.INTEGER,
        references: { model: 'government_users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      blockchain_tx_hash: { type: Sequelize.STRING(66) },
      issued_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('carbon_credit_issuances');
  },
};
