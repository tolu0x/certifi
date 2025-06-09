# Certifi MVP Development Todo List

This document outlines the tasks required to build a Minimum Viable Product (MVP) for the Certifi certificate verification platform.

## Architecture Overview

The Certifi platform connects three key entities:
1. **Institutions**: Educational or professional bodies that issue certificates
2. **Students/Recipients**: Individuals who receive certificates from institutions
3. **Verifiers**: Third parties who need to verify certificate authenticity

## Smart Contract (Completed)

- [x] Define basic contract structure
- [x] Implement institution approval mechanism
- [x] Implement credential issuance functionality
- [x] Implement verification methods
- [x] Add additional metadata fields for credentials
- [x] Implement credential revocation functionality

## Frontend Development

### Authentication & User Management
- [ ] Design and implement user registration flow for all three user types
- [ ] Create login system with wallet connection
- [ ] Implement role-based access control
- [ ] Design user profile pages for each user type

### Institution Dashboard
- [x] Create institution dashboard UI
- [x] Implement certificate issuance form
  - [x] File upload for certificate template/PDF
  - [x] Student metadata input fields
  - [x] Batch upload capability
- [x] Add institution management settings
- [x] Create issued certificates history view

### Student Portal
- [ ] Design student dashboard UI
- [ ] Create certificate viewing and download functionality
- [ ] Implement certificate sharing options
  - [ ] Generate shareable links
  - [ ] QR code generation
- [ ] Add student profile management

### Verification Portal
- [x] Create public verification page
- [x] Implement certificate verification widget
  - [x] Certificate lookup by ID/hash
  - [x] QR code scanner for verification
- [x] Display verification results with credential metadata
- [x] Show issuing institution details upon verification

## Backend & API Development

- [ ] Design and implement RESTful API endpoints
- [ ] Create authentication middleware
- [x] Develop service layer for smart contract interactions
- [x] Implement certificate metadata storage solution
- [ ] Create data models for users, institutions, and certificates
- [x] Implement file storage for certificate documents

## Integration & Testing

- [x] Connect frontend to blockchain with ethers.js/web3.js
- [ ] Integrate frontend with backend API
- [x] Set up test networks for development
- [x] Create test suite for smart contract
- [ ] Develop end-to-end tests for core user flows
- [x] Test verification process on multiple devices

## Documentation

- [ ] Create technical architecture documentation
- [ ] Write user guides for all three user types
- [ ] Document API endpoints
- [ ] Create deployment guide
- [ ] Prepare demo scripts for presentations

