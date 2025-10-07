# 🚀 Pi Token Launchpad

A comprehensive token launchpad platform for the Pi Network, built with Next.js, TypeScript, and Stellar SDK. This project provides both backend scripts and a modern web interface for creating, managing, and trading tokens on the Pi Network.

## 📁 Project Structure

```
stellar-token-issuance-master/
├── 📁 frontend/                 # Next.js web application
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── page.tsx        # Home page
│   │   │   ├── create/         # Token creation
│   │   │   ├── balances/       # View balances
│   │   │   ├── trade/          # Trading interface
│   │   │   ├── lock/           # Account locking
│   │   │   ├── trust/          # Trust line management
│   │   │   └── distribute/     # Token distribution
│   │   ├── components/ui/      # shadcn/ui components
│   │   └── lib/               # Utility functions
│   └── package.json
├── 📁 typescript/              # TypeScript backend scripts
│   ├── src/
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── 1_changeTrust.ts   # Trust line operations
│   │   ├── 2_createAsset.ts   # Token creation
│   │   ├── 3_lockIssuingAccount.ts # Account locking
│   │   ├── 4_tokenDistribution.ts  # Token distribution
│   │   ├── 5_purchaseToken.ts # Token purchasing
│   │   └── balances.ts        # Balance checking
│   ├── config.json            # Configuration file
│   └── package.json
├── 📄 config.json             # Main configuration
├── 📄 1_changeTrust.js        # JavaScript versions
├── 📄 2_createAsset.js
├── 📄 3_lockIssuingAccount.js
├── 📄 4_tokenDistribution.js
├── 📄 5_purchaseToken.js
├── 📄 balances.js
└── 📄 README.md
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Stellar SDK** - Blockchain interactions
- **pnpm** - Package manager

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm package manager
- Pi Network testnet account

### 1. Clone and Setup

```bash
git clone <repository-url>
cd stellar-token-issuance-master
```

### 2. Configure Your Settings

Edit `config.json` with your account details:

```json
{
  "network": {
    "serverUrl": "https://api.testnet.minepi.com",
    "networkPassphrase": "Pi Testnet"
  },
  "asset": {
    "code": "YOUR_TOKEN_CODE"
  },
  "accounts": {
    "issuer": {
      "name": "Issuer",
      "publicKey": "YOUR_ISSUER_PUBLIC_KEY",
      "secret": "YOUR_ISSUER_SECRET_KEY"
    },
    "distributor": {
      "name": "Distributor", 
      "publicKey": "YOUR_DISTRIBUTOR_PUBLIC_KEY",
      "secret": "YOUR_DISTRIBUTOR_SECRET_KEY"
    },
    "buyer": {
      "name": "Buyer",
      "publicKey": "YOUR_BUYER_PUBLIC_KEY", 
      "secret": "YOUR_BUYER_SECRET_KEY"
    }
  },
  "issuance": {
    "initialAmount": "100000"
  },
  "trading": {
    "distributorTrustLimit": "10000000",
    "buyerTrustLimit": "500",
    "sellAmount": "1000",
    "sellPrice": "1.00000000",
    "purchaseAmount": "1",
    "purchasePrice": "1"
  },
  "security": {
    "lockSettings": {
      "masterWeight": 0,
      "lowThreshold": 0,
      "medThreshold": 0,
      "highThreshold": 0
    }
  },
  "transactions": {
    "timeout": 30
  }
}
```

### 3. Backend Setup (TypeScript)

```bash
cd typescript
pnpm install
```

Run individual scripts:
```bash
# Create and issue tokens
pnpm createAsset

# Set trust lines
pnpm changeTrust

# Distribute tokens
pnpm tokenDistribution

# Purchase tokens
pnpm purchaseToken

# Lock issuing account
pnpm lockIssuingAccount

# Check balances
pnpm balances
```

### 4. Frontend Setup

```bash
cd frontend
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to access the web interface.

## 📋 Token Launch Process

### Step 1: Create Token
- Configure asset code and initial amount
- Provide issuer and distributor secret keys
- Execute token creation and initial distribution

### Step 2: Set Trust Lines
- Configure trust limits for distributor account
- Enable token holding and trading capabilities

### Step 3: Distribute Tokens
- Create sell offers on the market
- Set distribution amounts and prices
- Make tokens available for trading

### Step 4: Enable Trading
- Users can purchase tokens through the interface
- Automatic trust line creation for buyers
- Real-time balance updates

### Step 5: Lock Account (Optional)
- Permanently lock the issuing account
- Prevent further token creation
- **⚠️ This action is irreversible**

## 🎯 Frontend Features

### 🏠 Home Page
- Overview of all available operations
- Quick access to all features
- Modern, responsive design

### 🪙 Create Token
- Interactive token creation form
- Real-time validation
- Secure secret key handling

### 📊 View Balances
- Multi-account balance display
- Real-time balance updates
- Clean, organized presentation

### 🔄 Trade Tokens
- Buy/sell token interface
- Price and amount configuration
- Transaction status tracking

### 🔒 Lock Account
- Secure account locking
- Warning prompts for irreversible actions
- Confirmation workflows

### 🎯 Set Trust Lines
- Trust limit configuration
- Asset-specific trust management
- Easy-to-use interface

### 📈 Distribute Tokens
- Sell offer creation
- Market distribution tools
- Price and amount controls

## 🔧 Configuration Options

### Network Settings
- **serverUrl**: Pi Network Horizon server
- **networkPassphrase**: Network identifier

### Asset Configuration
- **code**: Your token's asset code (3-12 characters)

### Account Management
- **issuer**: Token creation account
- **distributor**: Token distribution account  
- **buyer**: Token purchasing account

### Trading Parameters
- **trustLimits**: Maximum token holdings
- **amounts**: Transaction amounts
- **prices**: Token prices in native currency

### Security Settings
- **lockSettings**: Account locking parameters
- **timeout**: Transaction timeout values

## 🛡️ Security Considerations

### Secret Key Management
- Never commit secret keys to version control
- Use environment variables in production
- Consider hardware wallet integration

### Account Locking
- Lock issuing accounts after token creation
- Prevents unauthorized token minting
- Irreversible security measure

### Trust Line Limits
- Set appropriate trust limits
- Monitor account balances
- Regular security audits

## 🚀 Deployment

### Backend Deployment
```bash
cd typescript
pnpm build
pnpm start
```

### Frontend Deployment
```bash
cd frontend
pnpm build
pnpm start
```

### Environment Variables
Set these in production:
```bash
ISSUING_SECRET=your_issuer_secret
DISTRIBUTOR_SECRET=your_distributor_secret
HORIZON_URL=https://api.testnet.minepi.com
NETWORK_PASSPHRASE=Pi Testnet
```

## 📚 API Endpoints

The frontend expects these API endpoints:

- `POST /api/create-asset` - Create new token
- `POST /api/change-trust` - Set trust lines
- `POST /api/distribute-token` - Distribute tokens
- `POST /api/purchase-token` - Purchase tokens
- `POST /api/lock-account` - Lock issuing account
- `GET /api/balances` - Get account balances

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the configuration examples
- Test on Pi Network testnet first
- Join the Pi Network community

## 🔄 Version History

- **v1.0.0** - Initial release with full token launchpad functionality
- Complete TypeScript backend
- Modern Next.js frontend
- Comprehensive configuration system
- Security features and account locking

---

**⚠️ Important**: Always test on the Pi Network testnet before using on mainnet. This software is provided as-is for educational and development purposes.