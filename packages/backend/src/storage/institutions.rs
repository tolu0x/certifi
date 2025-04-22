use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::models::Institution;
use super::{Storage, StorageError};

// In-memory implementation for institution storage
// For a production system, this would be replaced with a database implementation
pub struct InstitutionStorage {
    store: Arc<RwLock<HashMap<String, Institution>>>,
}

impl InstitutionStorage {
    pub fn new() -> Self {
        Self {
            store: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

#[async_trait::async_trait]
impl Storage<Institution, String> for InstitutionStorage {
    async fn create(&self, institution: Institution) -> Result<Institution, StorageError> {
        let mut store = self.store.write().await;
        
        if store.contains_key(&institution.id) {
            return Err(StorageError::DuplicateEntry);
        }
        
        let institution_clone = institution.clone();
        store.insert(institution.id.clone(), institution);
        
        Ok(institution_clone)
    }
    
    async fn get(&self, id: String) -> Result<Option<Institution>, StorageError> {
        let store = self.store.read().await;
        
        Ok(store.get(&id).cloned())
    }
    
    async fn update(&self, id: String, institution: Institution) -> Result<Institution, StorageError> {
        let mut store = self.store.write().await;
        
        if !store.contains_key(&id) {
            return Err(StorageError::NotFound);
        }
        
        let institution_clone = institution.clone();
        store.insert(id, institution);
        
        Ok(institution_clone)
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