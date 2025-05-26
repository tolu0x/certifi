//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// [TODO]: Remove when deploying to mainnet
// import "forge-std/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * Certifi - A smart contract for managing and verifying educational and professional credentials
 * This contract allows educational institutions to issue digital credentials that can be verified on-chain
 */
contract Certifi {
    using ECDSA for bytes32;

    // Credential structure to store additional metadata
    struct Credential {
        bool isIssued;
        bool isRevoked;
        address issuer;
        address recipient;
        uint256 issueDate;
        uint256 expiryDate; // 0 means no expiration
        string metadataURI; // URI pointing to off-chain metadata (IPFS or other storage)
    }

    // State Variables
    address public immutable owner;
    
    // Mapping from credential hash to Credential struct
    mapping(bytes32 => Credential) public credentials;
    
    // Mapping from institution address to approval status
    mapping(address => bool) public approvedInstitutions;
    
    // Events
    event CredentialIssued(
        bytes32 indexed credentialHash, 
        address indexed issuer, 
        address indexed recipient, 
        uint256 issueDate, 
        uint256 expiryDate, 
        string metadataURI
    );
    event CredentialRevoked(bytes32 indexed credentialHash, address indexed issuer);
    event InstitutionApproved(address indexed institution);
    event InstitutionRevoked(address indexed institution);

    // Constructor
    constructor(address _owner) {
        owner = _owner;
        approvedInstitutions[_owner] = true;
    }

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier onlyApprovedInstitution() {
        require(approvedInstitutions[msg.sender], "Not an approved institution");
        _;
    }

    modifier onlyCredentialIssuer(bytes32 credentialHash) {
        require(credentials[credentialHash].issuer == msg.sender, "Not the credential issuer");
        _;
    }

    /**
     * Approves an institution to issue credentials
     * @param institution The address of the institution to approve
     */
    function approveInstitution(address institution) external onlyOwner {
        approvedInstitutions[institution] = true;
        emit InstitutionApproved(institution);
    }

    /**
     * Revokes an institution's approval to issue credentials
     * @param institution The address of the institution to revoke
     */
    function revokeInstitution(address institution) external onlyOwner {
        require(institution != owner, "Cannot revoke owner");
        approvedInstitutions[institution] = false;
        emit InstitutionRevoked(institution);
    }

    /**
     * Issues a new credential with metadata and records it on the blockchain
     * @param credentialHash The hash of the credential data
     * @param recipient The address of the credential recipient
     * @param expiryDate The expiration date of the credential (0 for no expiration)
     * @param metadataURI URI pointing to off-chain metadata
     */
    function issueCredential(
        bytes32 credentialHash, 
        address recipient, 
        uint256 expiryDate, 
        string calldata metadataURI
    ) external onlyApprovedInstitution {
        require(!credentials[credentialHash].isIssued, "Credential already issued");
        
        Credential memory newCredential = Credential({
            isIssued: true,
            isRevoked: false,
            issuer: msg.sender,
            recipient: recipient,
            issueDate: block.timestamp,
            expiryDate: expiryDate,
            metadataURI: metadataURI
        });
        
        credentials[credentialHash] = newCredential;
        
        emit CredentialIssued(
            credentialHash, 
            msg.sender, 
            recipient, 
            block.timestamp, 
            expiryDate, 
            metadataURI
        );
    }

    /**
     * Issues a new credential without additional metadata (backwards compatibility)
     * @param credentialHash The hash of the credential data
     * @param recipient The address of the credential recipient
     */
    function issueCredential(bytes32 credentialHash, address recipient) external onlyApprovedInstitution {
        require(!credentials[credentialHash].isIssued, "Credential already issued");
        
        Credential memory newCredential = Credential({
            isIssued: true,
            isRevoked: false,
            issuer: msg.sender,
            recipient: recipient,
            issueDate: block.timestamp,
            expiryDate: 0,
            metadataURI: ""
        });
        
        credentials[credentialHash] = newCredential;
        
        emit CredentialIssued(
            credentialHash, 
            msg.sender, 
            recipient, 
            block.timestamp, 
            0, 
            ""
        );
    }

    /**
     * Revokes a previously issued credential
     * @param credentialHash The hash of the credential to revoke
     */
    function revokeCredential(bytes32 credentialHash) 
        external 
        onlyApprovedInstitution 
        onlyCredentialIssuer(credentialHash) 
    {
        require(credentials[credentialHash].isIssued, "Credential not issued");
        require(!credentials[credentialHash].isRevoked, "Credential already revoked");
        
        credentials[credentialHash].isRevoked = true;
        
        emit CredentialRevoked(credentialHash, msg.sender);
    }

    /**
     * Verifies a credential based on its hash
     * @param credentialHash The hash of the credential to verify
     * @return isValid True if the credential is valid (issued and not revoked or expired)
     * @return issuer The address of the credential issuer
     * @return issueDate The date when the credential was issued
     * @return expiryDate The expiration date of the credential (0 for no expiration)
     */
    function verifyCredential(bytes32 credentialHash) 
        external 
        view 
        returns (
            bool isValid, 
            address issuer, 
            uint256 issueDate, 
            uint256 expiryDate,
            string memory metadataURI
        ) 
    {
        Credential memory cred = credentials[credentialHash];
        
        bool valid = cred.isIssued && 
                   !cred.isRevoked && 
                   (cred.expiryDate == 0 || block.timestamp <= cred.expiryDate);
        
        return (
            valid,
            cred.issuer,
            cred.issueDate,
            cred.expiryDate,
            cred.metadataURI
        );
    }

    /**
     * Simple verification that just checks if a credential is valid
     * @param credentialHash The hash of the credential to verify
     * @return True if the credential is valid, false otherwise
     */
    function isCredentialValid(bytes32 credentialHash) external view returns (bool) {
        Credential memory cred = credentials[credentialHash];
        
        return cred.isIssued && 
               !cred.isRevoked && 
               (cred.expiryDate == 0 || block.timestamp <= cred.expiryDate);
    }

    /**
     * Verifies a credential with a signature
     * @param credentialHash The hash of the credential data
     * @param signature The signature of the credential hash by the issuer
     * @param issuer The address of the claimed issuer
     * @return True if the credential is valid and the signature matches, false otherwise
     */
    function verifyCredentialWithSignature(
        bytes32 credentialHash, 
        bytes memory signature, 
        address issuer
    ) external view returns (bool) {
        Credential memory cred = credentials[credentialHash];
        
        // Check if the credential is valid
        if (!cred.isIssued || 
            cred.isRevoked || 
            (cred.expiryDate != 0 && block.timestamp > cred.expiryDate)) {
            return false;
        }
        
        // Check if the issuer is approved
        if (!approvedInstitutions[issuer]) {
            return false;
        }
        
        // Verify the signature
        bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", credentialHash));
        address signer = messageHash.recover(signature);
        
        return signer == issuer;
    }
}