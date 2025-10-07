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

export interface Config {
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
