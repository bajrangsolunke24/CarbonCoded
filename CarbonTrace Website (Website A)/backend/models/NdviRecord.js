module.exports = (sequelize, DataTypes) => {
  const NdviRecord = sequelize.define('NdviRecord', {
    land_id: { type: DataTypes.INTEGER, allowNull: false },
    ndvi_value: { type: DataTypes.DECIMAL(5, 4), allowNull: false },
    recorded_at: { type: DataTypes.DATE, allowNull: false },
    satellite_source: { type: DataTypes.STRING(50), defaultValue: 'ISRO_BHUVAN' },
    greenery_increase_percent: DataTypes.DECIMAL(6, 2),
  }, {
    tableName: 'ndvi_records',
    underscored: true,
  });

  NdviRecord.associate = (models) => {
    NdviRecord.belongsTo(models.RegisteredLand, { foreignKey: 'land_id', as: 'land' });
  };

  return NdviRecord;
};
