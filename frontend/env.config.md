# Environment Configuration

Create a `.env.local` file in the frontend directory with the following configuration:

```bash
# Network Configuration (from config.json)
NEXT_PUBLIC_STELLAR_SERVER_URL=https://api.testnet.minepi.com
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Pi Testnet

# Security Settings (from config.json)
NEXT_PUBLIC_MASTER_WEIGHT=0
NEXT_PUBLIC_LOW_THRESHOLD=0
NEXT_PUBLIC_MED_THRESHOLD=0
NEXT_PUBLIC_HIGH_THRESHOLD=0

# Transaction Settings (from config.json)
NEXT_PUBLIC_TRANSACTION_TIMEOUT=30
```

## Usage

1. Copy the above configuration to `frontend/.env.local`
2. The change-trust page will automatically use these environment variables
3. For now, the configuration is hardcoded in the page for testing purposes

## Current Implementation

The change-trust page currently has the configuration hardcoded as `STELLAR_CONFIG` object. To use environment variables instead, replace the hardcoded object with:

```typescript
const STELLAR_CONFIG = {
  serverUrl: process.env.NEXT_PUBLIC_STELLAR_SERVER_URL || "https://api.testnet.minepi.com",
  networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || "Pi Testnet",
  security: {
    masterWeight: parseInt(process.env.NEXT_PUBLIC_MASTER_WEIGHT || "0"),
    lowThreshold: parseInt(process.env.NEXT_PUBLIC_LOW_THRESHOLD || "0"),
    medThreshold: parseInt(process.env.NEXT_PUBLIC_MED_THRESHOLD || "0"),
    highThreshold: parseInt(process.env.NEXT_PUBLIC_HIGH_THRESHOLD || "0")
  },
  transactions: {
    timeout: parseInt(process.env.NEXT_PUBLIC_TRANSACTION_TIMEOUT || "30")
  }
};
```
