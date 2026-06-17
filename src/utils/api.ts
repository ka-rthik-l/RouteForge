// ─────────────────────────────────────────────────────────────────────────────
// src/utils/api.ts
// Single source of truth for all backend communication.
//
// IS_MOCK = true  →  all functions return hardcoded mock data (no network calls)
// IS_MOCK = false →  real fetch calls to BASE_URL (flip this in one session)
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const IS_MOCK = false // Backend is live at http://localhost:8000

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface LatLng {
  lat: number
  lng: number
}

export interface OptimizeResult {
  ordered_indices: number[]
  total_distance_km: number
  total_duration_minutes: number
  saved_minutes: number
  waypoints: LatLng[]
}

export interface SavedRoute {
  id: string
  name: string
  date: string
  stops: number
  distance_km: number
  duration_minutes: number
  saved_minutes: number
  status: 'completed' | 'draft'
}

export interface ApiStop {
  id: string
  name: string
  address: string
  zone: string
  lat: number
  lng: number
  visits: number
  last_used: string
}

export interface AnalyticsSummary {
  total_routes: number
  total_time_saved_minutes: number
  total_km_saved: number
  avg_stops: number
  daily_savings: number[]
  daily_km: number[]
}

// ─── 1. Health check ──────────────────────────────────────────────────────────

/**
 * Returns true if the backend is reachable, false otherwise.
 * In mock mode always returns false (shows "Not connected" in Settings).
 */
export async function checkHealth(): Promise<boolean> {
  if (IS_MOCK) return false
  try {
    const res = await fetch(`${BASE_URL}/health`)
    return res.ok
  } catch {
    return false
  }
}

// ─── 2. Optimize route ────────────────────────────────────────────────────────

/**
 * Core TSP call. Sends an ordered list of lat/lng stops to the backend.
 * Returns the optimal visit order plus distance/time/savings metadata.
 *
 * Mock: simulates 1800 ms delay, returns a shuffled order.
 */
