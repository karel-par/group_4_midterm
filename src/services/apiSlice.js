import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const ORS_API_KEY = '5b3ce3597851110001cf6248a2e6e6b0c0a14c5ab4a2d4f6e1c8e3b7'; // free key placeholder

// --- MOCK DATA FALLBACKS ---
const MOCK_ROUTE = {
  distance: 42.3,
  duration: 75,
  geometry: {
    coordinates: [
      [121.1653, 14.2116],
      [121.0509, 14.3297],
      [121.0251, 14.4791],
    ],
  },
};

const MOCK_REPORTS = [
  { id: 1, category: 'overcharging', description: 'Driver overcharged by ₱10', location: 'Calamba', status: 'open', date: '2024-05-01' },
  { id: 2, category: 'rude driver', description: 'Rude behavior reported', location: 'Sta. Rosa', status: 'resolved', date: '2024-05-03' },
  { id: 3, category: 'unsafe driving', description: 'Reckless overtaking', location: 'Batangas City', status: 'open', date: '2024-05-05' },
  { id: 4, category: 'route disruption', description: 'Road closed due to flooding', location: 'Lucena', status: 'open', date: '2024-05-06' },
];

const MOCK_STRIKES = [
  { id: 1, affectedRoutes: ['Calamba–Sta. Rosa', 'Calamba–Manila'], affectedProvinces: ['Laguna'], status: 'active', date: '2024-05-07', reason: 'Fuel price hike protest' },
  { id: 2, affectedRoutes: ['Batangas–Tagaytay'], affectedProvinces: ['Batangas', 'Cavite'], status: 'resolved', date: '2024-05-04', reason: 'Operator franchise dispute' },
];

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({

    // 1. GEOCODING — Nominatim
    getLocations: builder.query({
      async queryFn(query) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)},CALABARZON,Philippines&format=json&limit=5`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          if (!data.length) throw new Error('No results');
          return { data };
        } catch {
          return {
            data: [
              { place_id: '1', display_name: 'Calamba, Laguna', lat: '14.2116', lon: '121.1653' },
              { place_id: '2', display_name: 'Sta. Rosa, Laguna', lat: '14.3122', lon: '121.0114' },
            ],
          };
        }
      },
    }),

    // 2. ROUTING — OpenRouteService
    getRoute: builder.query({
      async queryFn({ originCoords, destCoords }) {
        try {
          const res = await fetch(
            `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${originCoords[1]},${originCoords[0]}&end=${destCoords[1]},${destCoords[0]}`
          );
          const data = await res.json();
          if (!data.features) throw new Error('ORS failed');
          const feature = data.features[0];
          return {
            data: {
              distance: (feature.properties.segments[0].distance / 1000).toFixed(2),
              duration: Math.round(feature.properties.segments[0].duration / 60),
              geometry: feature.geometry,
            },
          };
        } catch {
          return { data: MOCK_ROUTE };
        }
      },
    }),

    // 3. ROUTE BY ID (mock)
    getRouteById: builder.query({
      queryFn(id) {
        const routes = {
          '1': { id: '1', origin: 'Calamba', destination: 'Tagaytay', ...MOCK_ROUTE },
          '2': { id: '2', origin: 'Lucena', destination: 'Batangas City', distance: 89, duration: 120, geometry: MOCK_ROUTE.geometry },
        };
        return { data: routes[id] || { ...MOCK_ROUTE, id, origin: 'Unknown', destination: 'Unknown' } };
      },
    }),

    // 4. REPORTS
    getReports: builder.query({
      queryFn() {
        return { data: MOCK_REPORTS };
      },
    }),

    // 5. CREATE REPORT (mock mutation)
    createReport: builder.mutation({
      queryFn(newReport) {
        const created = { ...newReport, id: Date.now(), status: 'open', date: new Date().toISOString().split('T')[0] };
        MOCK_REPORTS.push(created);
        return { data: created };
      },
    }),

    // 6. STRIKES
    getStrikes: builder.query({
      queryFn() {
        return { data: MOCK_STRIKES };
      },
    }),

  }),
});

export const {
  useGetLocationsQuery,
  useGetRouteQuery,
  useGetRouteByIdQuery,
  useGetReportsQuery,
  useCreateReportMutation,
  useGetStrikesQuery,
} = apiSlice;