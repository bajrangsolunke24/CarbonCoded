module.exports = (sequelize, DataTypes) => {
  const RegisteredLand = sequelize.define('RegisteredLand', {
    land_id_gov: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    land_request_id: DataTypes.INTEGER,
    polygon_geojson: { type: DataTypes.JSONB, allowNull: false },
    plantation_doc_cid: DataTypes.STRING(255),
    allowed_species: DataTypes.ARRAY(DataTypes.STRING),
    conditions: DataTypes.TEXT,
    blockchain_hash: DataTypes.STRING(66),
    status: {
      type: DataTypes.ENUM('ACTIVE', 'PENDING_VERIFICATION', 'VERIFIED', 'SUSPENDED'),
      defaultValue: 'ACTIVE',
    },
  }, {
    tableName: 'registered_lands',
    underscored: true,
  });

  RegisteredLand.associate = (models) => {
    RegisteredLand.belongsTo(models.LandRequest, { foreignKey: 'land_request_id', as: 'landRequest' });
    RegisteredLand.hasMany(models.NdviRecord, { foreignKey: 'land_id', as: 'ndviRecords' });
    RegisteredLand.hasMany(models.CarbonCreditIssuance, { foreignKey: 'land_id', as: 'issuances' });
    RegisteredLand.hasMany(models.NgoPayment, { foreignKey: 'land_id', as: 'payments' });
  };

  return RegisteredLand;
};
