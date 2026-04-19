export const VEHICLE_RATES = {
  Jeepney:  { base: 13,  perKm: 1.80, multiplier: 1.0 },
  Bus:      { base: 15,  perKm: 2.20, multiplier: 1.3 },
  'E-Jeep': { base: 13,  perKm: 1.80, multiplier: 1.1 },
  Tricycle: { base: 30,  perKm: 0,    multiplier: 1.0 },
  TNVS:     { base: 40,  perKm: 3.50, multiplier: 2.5 },
};

export function computeFare(vehicleType, distanceKm) {
  const rate = VEHICLE_RATES[vehicleType];
  if (!rate) return 0;
  if (vehicleType === 'Tricycle') return rate.base;
  return Math.round((rate.base + distanceKm * rate.perKm) * rate.multiplier);
}