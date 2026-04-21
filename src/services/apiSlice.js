import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const ORS_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImU0MmU5YjZiOGEzYTRhNjg5YzdmMWMyMzJiYTkxNzMzIiwiaCI6Im11cm11cjY0In0=';

const MOCK_REPORTS = [
  { id:1, category:'overcharging',   description:'Driver overcharged by ₱10 on Calamba–Sta. Rosa route', location:'Calamba, Laguna',   status:'open',     date:'2025-05-01' },
  { id:2, category:'rude driver',    description:'Rude behavior and loud music on public jeepney',       location:'Sta. Rosa, Laguna', status:'resolved', date:'2025-05-03' },
  { id:3, category:'unsafe driving', description:'Reckless overtaking near school zone',                 location:'Batangas City',     status:'open',     date:'2025-05-05' },
  { id:4, category:'route disruption',description:'Road closed due to flooding, use alternate highway',  location:'Lucena, Quezon',    status:'open',     date:'2025-05-06' },
  { id:5, category:'strike',         description:'Jeepney operators strike affecting south routes',       location:'Cavite',            status:'resolved', date:'2025-05-02' },
  { id:6, category:'overcharging',   description:'Tricycle driver asked ₱80 for a ₱30 route',           location:'Antipolo, Rizal',   status:'open',     date:'2025-05-07' },
];

const MOCK_STRIKES = [
  { id:1, affectedRoutes:['Calamba–Sta. Rosa','Calamba–Manila'], affectedProvinces:['Laguna'], status:'active', date:'2025-05-07', reason:'Fuel price hike protest by transport operators' },
  { id:2, affectedRoutes:['Batangas–Tagaytay','Lipa–Batangas City'], affectedProvinces:['Batangas','Cavite'], status:'resolved', date:'2025-05-04', reason:'Operator franchise dispute with LTFRB' },
];

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({

    getLocations: builder.query({
      async queryFn(query) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Philippines')}&format=json&limit=6&countrycodes=ph`,
            { headers: { 'Accept-Language':'en', 'User-Agent':'CalabarzONE/1.0' } }
          );
          if (!res.ok) throw new Error('nominatim failed');
          return { data: await res.json() };
        } catch {
          return { data: [
            { place_id:'m1', display_name:'Calamba, Laguna, Philippines',     lat:'14.2116', lon:'121.1653' },
            { place_id:'m2', display_name:'Sta. Rosa, Laguna, Philippines',   lat:'14.3122', lon:'121.0114' },
            { place_id:'m3', display_name:'Batangas City, Philippines',       lat:'13.7565', lon:'121.0583' },
            { place_id:'m4', display_name:'Lucena City, Quezon, Philippines', lat:'13.9322', lon:'121.6175' },
            { place_id:'m5', display_name:'Tagaytay, Cavite, Philippines',    lat:'14.1153', lon:'120.9621' },
          ]};
        }
      },
    }),

    getRoute: builder.query({
      async queryFn({ originCoords, destCoords }) {
        if (!originCoords || !destCoords) return { data: null };
        try {
          const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_KEY}&start=${originCoords[1]},${originCoords[0]}&end=${destCoords[1]},${destCoords[0]}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`ORS ${res.status}`);
          const data = await res.json();
          if (!data.features?.[0]) throw new Error('no features');
          const f = data.features[0];
          const s = f.properties.segments[0];
          return { data: { distance:(s.distance/1000).toFixed(2), duration:Math.round(s.duration/60), geometry:f.geometry, isMock:false } };
        } catch {
          // Haversine + road factor fallback
          const [lat1,lng1] = originCoords, [lat2,lng2] = destCoords;
          const R = 6371;
          const dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
          const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
          const sl = R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
          const road = (sl*1.35).toFixed(2);
          const steps = 14;
          const coords = Array.from({length:steps+1},(_,i)=>{
            const t=i/steps;
            return [lng1+(lng2-lng1)*t+Math.sin(t*Math.PI)*0.009, lat1+(lat2-lat1)*t+Math.sin(t*Math.PI*2)*0.004];
          });
          return { data: { distance:road, duration:Math.round((road/40)*60), geometry:{type:'LineString',coordinates:coords}, isMock:true } };
        }
      },
    }),

    getRouteById: builder.query({
      queryFn(id) {
        return { data: { id, origin:'Calamba', destination:'Batangas City', distance:62.4, duration:90,
          geometry:{ type:'LineString', coordinates:[[121.1653,14.2116],[121.0509,14.0297],[121.0583,13.7565]] } } };
      },
    }),

    getReports:    builder.query({ queryFn() { return { data: MOCK_REPORTS }; } }),
    createReport:  builder.mutation({ queryFn(r) { const c={...r,id:Date.now(),status:'open',date:new Date().toISOString().split('T')[0]}; MOCK_REPORTS.unshift(c); return {data:c}; } }),
    getStrikes:    builder.query({ queryFn() { return { data: MOCK_STRIKES }; } }),
  }),
});

export const {
  useGetLocationsQuery, useGetRouteQuery, useGetRouteByIdQuery,
  useGetReportsQuery, useCreateReportMutation, useGetStrikesQuery,
} = apiSlice;