//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/Certifi.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract CertifiTest is Test {
    using ECDSA for bytes32;

    Certifi public certifi;
    address public owner;
    address public institution;
    address public student;

    // Set up test environment
    function setUp() public {
        owner = address(this);
        institution = makeAddr("institution");
        student = makeAddr("student");

        // Deploy contract with owner
        certifi = new Certifi(owner);

        // Give the test contract some ETH to work with
        vm.deal(owner, 10 ether);
        vm.deal(institution, 1 ether);
        vm.deal(student, 1 ether);
    }

    // Test approving an institution
    function testApproveInstitution() public {
        certifi.approveInstitution(institution);
        assertTrue(certifi.approvedInstitutions(institution));
    }

    // Test revoking an institution
    function testRevokeInstitution() public {
        certifi.approveInstitution(institution);
        assertTrue(certifi.approvedInstitutions(institution));

        certifi.revokeInstitution(institution);
        assertFalse(certifi.approvedInstitutions(institution));
    }

    // Test that non-owner can't approve institutions
    function testFailNotOwnerApproveInstitution() public {
        vm.prank(institution);
        certifi.approveInstitution(institution);
    }

    // Test issuing a credential with basic information
    function testIssueBasicCredential() public {
        // Create a credential hash
        bytes32 credentialHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        // Approve institution
        certifi.approveInstitution(institution);

        // Issue credential as institution
        vm.prank(institution);
        certifi.issueCredential(credentialHash);

        // Verify credential is issued
        (
            bool isValid,
            address issuer,
            uint256 issueDate,
            bytes32 returnedDocumentHash
        ) = certifi.verifyCredential(credentialHash);

        assertTrue(isValid);
        assertEq(issuer, institution);
        assertGt(issueDate, 0);
    }

    // Test issuing a credential with full metadata
    function testIssueCredentialWithMetadata() public {
        // Create a credential hash
        bytes32 credentialHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        // Approve institution
        certifi.approveInstitution(institution);

        string
            memory metadataURI = "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";

        bytes32 documentHash = keccak256("a");

        // Issue credential as institution with metadata
        vm.prank(institution);
        certifi.issueCredential(credentialHash, documentHash);

        // Verify credential is issued with correct metadata
        (
            bool isValid,
            address issuer,
            uint256 issueDate,
            bytes32 returnedDocumentHash
        ) = certifi.verifyCredential(credentialHash);

        assertTrue(isValid);
        assertEq(issuer, institution);
        assertGt(issueDate, 0);
    }

    // Test that non-approved institutions can't issue credentials
    function testFailNotApprovedIssueCredential() public {
        bytes32 credentialHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        vm.prank(student);
        certifi.issueCredential(credentialHash);
    }

    // Test revoking a credential
    function testRevokeCredential() public {
        // Create a credential hash
        bytes32 credentialHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        // Approve institution
        certifi.approveInstitution(institution);

        // Issue credential as institution
        vm.prank(institution);
        certifi.issueCredential(credentialHash);

        // Verify credential is valid
        assertTrue(certifi.isCredentialValid(credentialHash));

        // Revoke credential
        vm.prank(institution);
        certifi.revokeCredential(credentialHash);

        // Verify credential is now invalid
        assertFalse(certifi.isCredentialValid(credentialHash));
    }

    // Test that only the issuer can revoke a credential
    function testFailRevokeCredentialNotIssuer() public {
        // Create a credential hash
        bytes32 credentialHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        // Approve institutions
        certifi.approveInstitution(institution);
        address otherInstitution = makeAddr("otherInstitution");
        certifi.approveInstitution(otherInstitution);

        // Issue credential as institution
        vm.prank(institution);
        certifi.issueCredential(credentialHash);

        // Try to revoke as other institution
        vm.prank(otherInstitution);
        certifi.revokeCredential(credentialHash);
    }

    // Test verification with signature
    function testVerifyCredentialWithSignature() public {
        // Create a credential hash
        bytes32 credentialHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        // Approve institution and give it a private key
        certifi.approveInstitution(institution);
        uint256 institutionPrivateKey = 0xA11CE;
        address institutionWithKey = vm.addr(institutionPrivateKey);
        certifi.approveInstitution(institutionWithKey);

        // Sign the credential
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", credentialHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            institutionPrivateKey,
            messageHash
        );
        bytes memory signature = abi.encodePacked(r, s, v);

        // Issue credential as the institution
        vm.prank(institutionWithKey);
        certifi.issueCredential(credentialHash);

        // Verify with signature
        bool verified = certifi.verifyCredentialWithSignature(
            credentialHash,
            signature,
            institutionWithKey
        );
        assertTrue(verified);
    }

    // Test verification with incorrect signature
    function testVerifyWithIncorrectSignature() public {
        // Create a credential hash
        bytes32 credentialHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        // Approve institution
        certifi.approveInstitution(institution);

        // Issue credential
        vm.prank(institution);
        certifi.issueCredential(credentialHash);

        // Create an incorrect signature
        uint256 wrongPrivateKey = 0xB0B;
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", credentialHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongPrivateKey, messageHash);
        bytes memory wrongSignature = abi.encodePacked(r, s, v);

        // This should return false rather than revert
        bool verified = certifi.verifyCredentialWithSignature(
            credentialHash,
            wrongSignature,
            institution
        );
        assertFalse(verified);
    }

    // Test verification with signature for revoked credential
    function testVerifyRevokedCredentialWithSignature() public {
        // Create a credential hash
        bytes32 credentialHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        // Approve institution and give it a private key
        uint256 institutionPrivateKey = 0xA11CE;
        address institutionWithKey = vm.addr(institutionPrivateKey);
        certifi.approveInstitution(institutionWithKey);

        // Sign the credential
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", credentialHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            institutionPrivateKey,
            messageHash
        );
        bytes memory signature = abi.encodePacked(r, s, v);

        // Issue credential as the institution
        vm.prank(institutionWithKey);
        certifi.issueCredential(credentialHash);

        // Revoke the credential
        vm.prank(institutionWithKey);
        certifi.revokeCredential(credentialHash);

        // Verification should fail for revoked credential
        bool verified = certifi.verifyCredentialWithSignature(
            credentialHash,
            signature,
            institutionWithKey
        );
        assertFalse(verified);
    }
}
