'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ndvi_records', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      land_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'registered_lands', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      ndvi_value: { type: Sequelize.DECIMAL(5, 4), allowNull: false },
      recorded_at: { type: Sequelize.DATE, allowNull: false },
      satellite_source: { type: Sequelize.STRING(50), defaultValue: 'ISRO_BHUVAN' },
      greenery_increase_percent: { type: Sequelize.DECIMAL(6, 2) },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('ndvi_records');
  },
};
