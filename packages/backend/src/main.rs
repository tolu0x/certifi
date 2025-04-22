use certifi::api;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::Mutex;
use axum::serve;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    // Initialize logger
    simple_logger::init_with_level(log::Level::Info).unwrap();
    log::info!("Starting Certifi service");

    // Load environment variables
    dotenv::dotenv().ok();
    
    // Initialize application state
    let app_state = Arc::new(Mutex::new(api::AppState::new()));
    
    // Build the application with routes
    let app = api::router(app_state);
    
    // Define the address to run the server
    let addr = SocketAddr::from(([127, 0, 0, 1], 4000));
    log::info!("Listening on {}", addr);
    
    // Create a TCP listener
    let listener = TcpListener::bind(addr).await.unwrap();
    
    // Start the server
    serve(listener, app)
        .await
        .unwrap();
}