export async function optimizeRoute(stops: LatLng[]): Promise<OptimizeResult> {
  if (IS_MOCK) {
    await new Promise(r => setTimeout(r, 1800))
    return {
      ordered_indices: stops.map((_, i) => i).sort(() => Math.random() - 0.5),
      total_distance_km: 34.2,
      total_duration_minutes: 82,
      saved_minutes: 18,
      waypoints: stops,
    }
  }
  const res = await fetch(`${BASE_URL}/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stops: stops.map(s => ({ lat: s.lat, lng: s.lng })) }),
  })
  if (!res.ok) throw new Error(`Optimizer failed: ${res.status}`)
  return res.json()
}

// ─── 3. Get saved routes ──────────────────────────────────────────────────────

/**
 * Returns all saved routes for the Routes page.
 */
export async function getSavedRoutes(): Promise<SavedRoute[]> {
  if (IS_MOCK) {
    return [
      { id: '1', name: 'Morning delivery run',  date: '2026-06-14', stops: 11, distance_km: 34.2, duration_minutes: 82, saved_minutes: 18, status: 'completed' },
      { id: '2', name: 'North district route',  date: '2026-06-12', stops: 8,  distance_km: 21.4, duration_minutes: 54, saved_minutes: 41, status: 'completed' },
      { id: '3', name: 'East side run',         date: '2026-06-10', stops: 13, distance_km: 41.8, duration_minutes: 98, saved_minutes: 12, status: 'completed' },
      { id: '4', name: 'Weekend parcels',       date: '2026-06-08', stops: 6,  distance_km: 18.1, duration_minutes: 44, saved_minutes: 33, status: 'completed' },
      { id: '5', name: 'Draft route A',         date: '2026-06-05', stops: 9,  distance_km: 0,    duration_minutes: 0,  saved_minutes: 0,  status: 'draft' },
      { id: '6', name: 'Draft route B',         date: '2026-06-01', stops: 4,  distance_km: 0,    duration_minutes: 0,  saved_minutes: 0,  status: 'draft' },
    ]
  }
  const res = await fetch(`${BASE_URL}/routes`)
  if (!res.ok) throw new Error(`Failed to fetch routes: ${res.status}`)
  return res.json()
}

// ─── 4. Get all stops ─────────────────────────────────────────────────────────

/**
 * Returns the full stop library for the Stops page.
 */
export async function getAllStops(): Promise<ApiStop[]> {
  if (IS_MOCK) {
    return [
      { id: '1',  name: 'Riverside Pharmacy',   address: 'Fort Kochi, Kochi',              zone: 'North',  lat: 9.9667,  lng: 76.2422, visits: 14, last_used: '3 days ago' },
      { id: '2',  name: 'Green Valley Cafe',    address: 'Marine Drive, Kochi',            zone: 'East',   lat: 9.9700,  lng: 76.2900, visits: 8,  last_used: '1 day ago'  },
      { id: '3',  name: 'North Tower B',        address: 'InfoPark, Kakkanad, Kochi',      zone: 'North',  lat: 10.0150, lng: 76.3550, visits: 22, last_used: 'Today'      },
      { id: '4',  name: 'City Market',          address: 'MG Road, Kochi',                 zone: 'Centre', lat: 9.9680,  lng: 76.3010, visits: 31, last_used: 'Today'      },
      { id: '5',  name: 'Elm Court',            address: 'Kaloor, Kochi',                  zone: 'West',   lat: 9.9312,  lng: 76.2673, visits: 5,  last_used: '1 week ago' },
      { id: '6',  name: 'Lakeside Mall',        address: 'Lulu Mall, Edappally, Kochi',    zone: 'East',   lat: 10.0269, lng: 76.3050, visits: 17, last_used: '2 days ago' },
      { id: '7',  name: 'Park Gate',            address: 'Palarivattom, Kochi',            zone: 'South',  lat: 9.9300,  lng: 76.2600, visits: 9,  last_used: '4 days ago' },
      { id: '8',  name: 'Central Post Office',  address: 'Ernakulam South, Kochi',         zone: 'Centre', lat: 9.9400,  lng: 76.2700, visits: 28, last_used: 'Yesterday'  },
      { id: '9',  name: 'West Depot',           address: 'Kaloor Junction, Kochi',         zone: 'West',   lat: 9.9500,  lng: 76.2800, visits: 3,  last_used: '2 weeks ago'},
      { id: '10', name: 'Station Square',       address: 'Vytilla Mobility Hub, Kochi',    zone: 'Centre', lat: 9.9600,  lng: 76.2900, visits: 19, last_used: 'Today'      },
      { id: '11', name: 'High Street Bakery',   address: 'Broadway, Kochi',                zone: 'South',  lat: 9.9700,  lng: 76.3000, visits: 11, last_used: '3 days ago' },
      { id: '12', name: 'Harbour View Flats',   address: 'Willingdon Island, Kochi',       zone: 'East',   lat: 9.9800,  lng: 76.3100, visits: 6,  last_used: '5 days ago' },
    ]
  }
  const res = await fetch(`${BASE_URL}/stops`)
  if (!res.ok) throw new Error(`Failed to fetch stops: ${res.status}`)
  return res.json()
}

// ─── 5. Get analytics summary ─────────────────────────────────────────────────

/**
 * Returns aggregated analytics data for the Analytics page charts.
 */
export async function getAnalytics(): Promise<AnalyticsSummary> {
  if (IS_MOCK) {
    return {
      total_routes: 24,
      total_time_saved_minutes: 522,
      total_km_saved: 312,
      avg_stops: 9.4,
      daily_savings: [18, 41, 12, 33, 27, 19, 44, 22, 31, 15],
      daily_km:      [12.1, 18.4, 9.2, 21.3, 16.8, 11.4, 24.2, 14.9, 19.6, 8.7],
    }
  }
  const res = await fetch(`${BASE_URL}/analytics`)
  if (!res.ok) throw new Error(`Failed to fetch analytics: ${res.status}`)
  return res.json()
}
