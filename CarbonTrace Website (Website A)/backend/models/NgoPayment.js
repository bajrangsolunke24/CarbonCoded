module.exports = (sequelize, DataTypes) => {
  const NgoPayment = sequelize.define('NgoPayment', {
    ngo_id: DataTypes.INTEGER,
    panchayat_id: DataTypes.INTEGER,
    land_id: DataTypes.INTEGER,
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    razorpay_payout_id: DataTypes.STRING(100),
    quality_score: DataTypes.DECIMAL(5, 2),
    status: {
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'),
      defaultValue: 'PENDING',
    },
    paid_at: DataTypes.DATE,
  }, {
    tableName: 'ngo_payments',
    underscored: true,
  });

  NgoPayment.associate = (models) => {
    NgoPayment.belongsTo(models.NgoUser, { foreignKey: 'ngo_id', as: 'ngo' });
    NgoPayment.belongsTo(models.PanchayatUser, { foreignKey: 'panchayat_id', as: 'panchayat' });
    NgoPayment.belongsTo(models.RegisteredLand, { foreignKey: 'land_id', as: 'land' });
  };

  return NgoPayment;
};
