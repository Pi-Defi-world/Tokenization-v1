export interface Account {
  name: string;
  publicKey: string;
  secret: string;
}

export interface Network {
  serverUrl: string;
  networkPassphrase: string;
}

export interface Asset {
  code: string;
}

export interface Issuance {
  initialAmount: string;
}

export interface Trading {
  distributorTrustLimit: string;
  buyerTrustLimit: string;
  sellAmount: string;
  sellPrice: string;
  purchaseAmount: string;
  purchasePrice: string;
}

export interface LockSettings {
  masterWeight: number;
  lowThreshold: number;
  medThreshold: number;
  highThreshold: number;
}

export interface Security {
  lockSettings: LockSettings;
}

export interface Transactions {
  timeout: number;
}

export interface TokenizationConfig {
  network: Network;
  asset: Asset;
  accounts: {
    issuer: Account;
    distributor: Account;
    buyer: Account;
  };
  issuance: Issuance;
  trading: Trading;
  security: Security;
  transactions: Transactions;
}

export interface TokenizationStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  error?: string;
  result?: any;
}

export interface TokenizationWorkflow {
  steps: TokenizationStep[];
  currentStep: number;
  isComplete: boolean;
}

// API Request/Response types
export interface ChangeTrustRequest {
  network: Network;
  asset: Asset;
  distributorSecret: string;
  distributorTrustLimit: string;
}

export interface CreateAssetRequest {
  network: Network;
  asset: Asset;
  issuerSecret: string;
  distributorSecret: string;
  initialAmount: string;
  timeout: number;
}

export interface LockIssuingAccountRequest {
  network: Network;
  issuerSecret: string;
  lockSettings: LockSettings;
}

export interface TokenDistributionRequest {
  network: Network;
  asset: Asset;
  issuerPublicKey: string;
  distributorSecret: string;
  sellAmount: string;
  sellPrice: string;
}

export interface PurchaseTokenRequest {
  network: Network;
  asset: Asset;
  issuerPublicKey: string;
  buyerSecret: string;
  buyerTrustLimit: string;
  purchaseAmount: string;
  purchasePrice: string;
}

export interface CheckBalancesRequest {
  network: Network;
  accounts: {
    issuer: Account;
    distributor: Account;
    buyer: Account;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
