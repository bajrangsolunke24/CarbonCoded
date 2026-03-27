module.exports = (sequelize, DataTypes) => {
  const GovernmentUser = sequelize.define('GovernmentUser', {
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'GOVERNMENT' },
    district: DataTypes.STRING(100),
    state: DataTypes.STRING(100),
  }, {
    tableName: 'government_users',
    underscored: true,
  });

  GovernmentUser.associate = (models) => {
    GovernmentUser.hasMany(models.CarbonCreditIssuance, { foreignKey: 'approved_by', as: 'approvals' });
  };

  return GovernmentUser;
};
