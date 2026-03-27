module.exports = (sequelize, DataTypes) => {
  const LandDocument = sequelize.define('LandDocument', {
    land_request_id: { type: DataTypes.INTEGER, allowNull: false },
    satbara_cid: DataTypes.STRING(255),
    other_docs_cid: DataTypes.STRING(255),
    uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'land_documents',
    underscored: true,
  });

  LandDocument.associate = (models) => {
    LandDocument.belongsTo(models.LandRequest, { foreignKey: 'land_request_id', as: 'landRequest' });
  };

  return LandDocument;
};
