# Pi Network Tokenization System

This frontend now includes a complete tokenization system that integrates all 6 steps from the TypeScript tokenization process, making it user-configurable instead of relying on static config.json files.

## 🚀 Features

### Complete Tokenization Workflow
- **6-Step Process**: All tokenization steps integrated into a single workflow
- **User-Configurable**: No more dependency on config.json - users provide all parameters
- **Real-time Execution**: Execute steps individually or all at once
- **Error Handling**: Comprehensive error handling and user feedback

### API Routes
All 6 tokenization steps are now available as API endpoints:

1. **Change Trust** (`/api/tokenization/change-trust`)
   - Sets up trust line for distributor
   - Requires: network config, asset code, distributor secret, trust limit

2. **Create Asset** (`/api/tokenization/create-asset`)
   - Issues tokens from issuer to distributor
   - Requires: network config, asset code, issuer/distributor secrets, initial amount

3. **Lock Issuing Account** (`/api/tokenization/lock-issuing-account`)
   - Secures the issuing account
   - Requires: network config, issuer secret, lock settings

4. **Token Distribution** (`/api/tokenization/token-distribution`)
   - Creates sell offers for tokens
   - Requires: network config, asset code, issuer public key, distributor secret, sell amount/price

5. **Purchase Token** (`/api/tokenization/purchase-token`)
   - Buys tokens from distributor
   - Requires: network config, asset code, issuer public key, buyer secret, trust limit, purchase amount/price

6. **Check Balances** (`/api/tokenization/check-balances`)
   - Verifies final account balances
   - Requires: network config, account information

## 🎯 Usage

### Complete Tokenization Workflow
1. Navigate to `/tokenization` page
2. Configure all parameters in the left panel:
   - Network settings (server URL, passphrase)
   - Asset configuration (token code)
   - Account secrets (issuer, distributor, buyer)
   - Trading parameters (trust limits, amounts, prices)
   - Issuance settings (initial amount)
3. Execute steps individually or run the complete workflow
4. Monitor progress and results in real-time

### Individual Pages
- **Create Token** (`/create`): Simplified asset creation
- **Trade** (`/trade`): Buy/sell tokens
- **Balances** (`/balances`): Check account balances

## 🔧 Configuration

### Network Settings
```typescript
{
  serverUrl: "https://api.testnet.minepi.com",
  networkPassphrase: "Pi Testnet"
}
```

### Account Configuration
Each account requires:
- `name`: Human-readable name
- `publicKey`: Stellar public key
- `secret`: Stellar secret key

### Trading Parameters
- `distributorTrustLimit`: Maximum tokens distributor can hold
- `buyerTrustLimit`: Maximum tokens buyer can hold
- `sellAmount`: Amount of tokens to sell
- `sellPrice`: Price per token for selling
- `purchaseAmount`: Amount of tokens to buy
- `purchasePrice`: Price per token for buying

## 🛡️ Security Features

### Lock Settings
Configure issuing account security:
- `masterWeight`: Master key weight (0 = disabled)
- `lowThreshold`: Low threshold for operations
- `medThreshold`: Medium threshold for operations
- `highThreshold`: High threshold for operations

## 📁 File Structure

```
frontend/src/
├── app/
│   ├── api/tokenization/
│   │   ├── change-trust/route.ts
│   │   ├── create-asset/route.ts
│   │   ├── lock-issuing-account/route.ts
│   │   ├── token-distribution/route.ts
│   │   ├── purchase-token/route.ts
│   │   └── check-balances/route.ts
│   ├── tokenization/page.tsx
│   ├── create/page.tsx (updated)
│   ├── trade/page.tsx (updated)
│   └── balances/page.tsx (updated)
├── types/
│   └── tokenization.ts
└── components/ui/
    ├── label.tsx
    └── textarea.tsx
```

## 🔄 Migration from TypeScript Files

The system replaces the static TypeScript files with dynamic API routes:

| Original File | New API Route | Description |
|---------------|---------------|-------------|
| `1_changeTrust.ts` | `/api/tokenization/change-trust` | Change trust operation |
| `2_createAsset.ts` | `/api/tokenization/create-asset` | Asset creation |
| `3_lockIssuingAccount.ts` | `/api/tokenization/lock-issuing-account` | Account locking |
| `4_tokenDistribution.ts` | `/api/tokenization/token-distribution` | Token distribution |
| `5_purchaseToken.ts` | `/api/tokenization/purchase-token` | Token purchase |
| `balances.ts` | `/api/tokenization/check-balances` | Balance checking |

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   cd frontend
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Navigate to `/tokenization` to start the complete workflow

## 🔍 Testing

The system includes comprehensive error handling and validation:
- Input validation for all required fields
- Network error handling
- Transaction result verification
- User-friendly error messages

## 📝 Notes

- All API routes use the Stellar SDK for Pi Network compatibility
- Network configuration defaults to Pi Testnet
- Secret keys are handled securely (not stored)
- All operations are executed in real-time against the Pi Network
- The system maintains the same functionality as the original TypeScript files but with a user-friendly interface
