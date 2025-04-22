use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use crate::utils::generate_uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Institution {
    pub id: String,
    pub name: String,
    pub blockchain_address: String,
    pub public_key: String, 
    pub status: InstitutionStatus,
    pub registration_date: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InstitutionStatus {
    Pending,
    Active,
    Suspended { reason: String },
}

impl Institution {
    pub fn new(
        name: String,
        blockchain_address: String,
        public_key: String,
    ) -> Self {
        let id = format!("inst-{}", generate_uuid());
        
        Self {
            id,
            name,
            blockchain_address,
            public_key,
            status: InstitutionStatus::Pending,
            registration_date: Utc::now(),
        }
    }
    
    pub fn activate(&mut self) {
        self.status = InstitutionStatus::Active;
    }
    
    pub fn suspend(&mut self, reason: String) {
        self.status = InstitutionStatus::Suspended { reason };
    }
    
    pub fn is_active(&self) -> bool {
        matches!(self.status, InstitutionStatus::Active)
    }
}