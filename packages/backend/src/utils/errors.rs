use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use std::fmt;

// API error response
#[derive(Serialize, Deserialize)]
pub struct ErrorResponse {
    pub status: String,
    pub message: String,
}

// Application error types
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Authentication error: {0}")]
    AuthError(String),
    
    #[error("Bad request: {0}")]
    BadRequest(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Internal error: {0}")]
    InternalError(String),
    
    #[error("Blockchain error: {0}")]
    BlockchainError(String),
}

// Convert app errors to HTTP responses
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::AuthError(msg) => (StatusCode::UNAUTHORIZED, msg),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            AppError::InternalError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            AppError::BlockchainError(msg) => (StatusCode::SERVICE_UNAVAILABLE, msg),
        };
        
        let body = Json(ErrorResponse {
            status: status.to_string(),
            message,
        });
        
        (status, body).into_response()
    }
}