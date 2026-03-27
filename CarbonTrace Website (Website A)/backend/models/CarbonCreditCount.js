module.exports = (sequelize, DataTypes) => {
  const CarbonCreditCount = sequelize.define('CarbonCreditCount', {
    total_issued: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
    total_available: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
    total_sold: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
    last_updated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'carbon_credit_count',
    underscored: true,
  });

  return CarbonCreditCount;
};
