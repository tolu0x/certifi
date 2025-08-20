# Certifi Architecture

## System Overview

Certifi is a decentralized application (dApp) for issuing and verifying educational certificates and professional credentials. The application leverages blockchain technology to provide tamper-proof, verifiable certificates.

## Key Entities

### 1. Institutions

Educational or credentialing organizations that issue certificates to students or professionals.

**Responsibilities:**
- Register on the platform
- Get approved as legitimate issuers
- Issue digital certificates with recipient metadata
- Manage issued certificates

**Data Structure:**
```
Institution {
  address: Ethereum address (primary identifier)
  name: String
  website: String
  logoURL: String
  isApproved: Boolean
  approvalDate: Timestamp
  contactEmail: String
  institutionType: String (University, College, Training Center, etc.)
}
```

### 2. Students/Recipients

Individuals who receive credentials from institutions.

**Responsibilities:**
- Access and manage their certificates
- Share certificates with third parties
- Prove ownership of credentials

**Data Structure:**
```
Student {
  address: Ethereum address (primary identifier)
  name: String
  email: String
  dateOfBirth: Date (optional)
  profilePicture: String (optional)
  certificates: Array of Certificate references
}
```

### 3. Verifiers

Third parties who need to verify the authenticity of certificates.

**Responsibilities:**
- Verify certificates through the platform
- View certificate details and issuing institution information

**Data Structure:**
```
No permanent storage needed for verifiers - verification is a stateless process
```

## Certificate Data Structure

```
Certificate {
  credentialHash: Bytes32 (unique identifier on blockchain)
  issuer: Institution reference
  recipient: Student reference
  title: String
  description: String
  issueDate: Timestamp
  metadata: JSON (additional information)
  revoked: Boolean
}
```

## Technical Architecture

### Smart Contract Layer

The Certifi smart contract (already partially implemented) handles:
- Institution approval and management
- Credential issuance and recording on the blockchain
- Verification of credential authenticity
- Signature verification

### Frontend Layer

Built with Next.js for a responsive web interface:
- Institution dashboard for issuing certificates
- Student portal for managing received certificates
- Public verification portal
- User authentication and profile management

### Backend Services

- API endpoints for application functionality
- Authentication and authorization
- File storage and management
- Metadata management
- Integration with blockchain

### Data Storage

- **On-chain storage**: Credential hashes, issuance status, institution approvals
- **Off-chain storage**: Certificate PDFs, images, detailed metadata
- **IPFS or similar**: For decentralized storage of certificate documents

## Key Workflows

### Certificate Issuance Flow

1. Institution logs into their dashboard
2. Institution creates a new certificate with recipient details
3. Institution uploads certificate document/template
4. System generates a unique hash for the certificate
5. Smart contract records the certificate hash on the blockchain
6. Certificate metadata and document stored off-chain
7. Recipient is notified of new certificate

### Verification Flow

1. Verifier accesses the verification portal
2. Verifier inputs certificate ID or scans QR code
3. System retrieves certificate data from storage
4. Smart contract verifies the certificate hash on the blockchain
5. System displays verification result with certificate details
6. Verifier can see issuing institution information

## Security Considerations

- **Certificate Integrity**: Hashing and blockchain storage prevents tampering
- **Authentication**: Wallet-based authentication for institutions and students
- **Authorization**: Role-based access control for platform features
- **Privacy**: Minimal personal data stored on-chain

## Scalability Considerations

- Batch certificate issuance for efficiency
- Optimized smart contract gas usage
- Efficient off-chain storage solutions
- Caching mechanisms for frequently accessed data