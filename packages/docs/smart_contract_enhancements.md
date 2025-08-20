# Certifi Smart Contract Enhancements

This document outlines the enhancements made to the Certifi smart contract to support additional metadata fields and credential revocation functionality.

## Credential Structure

We replaced the simple boolean mapping with a structured `Credential` object that contains:

```solidity
struct Credential {
    bool isIssued;
    bool isRevoked;
    address issuer;
    address recipient;
    uint256 issueDate;
}
```

## Metadata Support

1. **Issue Date**: Each credential now automatically stores the timestamp when it was issued.


## Credential Revocation

We've implemented credential revocation functionality:

1. **Revocation Method**: Added a `revokeCredential` function that allows the original issuer of a credential to revoke it.

2. **Revocation Status**: Each credential includes a `isRevoked` flag that tracks whether it has been revoked.

3. **Validation Logic**: All verification methods now check the revocation status of credentials.

## Enhanced Verification Methods

We've improved the verification methods:

1. **Comprehensive Verification**: The `verifyCredential` function now returns detailed information about the credential, including its validity status, issuer, and issue date.

2. **Simple Verification**: Added an `isCredentialValid` function that provides a simple boolean check for whether a credential is valid (issued, and not revoked).

3. **Signature Verification**: Updated the `verifyCredentialWithSignature` function to check revocation status and expiration date.

## Backward Compatibility

To maintain backward compatibility with existing integrations:

1. **Overloaded Issue Method**: We've kept the original `issueCredential` function signature and implemented an overloaded version that accepts additional metadata parameters.

## Security Enhancements

We've added security improvements:

1. **Issuer Check**: Added an `onlyCredentialIssuer` modifier to ensure that only the original issuer of a credential can revoke it.

2. **Event Logging**: Enhanced events to include additional metadata for better off-chain tracking and auditing.

## Testing

We've added comprehensive tests for all new functionality:

1. **Metadata Tests**: Tests for issuing credentials with metadata and verifying the metadata is correctly stored.

2. **Revocation Tests**: Tests for credential revocation and verification of revoked credentials.

3. **Expiration Tests**: Tests for credential expiration and validation of expired credentials.

4. **Signature Tests**: Tests for verifying credentials with signatures, including after revocation.