module.exports = (sequelize, DataTypes) => {
  const CarbonCreditIssuance = sequelize.define('CarbonCreditIssuance', {
    land_id: { type: DataTypes.INTEGER, allowNull: false },
    credits_calculated: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    algorithm_output_json: DataTypes.JSONB,
    approved_by: DataTypes.INTEGER,
    blockchain_tx_hash: DataTypes.STRING(66),
    issued_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'carbon_credit_issuances',
    underscored: true,
  });

  CarbonCreditIssuance.associate = (models) => {
    CarbonCreditIssuance.belongsTo(models.RegisteredLand, { foreignKey: 'land_id', as: 'land' });
    CarbonCreditIssuance.belongsTo(models.GovernmentUser, { foreignKey: 'approved_by', as: 'approver' });
  };

  return CarbonCreditIssuance;
};
