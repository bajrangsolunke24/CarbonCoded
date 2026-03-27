'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('registered_lands', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      land_id_gov: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      land_request_id: {
        type: Sequelize.INTEGER,
        references: { model: 'land_requests', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      polygon_geojson: { type: Sequelize.JSONB, allowNull: false },
      plantation_doc_cid: { type: Sequelize.STRING(255) },
      allowed_species: { type: Sequelize.ARRAY(Sequelize.STRING) },
      conditions: { type: Sequelize.TEXT },
      blockchain_hash: { type: Sequelize.STRING(66) },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'PENDING_VERIFICATION', 'VERIFIED', 'SUSPENDED'),
        defaultValue: 'ACTIVE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('registered_lands');
  },
};
