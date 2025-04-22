use serde_json::Value;
use std::error::Error;
use ethereum_types::Address;

use crate::models::Credential;
use crate::storage::{CredentialStorage, Storage};
use crate::blockchain::{BlockchainProvider, store_credential_hash};
use crate::crypto::{compute_credential_hash, sign_message};

pub struct CredentialService {
    storage: CredentialStorage,
    blockchain: BlockchainProvider,
    contract_address: Address,
}

impl CredentialService {
    pub fn new(
        storage: CredentialStorage,
        blockchain: BlockchainProvider,
        contract_address: Address,
    ) -> Self {
        Self {
            storage,
            blockchain,
            contract_address,
        }
    }
    
    // Issue a new credential
    pub async fn issue_credential(
        &self,
        issuer_id: String,
        recipient_id: String,
        credential_type: String,
        data: Value,
        private_key: &str,
    ) -> Result<Credential, Box<dyn Error>> {
        // Create new credential
        let mut credential = Credential::new(
            issuer_id,
            recipient_id,
            credential_type,
            data,
        );
        
        // Compute hash
        let data_json = serde_json::to_vec(&credential.data)?;
        let hash = compute_credential_hash(&data_json)?;
        credential.hash = hash.clone();
        
        // Sign credential
        let signature = sign_message(&data_json, private_key)?;
        credential.signature = signature;
        
        // Store on blockchain
        let txn_hash = store_credential_hash(
            &self.blockchain,
            self.contract_address,
            &credential.id,
            &credential.hash,
            // Removed signer parameter as we simplified the function
        ).await?;
        
        // Store in local storage
        let credential = self.storage.create(credential).await?;
        
        Ok(credential)
    }
    
    // Get a credential by ID
    pub async fn get_credential(&self, id: &str) -> Result<Option<Credential>, Box<dyn Error>> {
        let credential = self.storage.get(id.to_string()).await?;
        Ok(credential)
    }
    
    // Revoke a credential
    pub async fn revoke_credential(
        &self,
        id: &str,
        reason: &str,
        private_key: &str,
    ) -> Result<Credential, Box<dyn Error>> {
        // Get credential
        let mut credential = match self.storage.get(id.to_string()).await? {
            Some(credential) => credential,
            None => return Err("Credential not found".into()),
        };
        
        // Update revocation status
        use crate::models::RevocationStatus;
        credential.revocation_status = RevocationStatus::Revoked {
            timestamp: chrono::Utc::now(),
            reason: reason.to_string(),
        };
        
        // Update on blockchain (placeholder)
        // In a real implementation, you would call the contract to record the revocation
        
        // Update in storage
        let updated = self.storage.update(id.to_string(), credential).await?;
        
        Ok(updated)
    }
}