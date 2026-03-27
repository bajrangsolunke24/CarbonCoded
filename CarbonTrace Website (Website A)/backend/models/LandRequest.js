module.exports = (sequelize, DataTypes) => {
  const LandRequest = sequelize.define('LandRequest', {
    panchayat_id: { type: DataTypes.INTEGER, allowNull: false },
    owner_name: { type: DataTypes.STRING(150), allowNull: false },
    owner_aadhaar_hash: { type: DataTypes.STRING(64), allowNull: false },
    area_hectares: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    location_description: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'),
      defaultValue: 'PENDING',
    },
  }, {
    tableName: 'land_requests',
    underscored: true,
  });

  LandRequest.associate = (models) => {
    LandRequest.belongsTo(models.PanchayatUser, { foreignKey: 'panchayat_id', as: 'panchayat' });
    LandRequest.hasMany(models.LandDocument, { foreignKey: 'land_request_id', as: 'documents' });
    LandRequest.hasOne(models.RegisteredLand, { foreignKey: 'land_request_id', as: 'registeredLand' });
  };

  return LandRequest;
};
