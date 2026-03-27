'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('land_requests', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      panchayat_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'panchayat_users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      owner_name: { type: Sequelize.STRING(150), allowNull: false },
      owner_aadhaar_hash: { type: Sequelize.STRING(64), allowNull: false },
      area_hectares: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      location_description: { type: Sequelize.TEXT },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'),
        defaultValue: 'PENDING',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('land_requests');
  },
};
