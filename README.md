# NEAR AI Bridge Agent (Alpha)

This project implements an AI agent that bridges NEAR blockchain functionality with AI capabilities. It's currently in alpha stage.

## Features

- AI-powered query processing using NEAR AI APIs
- NEAR blockchain transaction execution
- Data analysis using AI capabilities
- Web interface for agent interaction

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A NEAR testnet account
- NEAR AI API authentication

### Installation

1. Clone this repository
```bash
git clone <repository-url>
cd near-ai-bridge
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables by copying the example file and filling in your details
```bash
cp .env.example .env
# Edit .env with your NEAR account details and other configurations
```

4. Start the application
```bash
npm start
```

The agent will be running at http://localhost:3000

## Using NEAR AI API Integration

This agent can operate in two modes:
1. **Simulation Mode** - Default mode that simulates AI responses
2. **NEAR AI API Mode** - Uses the actual NEAR AI APIs for more accurate responses

### Authentication for NEAR AI API

NEAR AI API uses a special authentication method based on NEAR blockchain accounts. There are two ways to authenticate:

#### Option 1: Using NEAR Account Credentials

1. Set up a NEAR account if you don't have one already
2. Update your `.env` file with your NEAR account details:
```
NEAR_ACCOUNT_ID=your-account.testnet
NEAR_PRIVATE_KEY=ed25519:your-private-key
USE_ACTUAL_API=true
```

The agent will automatically generate the proper auth token when started.

#### Option 2: Using a Pre-generated Auth Token

If you already have a NEAR AI auth token:

1. Update your `.env` file with the token:
```
USE_ACTUAL_API=true
NEAR_AI_AUTH_TOKEN=your-pre-generated-auth-token
```

### Getting a NEAR AI Auth Token

You can obtain a NEAR AI auth token in several ways:

1. **From the NEAR AI Web Interface**: If you're logged into [app.near.ai](https://app.near.ai), you can extract the token from the `auth` cookie
2. **Using the NEAR Wallet**: Sign a message using your NEAR wallet following the format described in the [NEAR AI API documentation](https://docs.near.ai/api/guide/)
3. **Programmatically**: Use the `near-ai` CLI tool to generate a token

## API Endpoints

### Basic Status
```
GET /api/status
```
Returns basic status information about the agent

### Detailed Status
```
GET /api/status/detailed
```
Returns detailed status about the agent, including AI and blockchain connection information

### Agent Capabilities
```
GET /agent/capabilities
```
Returns a list of available capabilities

### Execute Action
```
POST /agent/action
```

Request body:
```json
{
  "action": "query|transact|analyze|status",
  "params": {
    // Parameters specific to the action
  }
}
```

Example query action:
```json
{
  "action": "query",
  "params": {
    "prompt": "What is the current price of NEAR?"
  }
}
```

## Development Roadmap

- [x] Basic agent structure
- [x] NEAR blockchain integration
- [x] Integration with NEAR AI APIs
- [x] NEAR AI Authentication
- [ ] Enhanced AI capabilities
- [x] Web interface for agent interaction
- [ ] More advanced blockchain operations

## Reference Documentation

For more information about the NEAR AI API, refer to the official documentation:
- [NEAR AI API Guide](https://docs.near.ai/api/guide/)
- [NEAR AI API Reference](https://api.near.ai/redoc)

## Contributing

This project is in alpha stage and contributions are welcome! Please feel free to submit a PR.

## License

ISC 