# Contributing to Zecret-banker

Thank you for your interest in contributing to Zecret-banker! This document provides guidelines and instructions to help you contribute effectively.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to foster an inclusive and respectful community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```
   git clone https://github.com/YOUR-USERNAME/zecret-banker.git
   cd zecret-banker
   ```
3. **Set up upstream remote**:
   ```
   git remote add upstream https://github.com/ORIGINAL-OWNER/zecret-banker.git
   ```
4. **Install dependencies**:
   ```
   npm install
   ```

## Development Guidelines

### Branching Strategy
- Create feature branches from `main`
- Use descriptive names: `feature/add-zcash-integration`, `fix/wallet-connection-issue`

### Coding Standards
- Follow the existing code style and conventions
- Use meaningful variable and function names
- Write comments for complex logic
- Keep functions small and focused

### Commit Messages
- Use clear, descriptive commit messages
- Start with a verb in imperative mood (e.g., "Add", "Fix", "Update")
- Reference issue numbers when applicable

## Testing

- Write tests for new features and bug fixes
- Ensure all tests pass before submitting a pull request
- Test your changes on multiple browsers if applicable
- For blockchain operations, test on testnet before mainnet

## Reporting Issues

- Use the GitHub issue tracker
- Check if the issue has already been reported
- Include detailed steps to reproduce the issue
- Provide system information (browser, OS, etc.)
- Add screenshots if applicable

## Feature Requests

- Use the GitHub issue tracker with label "enhancement"
- Clearly describe the feature and its benefits
- Discuss implementation ideas if you have them

## Working with Blockchain Components

### NEAR Protocol
- Follow NEAR best practices for contract interactions
- Test thoroughly on NEAR testnet

### Zcash
- Adhere to privacy best practices
- Document any changes to shielded transaction handling

### Secret Network
- Respect privacy and encryption standards
- Document any changes to privacy-preserving features

## Documentation

- Update documentation for any code changes
- Document new features, APIs, or configuration options
- Use clear, concise language
- Include examples where appropriate

## Pull Request Process

1. Update your fork to the latest upstream version
2. Create your feature branch from `main`
3. Make your changes and commit them
4. Push to your fork and submit a pull request
5. Respond to any feedback or requested changes

## Review Process

- At least one maintainer will review your PR
- Address all feedback and make necessary changes
- Once approved, a maintainer will merge your PR

Thank you for contributing to Zecret-banker! Your efforts help improve the project for everyone. 