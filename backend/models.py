from pydantic import BaseModel, Field, field_validator
from typing import List, Annotated


class Coordinate(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class OptimizeRequest(BaseModel):
    stops: Annotated[List[Coordinate], Field(min_length=2, max_length=25)]

    @field_validator('stops')
    @classmethod
    def validate_stops(cls, v):
        if len(v) < 2:
            raise ValueError('At least 2 stops required')
        if len(v) > 25:
            raise ValueError('Maximum 25 stops per route')
        return v


class Waypoint(BaseModel):
    lat: float
    lng: float


class OptimizeResponse(BaseModel):
    ordered_indices: List[int]
    total_distance_km: float
    total_duration_minutes: int
    saved_minutes: int
    waypoints: List[Waypoint]


class HealthResponse(BaseModel):
    status: str
    version: str = "1.0.0"


class ErrorResponse(BaseModel):
    detail: str
    code: str


class SavedRoute(BaseModel):
    id: str
    name: str
    date: str
    stops: int
    distance_km: float
    duration_minutes: int
    saved_minutes: int
    status: str


class ApiStop(BaseModel):
    id: str
    name: str
    address: str
    zone: str
    lat: float
    lng: float
    visits: int
    last_used: str


class AnalyticsSummary(BaseModel):
    total_routes: int
    total_time_saved_minutes: int
    total_km_saved: float
    avg_stops: float
    daily_savings: List[int]
    daily_km: List[float]
