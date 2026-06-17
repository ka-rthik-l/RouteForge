from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from typing import List
from models import (
    OptimizeRequest, OptimizeResponse,
    HealthResponse, ErrorResponse, Waypoint,
    SavedRoute, ApiStop, AnalyticsSummary
)
from osrm import get_duration_matrix, estimate_distance_km
from optimizer import solve_tsp, calculate_savings

load_dotenv()

app = FastAPI(
    title="RouteForge API",
    description="Delivery route optimizer — OR-Tools + OSRM",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    os.getenv("FRONTEND_PROD_URL", "https://routeforge.vercel.app"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "RouteForge API is running"}


@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="ok")


@app.post(
    "/optimize",
    response_model=OptimizeResponse,
    responses={
        400: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    }
)
def optimize_route(request: OptimizeRequest) -> OptimizeResponse:

    stops = [(s.lat, s.lng) for s in request.stops]
    n = len(stops)

    # Step 1: Get real driving times from OSRM
    try:
        duration_matrix = get_duration_matrix(stops)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # Step 2: Solve TSP with OR-Tools
    optimized_order = solve_tsp(duration_matrix, depot_index=0)

    if not optimized_order:
        raise HTTPException(
            status_code=500,
            detail="Optimizer failed. Try with fewer stops."
        )

    # Step 3: Calculate total duration
    optimized_duration_seconds = sum(
        duration_matrix[optimized_order[i]][optimized_order[i + 1]]
        for i in range(len(optimized_order) - 1)
    )

    total_duration_minutes = int(optimized_duration_seconds / 60)
    total_distance_km = estimate_distance_km(optimized_duration_seconds)

    # Step 4: Calculate savings vs naive order
    original_order = list(range(n))
    saved_minutes = calculate_savings(
        original_order, optimized_order, duration_matrix
    )

    # Step 5: Build waypoints (remove trailing depot duplicate)
    unique_order = optimized_order[:-1]
    waypoints = [
        Waypoint(lat=stops[i][0], lng=stops[i][1])
        for i in unique_order
    ]

    return OptimizeResponse(
        ordered_indices=unique_order,
        total_distance_km=total_distance_km,
        total_duration_minutes=total_duration_minutes,
        saved_minutes=saved_minutes,
        waypoints=waypoints
    )


@app.get("/routes", response_model=List[SavedRoute])
def get_routes():
    return [
        {"id": "1", "name": "Morning delivery run", "date": "2026-06-14", "stops": 11, "distance_km": 34.2, "duration_minutes": 82, "saved_minutes": 18, "status": "completed"},
        {"id": "2", "name": "North district route", "date": "2026-06-12", "stops": 8, "distance_km": 21.4, "duration_minutes": 54, "saved_minutes": 41, "status": "completed"},
        {"id": "3", "name": "East side run", "date": "2026-06-10", "stops": 13, "distance_km": 41.8, "duration_minutes": 98, "saved_minutes": 12, "status": "completed"},
        {"id": "4", "name": "Weekend parcels", "date": "2026-06-08", "stops": 6, "distance_km": 18.1, "duration_minutes": 44, "saved_minutes": 33, "status": "completed"},
        {"id": "5", "name": "Draft route A", "date": "2026-06-05", "stops": 9, "distance_km": 0, "duration_minutes": 0, "saved_minutes": 0, "status": "draft"},
        {"id": "6", "name": "Draft route B", "date": "2026-06-01", "stops": 4, "distance_km": 0, "duration_minutes": 0, "saved_minutes": 0, "status": "draft"},
    ]


@app.get("/stops", response_model=List[ApiStop])
def get_stops():
    return [
        {"id": "1",  "name": "Riverside Pharmacy",  "address": "Fort Kochi, Kochi",          "zone": "North",  "lat": 9.9667,  "lng": 76.2422, "visits": 14, "last_used": "3 days ago"},
        {"id": "2",  "name": "Green Valley Cafe",   "address": "Marine Drive, Kochi",         "zone": "East",   "lat": 9.9700,  "lng": 76.2900, "visits": 8,  "last_used": "1 day ago"},
        {"id": "3",  "name": "North Tower B",       "address": "InfoPark, Kakkanad, Kochi",   "zone": "North",  "lat": 10.0150, "lng": 76.3550, "visits": 22, "last_used": "Today"},
        {"id": "4",  "name": "City Market",         "address": "MG Road, Kochi",              "zone": "Centre", "lat": 9.9680,  "lng": 76.3010, "visits": 31, "last_used": "Today"},
        {"id": "5",  "name": "Elm Court",           "address": "Kaloor, Kochi",               "zone": "West",   "lat": 9.9312,  "lng": 76.2673, "visits": 5,  "last_used": "1 week ago"},
        {"id": "6",  "name": "Lakeside Mall",       "address": "Lulu Mall, Edappally, Kochi", "zone": "East",   "lat": 10.0269, "lng": 76.3050, "visits": 17, "last_used": "2 days ago"},
        {"id": "7",  "name": "Park Gate",           "address": "Palarivattom, Kochi",         "zone": "South",  "lat": 9.9300,  "lng": 76.2600, "visits": 9,  "last_used": "4 days ago"},
        {"id": "8",  "name": "Central Post Office", "address": "Ernakulam South, Kochi",      "zone": "Centre", "lat": 9.9400,  "lng": 76.2700, "visits": 28, "last_used": "Yesterday"},
        {"id": "9",  "name": "West Depot",          "address": "Kaloor Junction, Kochi",      "zone": "West",   "lat": 9.9500,  "lng": 76.2800, "visits": 3,  "last_used": "2 weeks ago"},
        {"id": "10", "name": "Station Square",      "address": "Vytilla Mobility Hub, Kochi", "zone": "Centre", "lat": 9.9600,  "lng": 76.2900, "visits": 19, "last_used": "Today"},
        {"id": "11", "name": "High Street Bakery",  "address": "Broadway, Kochi",             "zone": "South",  "lat": 9.9700,  "lng": 76.3000, "visits": 11, "last_used": "3 days ago"},
        {"id": "12", "name": "Harbour View Flats",  "address": "Willingdon Island, Kochi",    "zone": "East",   "lat": 9.9800,  "lng": 76.3100, "visits": 6,  "last_used": "5 days ago"},
    ]


@app.get("/analytics", response_model=AnalyticsSummary)
def get_analytics():
    return {
        "total_routes": 24,
        "total_time_saved_minutes": 522,
        "total_km_saved": 312.0,
        "avg_stops": 9.4,
        "daily_savings": [18, 41, 12, 33, 27, 19, 44, 22, 31, 15],
        "daily_km": [12.1, 18.4, 9.2, 21.3, 16.8, 11.4, 24.2, 14.9, 19.6, 8.7],
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
