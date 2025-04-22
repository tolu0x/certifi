#[cfg(test)]
mod tests {
    use crate::crypto::{
        compute_credential_hash,
        keccak256,
        sign_message,
        verify_signature,
    };
    
    #[test]
    fn test_keccak256_hash() {
        let data = b"test data";
        let hash = keccak256(data);
        
        // This is a known keccak256 hash for "test data"
        let expected_hash = hex::decode("46f9f995e0f2f0ea204a27c0a70a5f5ddeda3040f68b3fd3c035106269da7a33").unwrap();
        
        assert_eq!(hash.to_vec(), expected_hash);
    }
    
    #[test]
    fn test_compute_credential_hash() {
        let result = compute_credential_hash(b"credential data");
        assert!(result.is_ok());
        
        let hash = result.unwrap();
        assert!(hash.starts_with("0x"));
        assert_eq!(hash.len(), 2 + 64); // "0x" + 64 hex chars
    }
}