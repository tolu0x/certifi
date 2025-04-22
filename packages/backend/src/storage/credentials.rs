use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::models::Credential;
use super::{Storage, StorageError};

// In-memory implementation for credential storage
// For a production system, this would be replaced with a database implementation
pub struct CredentialStorage {
    store: Arc<RwLock<HashMap<String, Credential>>>,
}

impl CredentialStorage {
    pub fn new() -> Self {
        Self {
            store: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

#[async_trait::async_trait]
impl Storage<Credential, String> for CredentialStorage {
    async fn create(&self, credential: Credential) -> Result<Credential, StorageError> {
        let mut store = self.store.write().await;
        
        if store.contains_key(&credential.id) {
            return Err(StorageError::DuplicateEntry);
        }
        
        let credential_clone = credential.clone();
        store.insert(credential.id.clone(), credential);
        
        Ok(credential_clone)
    }
    
    async fn get(&self, id: String) -> Result<Option<Credential>, StorageError> {
        let store = self.store.read().await;
        
        Ok(store.get(&id).cloned())
    }
    
    async fn update(&self, id: String, credential: Credential) -> Result<Credential, StorageError> {
        let mut store = self.store.write().await;
        
        if !store.contains_key(&id) {
            return Err(StorageError::NotFound);
        }
        
        let credential_clone = credential.clone();
        store.insert(id, credential);
        
        Ok(credential_clone)
    }
    
    async fn delete(&self, id: String) -> Result<(), StorageError> {
        let mut store = self.store.write().await;
        
        if !store.contains_key(&id) {
            return Err(StorageError::NotFound);
        }
        
        store.remove(&id);
        
        Ok(())
    }
}