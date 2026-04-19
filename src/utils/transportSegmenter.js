import { computeFare } from './fareCalculator';

export function segmentRoute(totalDistanceKm, originName, destName) {
  const dist = parseFloat(totalDistanceKm);
  const segments = [];

  if (dist <= 3) {
    segments.push({ from: originName, to: destName, vehicle: 'Tricycle', distance: dist, fare: computeFare('Tricycle', dist) });
  } else if (dist <= 10) {
    const half = dist / 2;
    const mid = `${originName} Junction`;
    segments.push({ from: originName, to: mid, vehicle: 'Jeepney', distance: half, fare: computeFare('Jeepney', half) });
    segments.push({ from: mid, to: destName, vehicle: 'E-Jeep', distance: half, fare: computeFare('E-Jeep', half) });
  } else if (dist <= 25) {
    const firstLeg = dist * 0.4;
    const secondLeg = dist * 0.6;
    const mid = getMidpoint(originName, destName);
    segments.push({ from: originName, to: mid, vehicle: 'Jeepney', distance: firstLeg, fare: computeFare('Jeepney', firstLeg) });
    segments.push({ from: mid, to: destName, vehicle: 'Bus', distance: secondLeg, fare: computeFare('Bus', secondLeg) });
  } else {
    const firstLeg = dist * 0.35;
    const secondLeg = dist * 0.45;
    const lastLeg = dist * 0.2;
    const mid1 = getMidpoint(originName, destName);
    const mid2 = `${destName} Terminal`;
    segments.push({ from: originName, to: mid1, vehicle: 'Bus', distance: firstLeg, fare: computeFare('Bus', firstLeg) });
    segments.push({ from: mid1, to: mid2, vehicle: 'Bus', distance: secondLeg, fare: computeFare('Bus', secondLeg) });
    segments.push({ from: mid2, to: destName, vehicle: 'TNVS', distance: lastLeg, fare: computeFare('TNVS', lastLeg) });
  }

  return segments;
}

function getMidpoint(a, b) {
  const areaMap = {
    Calamba: 'Sta. Rosa',
    Batangas: 'Lipa',
    Lucena: 'Tayabas',
    Antipolo: 'Cainta',
    Cavite: 'Dasmariñas',
  };
  for (const key of Object.keys(areaMap)) {
    if (a.includes(key)) return areaMap[key];
    if (b.includes(key)) return areaMap[key];
  }
  return 'City Center Transfer';
}