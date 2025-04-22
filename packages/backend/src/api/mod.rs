mod handlers;
mod routes;

use axum::{
    Router,
    routing::{get, post},
    http::StatusCode,
    Json,
    extract::State,
};
use std::sync::Arc;
use tokio::sync::Mutex;
use serde::{Deserialize, Serialize};
use ethereum_types::Address;

use crate::storage::{CredentialStorage, InstitutionStorage};
use crate::blockchain::BlockchainProvider;
use crate::core::{CredentialService, InstitutionService, VerificationService};

pub struct AppState {
    pub credential_service: Option<CredentialService>,
    pub institution_service: Option<InstitutionService>,
    pub verification_service: Option<VerificationService>,
}

impl AppState {
    pub fn new() -> Self {
        // Initialize with empty services for now
        // In a real application, you would properly initialize these with
        // database connections and blockchain providers
        Self {
            credential_service: None,
            institution_service: None,
            verification_service: None,
        }
    }
    
    // This would be used in a real application to initialize services
    pub async fn initialize(&mut self, rpc_url: &str) -> Result<(), Box<dyn std::error::Error>> {
        // Set up storage
        let credential_storage = CredentialStorage::new();
        let institution_storage = InstitutionStorage::new();
        
        // Set up blockchain connection
        let blockchain = BlockchainProvider::new(rpc_url).await?;
        
        // Mock contract address
        let contract_address = Address::zero();
        
        // Create services
        let credential_service = CredentialService::new(
            credential_storage,
            blockchain.clone(),
            contract_address,
        );
        
        let institution_service = InstitutionService::new(
            institution_storage,
        );
        
        let verification_service = VerificationService::new(
            CredentialStorage::new(), // New instance for verification service
            blockchain,
            contract_address,
        );
        
        // Store services
        self.credential_service = Some(credential_service);
        self.institution_service = Some(institution_service);
        self.verification_service = Some(verification_service);
        
        Ok(())
    }
}

pub type SharedState = Arc<Mutex<AppState>>;

// Main router function
pub fn router(state: SharedState) -> Router {
    // Combine all routes
    Router::new()
        .merge(routes::credentials::router())
        .merge(routes::institutions::router())
        .merge(routes::verification::router())
        .route("/health", get(handlers::health_check))
        .with_state(state)
}