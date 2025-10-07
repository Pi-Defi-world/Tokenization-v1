# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 18+
- pnpm package manager

## Installation Steps

### 1. Install Dependencies

```bash
# Backend (TypeScript)
cd typescript
pnpm install

# Frontend (Next.js)
cd ../frontend
pnpm install
```

### 2. Configure Your Settings

Edit `config.json` in the root directory with your Pi Network account details.

### 3. Run the Application

```bash
# Start the frontend
cd frontend
pnpm dev

# In another terminal, run backend scripts
cd typescript
pnpm createAsset    # Create your token
pnpm changeTrust    # Set trust lines
pnpm balances       # Check balances
```

### 4. Access the Web Interface

Visit `http://localhost:3000` to use the token launchpad interface.

## Available Scripts

### Backend Scripts (TypeScript)
- `pnpm createAsset` - Create and issue tokens
- `pnpm changeTrust` - Set trust lines
- `pnpm tokenDistribution` - Distribute tokens
- `pnpm purchaseToken` - Purchase tokens
- `pnpm lockIssuingAccount` - Lock issuing account
- `pnpm balances` - Check account balances

### Frontend Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

## Next Steps

1. Configure your `config.json` with real account details
2. Test on Pi Network testnet first
3. Create your first token using the web interface
4. Set up trust lines for trading
5. Distribute tokens to the market

Happy token launching! 🚀
