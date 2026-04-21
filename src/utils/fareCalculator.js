export const VEHICLE_RATES = {
  Walk:     { base: 0,  perKm: 0,    multiplier: 1.0 },
  Tricycle: { base: 30, perKm: 0,    multiplier: 1.0 },
  Jeepney:  { base: 13, perKm: 1.80, multiplier: 1.0 },
  'E-Jeep': { base: 13, perKm: 1.80, multiplier: 1.1 },
  Bus:      { base: 15, perKm: 2.20, multiplier: 1.3 },
  TNVS:     { base: 40, perKm: 3.50, multiplier: 2.5 },
};

export function computeFare(vehicleType, distanceKm) {
  const rate = VEHICLE_RATES[vehicleType];
  if (!rate) return 0;
  if (vehicleType === 'Walk') return 0;
  if (vehicleType === 'Tricycle') return 30;
  return Math.round((rate.base + distanceKm * rate.perKm) * rate.multiplier);
}

export function getVehicleColor(vehicleType) {
  const colors = {
    Walk:     '#10b981',
    Tricycle: '#8b5cf6',
    Jeepney:  '#f59e0b',
    'E-Jeep': '#06b6d4',
    Bus:      '#3b82f6',
    TNVS:     '#ef4444',
  };
  return colors[vehicleType] || '#64748b';
}