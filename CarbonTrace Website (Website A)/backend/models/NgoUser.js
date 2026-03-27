module.exports = (sequelize, DataTypes) => {
  const NgoUser = sequelize.define('NgoUser', {
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    org_name: { type: DataTypes.STRING(200), allowNull: false },
    bank_account: DataTypes.STRING(20),
    ifsc: DataTypes.STRING(11),
  }, {
    tableName: 'ngo_users',
    underscored: true,
  });

  NgoUser.associate = (models) => {
    NgoUser.hasMany(models.NgoPayment, { foreignKey: 'ngo_id', as: 'payments' });
  };

  return NgoUser;
};
