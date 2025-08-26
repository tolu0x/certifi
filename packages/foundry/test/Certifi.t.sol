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

    function setUp() public {
        owner = address(this);
        institution = makeAddr("institution");
        student = makeAddr("student");


        certifi = new Certifi(owner);

        // Give the test contract some ETH to work with
        vm.deal(owner, 10 ether);
        vm.deal(institution, 1 ether);
        vm.deal(student, 1 ether);
    }

    function testApproveInstitution() public {
        certifi.approveInstitution(institution);
        assertTrue(certifi.approvedInstitutions(institution));
    }

    function testRevokeInstitution() public {
        certifi.approveInstitution(institution);
        assertTrue(certifi.approvedInstitutions(institution));

        certifi.revokeInstitution(institution);
        assertFalse(certifi.approvedInstitutions(institution));
    }

    function testFailNotOwnerApproveInstitution() public {
        vm.prank(institution);
        certifi.approveInstitution(institution);
    }

    function testIssueBasicCredential() public {
        bytes32 documentHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        certifi.approveInstitution(institution);

        vm.prank(institution);
        certifi.issueCredential(documentHash);

        ( 
            bool isValid,
            address issuer,
            uint256 issueDate,
            bytes32 returnedDocumentHash
        ) = certifi.verifyCredential(documentHash);

        assertTrue(isValid);
        assertEq(issuer, institution);
        assertGt(issueDate, 0);
        assertEq(returnedDocumentHash, documentHash);
    }

    function testFailNotApprovedIssueCredential() public {
        bytes32 documentHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        certifi.issueCredential(documentHash);
    }

    function testRevokeCredential() public {
        bytes32 documentHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        certifi.approveInstitution(institution);

        vm.prank(institution);
        certifi.issueCredential(documentHash);

        assertTrue(certifi.isCredentialValid(documentHash));

        vm.prank(institution);
        certifi.revokeCredential(documentHash);

        assertFalse(certifi.isCredentialValid(documentHash));
    }

    function testFailRevokeCredentialNotIssuer() public {
        bytes32 documentHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        certifi.approveInstitution(institution);
        address otherInstitution = makeAddr("otherInstitution");
        certifi.approveInstitution(otherInstitution);

        vm.prank(institution);
        certifi.issueCredential(documentHash);

        vm.prank(otherInstitution);
        certifi.revokeCredential(documentHash);
    }

    function testVerifyCredentialWithSignature() public {
        bytes32 documentHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        certifi.approveInstitution(institution);
        uint256 institutionPrivateKey = 0xA11CE;
        address institutionWithKey = vm.addr(institutionPrivateKey);
        certifi.approveInstitution(institutionWithKey);

        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", documentHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            institutionPrivateKey,
            messageHash
        );
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(institutionWithKey);
        certifi.issueCredential(documentHash);

        bool verified = certifi.verifyCredentialWithSignature(
            documentHash,
            signature,
            institutionWithKey
        );
        assertTrue(verified);
    }

    function testVerifyWithIncorrectSignature() public {
        // Create a document hash
        bytes32 documentHash = keccak256(
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
        certifi.issueCredential(documentHash);

        // Create an incorrect signature
        uint256 wrongPrivateKey = 0xB0B;
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", documentHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongPrivateKey, messageHash);
        bytes memory wrongSignature = abi.encodePacked(r, s, v);

        // This should return false rather than revert
        bool verified = certifi.verifyCredentialWithSignature(
            documentHash,
            wrongSignature,
            institution
        );
        assertFalse(verified);
    }

    // Test verification with signature for revoked credential
    function testVerifyRevokedCredentialWithSignature() public {
        // Create a document hash
        bytes32 documentHash = keccak256(
            abi.encodePacked(
                "Bachelor of Computer Science",
                student,
                block.timestamp
            )
        );

        uint256 institutionPrivateKey = 0xA11CE;
        address institutionWithKey = vm.addr(institutionPrivateKey);
        certifi.approveInstitution(institutionWithKey);

        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", documentHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            institutionPrivateKey,
            messageHash
        );
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(institutionWithKey);
        certifi.issueCredential(documentHash);

        vm.prank(institutionWithKey);
        certifi.revokeCredential(documentHash);

        bool verified = certifi.verifyCredentialWithSignature(
            documentHash,
            signature,
            institutionWithKey
        );
        assertFalse(verified);
    }
}
