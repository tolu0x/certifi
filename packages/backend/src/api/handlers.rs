use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use super::SharedState;

// Health check response
#[derive(Serialize)]
pub struct HealthCheckResponse {
    status: String,
    version: String,
}

// Health check handler
pub async fn health_check() -> impl IntoResponse {
    let response = HealthCheckResponse {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    };

    (StatusCode::OK, Json(response))
}