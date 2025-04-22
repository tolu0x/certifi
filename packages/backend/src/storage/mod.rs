mod credentials;
mod institutions;

pub use credentials::*;
pub use institutions::*;

// Interface for storage implementations
#[async_trait::async_trait]
pub trait Storage<T, ID> {
    async fn create(&self, item: T) -> Result<T, StorageError>;
    async fn get(&self, id: ID) -> Result<Option<T>, StorageError>;
    async fn update(&self, id: ID, item: T) -> Result<T, StorageError>;
    async fn delete(&self, id: ID) -> Result<(), StorageError>;
}

// Storage error type
#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("Item not found")]
    NotFound,
    
    #[error("Storage operation failed: {0}")]
    OperationFailed(String),
    
    #[error("Invalid data: {0}")]
    InvalidData(String),
    
    #[error("Duplicate entry")]
    DuplicateEntry,
}