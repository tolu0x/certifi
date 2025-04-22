use std::error::Error;
use ethereum_types::Address;

use crate::models::Credential;
use crate::storage::{CredentialStorage, Storage};
use crate::blockchain::{BlockchainProvider, verify_credential_on_chain};
use crate::crypto::{compute_credential_hash, verify_hash, verify_signature};

pub struct VerificationService {
    credential_storage: CredentialStorage,
    blockchain: BlockchainProvider,
    contract_address: Address,
}

impl VerificationService {
    pub fn new(
        credential_storage: CredentialStorage,
        blockchain: BlockchainProvider,
        contract_address: Address,
    ) -> Self {
        Self {
            credential_storage,
            blockchain,
            contract_address,
        }
    }
    
    // Verify a credential's authenticity
    pub async fn verify_credential(
        &self,
        credential_id: &str,
        expected_hash: Option<&str>,
    ) -> Result<VerificationResult, Box<dyn Error>> {
        // Get credential from storage
        let credential = match self.credential_storage.get(credential_id.to_string()).await? {
            Some(credential) => credential,
            None => return Ok(VerificationResult::invalid("Credential not found")),
        };
        
        // Check if credential is active
        if !credential.is_valid() {
            return Ok(VerificationResult::invalid("Credential has been revoked"));
        }
        
        // Verify against blockchain (on-chain verification)
        let on_chain_valid = verify_credential_on_chain(
            &self.blockchain,
            self.contract_address,
            credential_id,
            &credential.hash,
        ).await?;
        
        if !on_chain_valid {
            return Ok(VerificationResult::invalid("Credential hash mismatch on blockchain"));
        }
        
        // Check provided hash if any
        if let Some(hash) = expected_hash {
            if hash != credential.hash {
                return Ok(VerificationResult::invalid("Provided hash does not match stored hash"));
            }
        }
        
        // All checks passed
        Ok(VerificationResult::valid(credential))
    }
}

// Verification result
pub struct VerificationResult {
    pub is_valid: bool,
    pub credential: Option<Credential>,
    pub reason: Option<String>,
}

impl VerificationResult {
    pub fn valid(credential: Credential) -> Self {
        Self {
            is_valid: true,
            credential: Some(credential),
            reason: None,
        }
    }
    
    pub fn invalid(reason: &str) -> Self {
        Self {
            is_valid: false,
            credential: None,
            reason: Some(reason.to_string()),
        }
    }
}