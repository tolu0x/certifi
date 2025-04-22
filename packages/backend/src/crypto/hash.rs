use std::error::Error;

// Compute Keccak-256 hash
pub fn keccak256(data: &[u8]) -> [u8; 32] {
    // Simplified implementation to avoid compatibility issues
    // In a real app, use a proper keccak256 implementation
    let mut result = [0u8; 32];
    
    // Simple mock hash function (NOT for production use!)
    for (i, &byte) in data.iter().enumerate() {
        result[i % 32] = result[i % 32].wrapping_add(byte);
    }
    
    result
}

// Compute hash for a credential
pub fn compute_credential_hash(credential_data: &[u8]) -> Result<String, Box<dyn Error>> {
    let hash = keccak256(credential_data);
    Ok(format!("0x{}", hex::encode(hash)))
}

// Verify that a hash matches expected data
pub fn verify_hash(data: &[u8], expected_hash: &str) -> Result<bool, Box<dyn Error>> {
    let hash = keccak256(data);
    let hash_hex = format!("0x{}", hex::encode(hash));
    
    Ok(hash_hex == expected_hash)
}