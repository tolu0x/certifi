use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use crate::utils::generate_uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Credential {
    pub id: String,
    pub issuer_id: String,
    pub recipient_id: String,
    pub credential_type: String,
    pub data: serde_json::Value,
    pub hash: String,
    pub signature: String,
    pub issue_date: DateTime<Utc>,
    pub revocation_status: RevocationStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RevocationStatus {
    Active,
    Revoked { timestamp: DateTime<Utc>, reason: String },
}

impl Credential {
    pub fn new(
        issuer_id: String,
        recipient_id: String,
        credential_type: String,
        data: serde_json::Value,
    ) -> Self {
        let id = format!("cred-{}", generate_uuid());
        
        Self {
            id,
            issuer_id,
            recipient_id,
            credential_type,
            data,
            hash: String::new(), // Will be computed later
            signature: String::new(), // Will be signed later
            issue_date: Utc::now(),
            revocation_status: RevocationStatus::Active,
        }
    }
    
    // Compute hash of credential data
    pub fn compute_hash(&self) -> String {
        // TODO: Implement proper hashing
        "placeholder_hash".to_string()
    }
    
    // Check if credential is currently valid
    pub fn is_valid(&self) -> bool {
        matches!(self.revocation_status, RevocationStatus::Active)
    }
}