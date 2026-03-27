module.exports = (sequelize, DataTypes) => {
  const PanchayatUser = sequelize.define('PanchayatUser', {
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    village: DataTypes.STRING(100),
    taluka: DataTypes.STRING(100),
    district: DataTypes.STRING(100),
    bank_account: DataTypes.STRING(20),
    ifsc: DataTypes.STRING(11),
  }, {
    tableName: 'panchayat_users',
    underscored: true,
  });

  PanchayatUser.associate = (models) => {
    PanchayatUser.hasMany(models.LandRequest, { foreignKey: 'panchayat_id', as: 'landRequests' });
    PanchayatUser.hasMany(models.NgoPayment, { foreignKey: 'panchayat_id', as: 'payments' });
  };

  return PanchayatUser;
};
