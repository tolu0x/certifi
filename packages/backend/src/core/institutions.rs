use std::error::Error;

use crate::models::{Institution, InstitutionStatus};
use crate::storage::{InstitutionStorage, Storage};

pub struct InstitutionService {
    storage: InstitutionStorage,
}

impl InstitutionService {
    pub fn new(storage: InstitutionStorage) -> Self {
        Self { storage }
    }
    
    // Register a new institution
    pub async fn register_institution(
        &self,
        name: String,
        blockchain_address: String,
        public_key: String,
    ) -> Result<Institution, Box<dyn Error>> {
        // Create new institution
        let institution = Institution::new(
            name,
            blockchain_address,
            public_key,
        );
        
        // Store in database
        let institution = self.storage.create(institution).await?;
        
        Ok(institution)
    }
    
    // Get institution by ID
    pub async fn get_institution(&self, id: &str) -> Result<Option<Institution>, Box<dyn Error>> {
        let institution = self.storage.get(id.to_string()).await?;
        Ok(institution)
    }
    
    // Activate institution
    pub async fn activate_institution(&self, id: &str) -> Result<Institution, Box<dyn Error>> {
        // Get institution
        let mut institution = match self.storage.get(id.to_string()).await? {
            Some(institution) => institution,
            None => return Err("Institution not found".into()),
        };
        
        // Update status
        institution.activate();
        
        // Update in storage
        let updated = self.storage.update(id.to_string(), institution).await?;
        
        Ok(updated)
    }
    
    // Suspend institution
    pub async fn suspend_institution(&self, id: &str, reason: &str) -> Result<Institution, Box<dyn Error>> {
        // Get institution
        let mut institution = match self.storage.get(id.to_string()).await? {
            Some(institution) => institution,
            None => return Err("Institution not found".into()),
        };
        
        // Update status
        institution.suspend(reason.to_string());
        
        // Update in storage
        let updated = self.storage.update(id.to_string(), institution).await?;
        
        Ok(updated)
    }
}