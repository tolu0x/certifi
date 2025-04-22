#[cfg(test)]
mod tests {
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use std::sync::Arc;
    use tokio::sync::Mutex;
    use tower::ServiceExt;
    
    use crate::api::{router, AppState};
    
    #[tokio::test]
    async fn test_health_endpoint() {
        // Initialize app state
        let app_state = Arc::new(Mutex::new(AppState::new()));
        
        // Build the application
        let app = router(app_state);
        
        // Create a health check request
        let request = Request::builder()
            .uri("/health")
            .method("GET")
            .body(Body::empty())
            .unwrap();
        
        // Submit the request and get a response
        let response = app.oneshot(request).await.unwrap();
        
        // Verify the response
        assert_eq!(response.status(), StatusCode::OK);
    }
}