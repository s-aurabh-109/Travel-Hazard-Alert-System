"""Pydantic schemas for analytics / heatmap endpoints."""

from datetime import datetime

from pydantic import BaseModel, Field


class HeatmapPoint(BaseModel):
    latitude: float = Field(..., description="Grid cell center latitude.")
    longitude: float = Field(..., description="Grid cell center longitude.")
    intensity: float = Field(..., ge=0, le=1, description="Normalized tourist density.")
    tourist_count: int = Field(..., ge=0, description="Number of tourists in this cell.")


class Cluster(BaseModel):
    center_latitude: float
    center_longitude: float
    radius_km: float = Field(default=2.5)
    tourist_count: int
    density_label: str = Field(..., description="LOW, MODERATE, HIGH, or VERY_HIGH.")


class HeatmapResponse(BaseModel):
    timeframe_hours: int
    total_snapshots: int
    total_unique_tourists: int
    heatmap_data: list[HeatmapPoint]
    clusters: list[Cluster]
    generated_at: datetime


class AnalyticsSummaryResponse(BaseModel):
    total_active_tourists: int
    risk_distribution: dict = Field(..., description="Count per risk level.", examples=[{"LOW": 45, "MEDIUM": 30, "HIGH": 15}])
    top_locations: list[HeatmapPoint]
    avg_risk_score: float
    generated_at: datetime
