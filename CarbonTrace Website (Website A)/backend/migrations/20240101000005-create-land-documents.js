'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('land_documents', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      land_request_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'land_requests', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      satbara_cid: { type: Sequelize.STRING(255) },
      other_docs_cid: { type: Sequelize.STRING(255) },
      uploaded_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('land_documents');
  },
};
