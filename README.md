# Zecret-banker

This project implements a bridge between NEAR Protocol and Zcash, allowing for cross-chain interactions. It also includes integration with Secret Network for enhanced privacy features.

## Features

- NEAR to Zcash interoperability
- NEAR AI agent integration
- Secret Network TEE (Trusted Execution Environment) support
- Static file serving for wallet selector libraries

## Setup

### Prerequisites

- Node.js 14+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/Lowo88/zecret-banker.git
cd zecret-banker
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Running the Application

Start the development server:

```bash
npm start
```

The application will be available at:
- Main interface: http://localhost:3000
- NEAR-Zcash bridge: http://localhost:3000/zcash-bridge.html
- Secret Network interface: http://localhost:3000/secret-network.html

## Project Structure

- `/contracts`: Smart contracts for the bridge functionality
- `/public`: Web interface files
- `/scripts`: Utility scripts for testing
- `/src`: Core application code
  - `/ai`: NEAR AI integration utilities
  - `/blockchain`: Blockchain interaction utilities
  - `/services`: Service implementations for Zcash, Secret Network, etc.

## License

MIT 