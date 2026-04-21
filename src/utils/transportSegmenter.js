import { computeFare } from './fareCalculator';
import { findKnownRoute, getPassThroughBuses } from './routeKnowledgeBase';

function fareByFormula(formula, dist) {
  switch (formula) {
    case 'jeepney': return computeFare('Jeepney', dist);
    case 'ejeep':   return computeFare('E-Jeep', dist);
    case 'bus':     return computeFare('Bus', dist);
    case 'tricycle':return 30;
    default:        return computeFare('Bus', dist);
  }
}

function midpoint(a, b) {
  const map = {
    calamba:'Calamba Crossing', batangas:'Batangas City Grand Terminal',
    lucena:'Lucena Grand Terminal', antipolo:'Antipolo Terminal',
    tagaytay:'Tagaytay Rotonda', 'sta rosa':'Sta. Rosa Junction',
    lipa:'SM Lipa Terminal', dasmarinas:'Dasmariñas Town Proper',
    bacoor:'Bacoor Terminal', 'san pablo':'San Pablo Terminal',
  };
  const n = s => s.toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (n(a).includes(k) || n(b).includes(k)) return v;
  }
  return 'Town Center Terminal';
}

function makeOpt(label, segs, note = '') {
  return { label, note, segments: segs, totalFare: segs.reduce((s, x) => s + (x.fare || 0), 0) };
}

function heuristic(dist, oL, dL) {
  const opts = [];
  if (dist <= 3) {
    opts.push(makeOpt('Tricycle', [{ from:oL, to:dL, vehicle:'Tricycle', operator:'Local Tricycle', distance:dist, fare:30, note:'Short hop' }]));
  } else if (dist <= 10) {
    opts.push(makeOpt('Jeepney (direct)', [{ from:oL, to:dL, vehicle:'Jeepney', operator:'Local Jeepney', distance:dist, fare:fareByFormula('jeepney',dist), note:'Single jeepney ride' }]));
  } else if (dist <= 18) {
    const l1 = +(dist*0.5).toFixed(2), l2 = +(dist*0.5).toFixed(2), mid = midpoint(oL,dL);
    opts.push(makeOpt('Jeepney + E-Jeep', [
      { from:oL, to:mid, vehicle:'Jeepney', operator:'Local Jeepney', distance:l1, fare:fareByFormula('jeepney',l1), note:'Ride to transfer point' },
      { from:mid, to:dL, vehicle:'E-Jeep', operator:'Local E-Jeep', distance:l2, fare:fareByFormula('ejeep',l2), note:'Transfer to E-Jeep' },
    ]));
    opts.push(makeOpt('Jeepney (direct if available)', [
      { from:oL, to:dL, vehicle:'Jeepney', operator:'Local Jeepney', distance:dist, fare:fareByFormula('jeepney',dist), note:'Check if a direct jeepney serves this route' },
    ]));
  } else if (dist <= 40) {
    const l1 = +(dist*0.35).toFixed(2), l2 = +(dist*0.65).toFixed(2), mid = midpoint(oL,dL);
    opts.push(makeOpt('Jeepney + Bus', [
      { from:oL, to:mid, vehicle:'Jeepney', operator:'Local Jeepney', distance:l1, fare:fareByFormula('jeepney',l1), note:'Ride to nearest bus terminal' },
      { from:mid, to:dL, vehicle:'Bus', operator:'Provincial Bus', distance:l2, fare:fareByFormula('bus',l2) },
    ]));
    opts.push(makeOpt('Direct Bus (if available)', [
      { from:oL, to:dL, vehicle:'Bus', operator:'Check local buses', distance:dist, fare:fareByFormula('bus',dist), note:'Some buses serve this route directly — verify at terminal' },
    ]));
  } else if (dist <= 80) {
    const l1 = +(dist*0.5).toFixed(2), l2 = +(dist*0.5).toFixed(2), mid = midpoint(oL,dL);
    opts.push(makeOpt('Bus + Bus', [
      { from:oL, to:mid, vehicle:'Bus', operator:'Provincial Bus', distance:l1, fare:fareByFormula('bus',l1) },
      { from:mid, to:dL, vehicle:'Bus', operator:'Provincial Bus', distance:l2, fare:fareByFormula('bus',l2) },
    ]));
  } else {
    const l1 = +(dist*0.45).toFixed(2), l2 = +(dist*0.45).toFixed(2), l3 = +(dist*0.10).toFixed(2);
    const mid = midpoint(oL,dL);
    opts.push(makeOpt('Long-haul Bus Route', [
      { from:oL, to:mid, vehicle:'Bus', operator:'Provincial Bus', distance:l1, fare:fareByFormula('bus',l1) },
      { from:mid, to:dL+' Terminal', vehicle:'Bus', operator:'Continuing Bus', distance:l2, fare:fareByFormula('bus',l2) },
      { from:dL+' Terminal', to:dL, vehicle:'Tricycle', operator:'Local Tricycle', distance:l3, fare:30, note:'Last-mile' },
    ]));
  }
  return opts;
}

export function buildRouteOptions(totalDistanceKm, originName, destName) {
  const dist = parseFloat(totalDistanceKm);
  const oL = originName.split(',')[0].trim();
  const dL = destName.split(',')[0].trim();

  if (dist <= 0.6) return [makeOpt('Walking', [{ from:oL, to:dL, vehicle:'Walk', operator:'', distance:dist, fare:0, note:'Short distance — walking is fastest' }])];
  if (dist <= 1.2) return [
    makeOpt('Walking (recommended)', [{ from:oL, to:dL, vehicle:'Walk', operator:'', distance:dist, fare:0, note:'Saves ₱30 over tricycle' }]),
    makeOpt('Tricycle', [{ from:oL, to:dL, vehicle:'Tricycle', operator:'Local Tricycle', distance:dist, fare:30, note:'Short tricycle ride' }]),
  ];

  // 1. Known direct route
  const known = findKnownRoute(originName, destName);
  if (known) {
    return known.options.map(opt => {
      const segs = opt.segments.map(seg => {
        const segDist = +(dist * (seg.df || 1)).toFixed(2);
        const from = seg.from.replace('{O}', oL).replace('{D}', dL);
        const to   = seg.to.replace('{O}', oL).replace('{D}', dL);
        const fare = seg.knownFare != null ? seg.knownFare : fareByFormula(seg.ff, segDist);
        return { from, to, vehicle:seg.vehicle, operator:seg.operator, distance:segDist, fare, note:seg.note||'' };
      });
      return makeOpt(opt.label, segs, opt.note||'');
    });
  }

  // 2. Pass-through bus detection
  const buses = getPassThroughBuses(originName, destName);
  if (buses.length) {
    const b = buses[0];
    return [
      makeOpt(`Hop-on: ${b.company} — ${b.route}`, [{
        from:oL, to:dL, vehicle:'Bus', operator:b.company, distance:dist,
        fare:fareByFormula('bus',dist),
        note:`${b.company} buses on the ${b.route} route pass through here — hail at the roadside or board at the nearest terminal`,
      }]),
      ...heuristic(dist, oL, dL),
    ];
  }

  // 3. Heuristic fallback
  return heuristic(dist, oL, dL);
}

// Legacy single-segment export for RouteDetail
export function segmentRoute(totalDistanceKm, originName, destName) {
  return buildRouteOptions(totalDistanceKm, originName, destName)[0]?.segments || [];
}