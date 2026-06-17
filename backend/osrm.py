import httpx
import os
from typing import List, Tuple
from dotenv import load_dotenv

load_dotenv()

OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "http://router.project-osrm.org")


def build_coordinate_string(stops: List[Tuple[float, float]]) -> str:
    # OSRM expects lng,lat order — NOT lat,lng
    return ";".join(f"{lng},{lat}" for lat, lng in stops)


def get_duration_matrix(stops: List[Tuple[float, float]]) -> List[List[float]]:
    coord_string = build_coordinate_string(stops)
    url = f"{OSRM_BASE_URL}/table/v1/driving/{coord_string}"
    params = {"annotations": "duration"}

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, params=params)
            response.raise_for_status()
    except httpx.TimeoutException:
        raise ValueError("OSRM API timed out — try again or reduce stop count")
    except httpx.HTTPStatusError as e:
        raise ValueError(f"OSRM API error: {e.response.status_code}")

    data = response.json()

    if data.get("code") != "Ok":
        raise ValueError(f"OSRM error: {data.get('message', 'Unknown')}")

    matrix = data.get("durations")
    if not matrix:
        raise ValueError("OSRM returned empty duration matrix")

    n = len(stops)
    cleaned = []
    for i in range(n):
        row = []
        for j in range(n):
            val = matrix[i][j]
            row.append(val if val is not None else 999999)
        cleaned.append(row)

    return cleaned


def estimate_distance_km(duration_seconds: float) -> float:
    # Approximate using 30 km/h average city speed
    hours = duration_seconds / 3600
    return round(hours * 30, 1)
