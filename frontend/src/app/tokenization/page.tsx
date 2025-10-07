"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { TokenizationConfig, TokenizationStep } from "@/types/tokenization";
import { ThemeToggle } from "@/components/theme-toggle";
import StellarSdk from '@stellar/stellar-sdk';

export default function TokenizationWorkflow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // Constants - not user configurable
  const SERVER_URL = "https://api.testnet.minepi.com";
  const NETWORK_PASSPHRASE = "Pi Testnet";

  const [config, setConfig] = useState<TokenizationConfig>({
    network: {
      serverUrl: SERVER_URL,
      networkPassphrase: NETWORK_PASSPHRASE
    },
    asset: {
      code: ""
    },
    accounts: {
      issuer: { name: "Issuer", publicKey: "", secret: "" },
      distributor: { name: "Distributor", publicKey: "", secret: "" },
      buyer: { name: "Buyer", publicKey: "", secret: "" }
    },
    issuance: {
      initialAmount: ""
    },
    trading: {
      distributorTrustLimit: "",
      buyerTrustLimit: "",
      sellAmount: "",
      sellPrice: "",
      purchaseAmount: "",
      purchasePrice: ""
    },
    security: {
      lockSettings: {
        masterWeight: 0,
        lowThreshold: 0,
        medThreshold: 0,
        highThreshold: 0
      }
    },
    transactions: {
      timeout: 30
    }
  });

  const [steps, setSteps] = useState<TokenizationStep[]>([
    { id: "change-trust", name: "Change Trust", description: "Set up trust line for distributor", completed: false },
    { id: "create-asset", name: "Create Asset", description: "Issue tokens from issuer to distributor", completed: false },
    { id: "lock-issuing-account", name: "Lock Issuing Account", description: "Secure the issuing account", completed: false },
    { id: "token-distribution", name: "Token Distribution", description: "Create sell offers for tokens", completed: false },
    { id: "purchase-token", name: "Purchase Token", description: "Buy tokens from distributor", completed: false },
    { id: "check-balances", name: "Check Balances", description: "Verify final account balances", completed: false }
  ]);

  const [results, setResults] = useState<Record<string, unknown>>({});

  const updateConfig = (section: keyof TokenizationConfig, field: string, value: unknown) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateAccount = (accountType: 'issuer' | 'distributor' | 'buyer', field: 'publicKey' | 'secret', value: string) => {
    setConfig(prev => ({
      ...prev,
      accounts: {
        ...prev.accounts,
        [accountType]: {
          ...prev.accounts[accountType],
          [field]: value
        }
      }
    }));
  };

  const updateSecuritySetting = (field: 'masterWeight' | 'lowThreshold' | 'medThreshold' | 'highThreshold', value: number) => {
    setConfig(prev => ({
      ...prev,
      security: {
        ...prev.security,
        lockSettings: {
          ...prev.security.lockSettings,
          [field]: value
        }
      }
    }));
  };


  const validateConfig = () => {
    const required = [
      config.asset.code,
      config.accounts.issuer.publicKey,
      config.accounts.issuer.secret,
      config.accounts.distributor.publicKey,
      config.accounts.distributor.secret,
      config.accounts.buyer.publicKey,
      config.accounts.buyer.secret,
      config.issuance.initialAmount,
      config.trading.distributorTrustLimit,
      config.trading.buyerTrustLimit,
      config.trading.sellAmount,
      config.trading.sellPrice,
      config.trading.purchaseAmount,
      config.trading.purchasePrice
    ];
    
    return required.every(field => field && field.toString().trim() !== '');
  };

  // Create keypairs once and reuse them
  const getKeypairs = () => ({
    issuer: StellarSdk.Keypair.fromSecret(config.accounts.issuer.secret),
    distributor: StellarSdk.Keypair.fromSecret(config.accounts.distributor.secret),
    buyer: StellarSdk.Keypair.fromSecret(config.accounts.buyer.secret)
  });

  // Create asset once and reuse it
  const getAsset = () => new StellarSdk.Asset(config.asset.code, config.accounts.issuer.publicKey);

  const validateConfigExtended = () => {
    const basicValidation = validateConfig();
    if (!basicValidation) return false;

    // Validate security lock settings
    const { masterWeight, lowThreshold, medThreshold, highThreshold } = config.security.lockSettings;
    if (typeof masterWeight !== 'number' || typeof lowThreshold !== 'number' || 
        typeof medThreshold !== 'number' || typeof highThreshold !== 'number') {
      return false;
    }

    return true;
  };

  const executeStep = async (stepIndex: number) => {
    if (!validateConfigExtended()) {
      alert('Please fill in all required fields before executing steps, including security settings.');
      return;
    }
    
    setIsLoading(true);
    const step = steps[stepIndex];
    
    try {
      // Initialize Stellar server connection
      const server = new StellarSdk.Horizon.Server(SERVER_URL);
      
      // Get keypairs and asset once
      const keypairs = getKeypairs();
      const asset = getAsset();
      
      let result: any = null;

      switch (step.id) {
        case 'change-trust':
          try {
            // Load distributor account
            const distributorAccount = await server.loadAccount(config.accounts.distributor.publicKey);
            
            const txOptions = {
              fee: await server.fetchBaseFee(), // Fixed: removed .toString()
              networkPassphrase: NETWORK_PASSPHRASE,
            };

            const changeTrustOpts = {
              asset: asset,
              limit: config.trading.distributorTrustLimit
            };

            const transaction = new StellarSdk.TransactionBuilder(distributorAccount, txOptions)
              .addOperation(StellarSdk.Operation.changeTrust(changeTrustOpts))
              .setTimeout(0)
              .build();

            transaction.sign(keypairs.distributor);
            result = await server.submitTransaction(transaction);
            
            if (!result || !result.hash) {
              throw new Error('Transaction submitted but no hash returned');
            }
          } catch (error: any) {
            throw new Error(`ChangeTrust failed: ${error.response?.data || error.message}`);
          }
          break;

        case 'create-asset':
          try {
            // Load issuer account
            const issuerAccount = await server.loadAccount(config.accounts.issuer.publicKey);
            
            const tx = new StellarSdk.TransactionBuilder(issuerAccount, {
              fee: await server.fetchBaseFee(), // Fixed: removed .toString()
              networkPassphrase: NETWORK_PASSPHRASE 
            })
              .addOperation(
                StellarSdk.Operation.payment({
                  destination: config.accounts.distributor.publicKey,
                  asset: asset,
                  amount: config.issuance.initialAmount
                })
              )
              .setTimeout(0) // Fixed: consistent timeout
              .build();

            tx.sign(keypairs.issuer);
            result = await server.submitTransaction(tx);
            
            if (!result || !result.hash) {
              throw new Error('Transaction submitted but no hash returned');
            }
          } catch (error: any) {
            throw new Error(`CreateAsset failed: ${error.response?.data || error.message}`);
          }
          break;

        case 'lock-issuing-account':
          try {
            const issuingAccount = await server.loadAccount(config.accounts.issuer.publicKey);
            
            const lockTx = new StellarSdk.TransactionBuilder(issuingAccount, {
              fee: await server.fetchBaseFee(), // Fixed: removed .toString()
              networkPassphrase: NETWORK_PASSPHRASE,
            })
              .addOperation(
                StellarSdk.Operation.setOptions(config.security.lockSettings)
              )
              .setTimeout(0)
              .build();

            lockTx.sign(keypairs.issuer);
            result = await server.submitTransaction(lockTx);
            
            if (!result || !result.hash) {
              throw new Error('Transaction submitted but no hash returned');
            }
          } catch (error: any) {
            throw new Error(`LockIssuingAccount failed: ${error.response?.data || error.message}`);
          }
          break;

        case 'token-distribution':
          try {
            const distributorAcc = await server.loadAccount(config.accounts.distributor.publicKey);

            const distTxOptions = {
              fee: await server.fetchBaseFee(), // Fixed: removed .toString()
              networkPassphrase: NETWORK_PASSPHRASE,
            };

            const manageSellOfferOpts = {
              selling: asset,
              buying: StellarSdk.Asset.native(),
              amount: config.trading.sellAmount,
              price: config.trading.sellPrice,
            };

            const distTransaction = new StellarSdk.TransactionBuilder(distributorAcc, distTxOptions)
              .addOperation(StellarSdk.Operation.manageSellOffer(manageSellOfferOpts))
              .setTimeout(0)
              .build();

            distTransaction.sign(keypairs.distributor);
            result = await server.submitTransaction(distTransaction);
            
            if (!result || !result.hash) {
              throw new Error('Transaction submitted but no hash returned');
            }
          } catch (error: any) {
            throw new Error(`TokenDistribution failed: ${error.response?.data || error.message}`);
          }
          break;

        case 'purchase-token':
          try {
            const buyerAccount = await server.loadAccount(config.accounts.buyer.publicKey);

            const buyTxOptions = {
              fee: await server.fetchBaseFee(), // Fixed: removed .toString()
              networkPassphrase: NETWORK_PASSPHRASE
            };

            const changeTrustOpts2 = {
              asset: asset,
              limit: config.trading.buyerTrustLimit
            };

            const manageSellOfferOpts2 = {
              selling: StellarSdk.Asset.native(),
              buying: asset,
              amount: config.trading.purchaseAmount,
              price: config.trading.purchasePrice
            };

            const buyTransaction = new StellarSdk.TransactionBuilder(buyerAccount, buyTxOptions)
              .addOperation(StellarSdk.Operation.changeTrust(changeTrustOpts2))
              .addOperation(StellarSdk.Operation.manageSellOffer(manageSellOfferOpts2))
              .setTimeout(0)
              .build();

            buyTransaction.sign(keypairs.buyer);
            result = await server.submitTransaction(buyTransaction);
            
            if (!result || !result.hash) {
              throw new Error('Transaction submitted but no hash returned');
            }
          } catch (error: any) {
            throw new Error(`PurchaseToken failed: ${error.response?.data || error.message}`);
          }
          break;

        case 'check-balances':
          try {
            // Enhanced balance checking similar to balances.js
            const balanceResults: any = {};
            
            for (const [accountType, account] of Object.entries(config.accounts)) {
              try {
                const accountData = await server.loadAccount(account.publicKey);
                balanceResults[accountType] = {
                  name: account.name,
                  publicKey: account.publicKey,
                  balances: accountData.balances.map((balance: any) => ({
                    asset_type: balance.asset_type,
                    asset_code: balance.asset_code,
                    balance: balance.balance,
                    formatted: `${balance.balance} ${balance.asset_type === "native" ? "Test-π" : balance.asset_code}`
                  }))
                };
              } catch (error) {
                balanceResults[accountType] = {
                  name: account.name,
                  publicKey: account.publicKey,
                  error: (error as Error).message
                };
              }
            }
            
            result = { balances: balanceResults };
          } catch (error: any) {
            throw new Error(`CheckBalances failed: ${error.message}`);
          }
          break;
      }

      // Mark step as completed with proper result validation
      const stepResult = result && result.hash ? result : { success: true, data: result };
      setSteps(prev => prev.map((s, i) => 
        i === stepIndex ? { ...s, completed: true, result: stepResult } : s
      ));
      setResults(prev => ({ ...prev, [step.id]: stepResult }));
        
      if (stepIndex < steps.length - 1) {
        setCurrentStep(stepIndex + 1);
      }
      
    } catch (error: any) {
      console.error(`${step.name} error:`, error);
      const errorMessage = error.message || error.response?.data || 'Unknown error occurred';
      setSteps(prev => prev.map((s, i) => 
        i === stepIndex ? { ...s, error: errorMessage } : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const executeAllSteps = async () => {
    if (!validateConfigExtended()) {
      alert('Please fill in all required fields before executing steps, including security settings.');
      return;
    }
    
    for (let i = 0; i < steps.length; i++) {
      await executeStep(i);
      // Add a small delay between steps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <ThemeToggle />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">
              🚀 Complete Tokenization Workflow
            </h1>
            <p className="text-secondary text-lg">
              Execute all 6 steps of the Pi Network tokenization process
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <Card className="card-primary">
              <CardHeader className="card-header-primary">
                <CardTitle className="text-xl">⚙️ Configuration</CardTitle>
                <CardDescription className="text-primary-100">
                  Configure your tokenization parameters. All fields are required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Network Configuration */}
                <div className="section-network">
                  <h3 className="text-lg font-semibold text-info flex items-center gap-2">
                    🌐 Network Settings
                  </h3>
                  <div className="p-4 bg-info-50 rounded-lg border border-info-200">
                    <p className="text-sm text-info-700">
                      <strong>Server:</strong> {SERVER_URL}
                    </p>
                    <p className="text-sm text-info-700">
                      <strong>Network:</strong> {NETWORK_PASSPHRASE}
                    </p>
                    <p className="text-xs text-info-600 mt-2">
                      These settings are fixed for Pi Network testnet
                    </p>
                  </div>
                </div>

                {/* Asset Configuration */}
                <div className="section-asset">
                  <h3 className="text-lg font-semibold text-success flex items-center gap-2">
                    🪙 Asset Settings
                  </h3>
                  <div>
                    <Label htmlFor="assetCode">Asset Code</Label>
                    <Input
                      id="assetCode"
                      value={config.asset.code}
                      onChange={(e) => updateConfig('asset', 'code', e.target.value)}
                      placeholder="e.g., MYTOKEN, BBC, USDC"
                      required
                    />
                  </div>
                </div>

                {/* Account Configuration */}
                <div className="section-accounts">
                  <h3 className="text-lg font-semibold text-warning flex items-center gap-2">
                    🔐 Account Information
                  </h3>
                  <p className="text-sm text-warning-700 mb-4">
                    You need three Stellar accounts: <strong>Issuer</strong> (creates the token), <strong>Distributor</strong> (sells the token), and <strong>Buyer</strong> (purchases the token).
                    <br />
                    <span className="text-xs text-warning-600">
                      Public keys start with 'G', Secret keys start with 'S'
                    </span>
                  </p>
                  {(['issuer', 'distributor', 'buyer'] as const).map(accountType => {
                    const descriptions = {
                      issuer: "Creates and issues the token",
                      distributor: "Distributes and sells the token",
                      buyer: "Purchases tokens from the distributor"
                    };
                    return (
                    <div key={accountType} className="space-y-3 p-4 bg-white/50 rounded-lg border border-warning-200">
                      <div>
                        <h4 className="font-medium text-warning-800">
                          {accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account
                        </h4>
                        <p className="text-xs text-warning-600">{descriptions[accountType]}</p>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor={`${accountType}PublicKey`}>
                            Public Key
                          </Label>
                          <Input
                            id={`${accountType}PublicKey`}
                            value={config.accounts[accountType].publicKey}
                            onChange={(e) => updateAccount(accountType, 'publicKey', e.target.value)}
                            placeholder={`Enter ${accountType} public key (starts with G)`}
                          />
                        </div>
                        <div>
                      <Label htmlFor={`${accountType}Secret`}>
                            Secret Key
                      </Label>
                      <Input
                        id={`${accountType}Secret`}
                        type="password"
                        value={config.accounts[accountType].secret}
                        onChange={(e) => updateAccount(accountType, 'secret', e.target.value)}
                            placeholder={`Enter ${accountType} secret key (starts with S)`}
                      />
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* Trading Configuration */}
                <div className="section-trading">
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    📈 Trading Settings
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="distributorTrustLimit">Distributor Trust Limit</Label>
                      <Input
                        id="distributorTrustLimit"
                        type="number"
                        value={config.trading.distributorTrustLimit}
                        onChange={(e) => updateConfig('trading', 'distributorTrustLimit', e.target.value)}
                        placeholder="e.g., 10000000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="buyerTrustLimit">Buyer Trust Limit</Label>
                      <Input
                        id="buyerTrustLimit"
                        type="number"
                        value={config.trading.buyerTrustLimit}
                        onChange={(e) => updateConfig('trading', 'buyerTrustLimit', e.target.value)}
                        placeholder="e.g., 500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sellAmount">Sell Amount</Label>
                      <Input
                        id="sellAmount"
                        type="number"
                        value={config.trading.sellAmount}
                        onChange={(e) => updateConfig('trading', 'sellAmount', e.target.value)}
                        placeholder="e.g., 1000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sellPrice">Sell Price</Label>
                      <Input
                        id="sellPrice"
                        type="number"
                        step="0.00000001"
                        value={config.trading.sellPrice}
                        onChange={(e) => updateConfig('trading', 'sellPrice', e.target.value)}
                        placeholder="e.g., 1.00000000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchaseAmount">Purchase Amount</Label>
                      <Input
                        id="purchaseAmount"
                        type="number"
                        value={config.trading.purchaseAmount}
                        onChange={(e) => updateConfig('trading', 'purchaseAmount', e.target.value)}
                        placeholder="e.g., 1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchasePrice">Purchase Price</Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        step="0.00000001"
                        value={config.trading.purchasePrice}
                        onChange={(e) => updateConfig('trading', 'purchasePrice', e.target.value)}
                        placeholder="e.g., 1"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Issuance Configuration */}
                <div className="section-issuance">
                  <h3 className="text-lg font-semibold text-accent flex items-center gap-2">
                    🏦 Issuance Settings
                  </h3>
                  <div>
                    <Label htmlFor="initialAmount">Initial Amount</Label>
                    <Input
                      id="initialAmount"
                      type="number"
                      value={config.issuance.initialAmount}
                      onChange={(e) => updateConfig('issuance', 'initialAmount', e.target.value)}
                      placeholder="e.g., 100000"
                      required
                    />
                  </div>
                </div>

                {/* Security Configuration */}
                <div className="section-security">
                  <h3 className="text-lg font-semibold text-danger flex items-center gap-2">
                    🔒 Security Settings
                  </h3>
                  <p className="text-sm text-danger-700 mb-4">
                    Lock settings for the issuing account. Setting all weights to 0 will lock the account permanently.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="masterWeight">Master Weight</Label>
                      <Input
                        id="masterWeight"
                        type="number"
                        min="0"
                        max="255"
                        value={config.security.lockSettings.masterWeight}
                        onChange={(e) => updateSecuritySetting('masterWeight', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lowThreshold">Low Threshold</Label>
                      <Input
                        id="lowThreshold"
                        type="number"
                        min="0"
                        max="255"
                        value={config.security.lockSettings.lowThreshold}
                        onChange={(e) => updateSecuritySetting('lowThreshold', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="medThreshold">Medium Threshold</Label>
                      <Input
                        id="medThreshold"
                        type="number"
                        min="0"
                        max="255"
                        value={config.security.lockSettings.medThreshold}
                        onChange={(e) => updateSecuritySetting('medThreshold', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="highThreshold">High Threshold</Label>
                      <Input
                        id="highThreshold"
                        type="number"
                        min="0"
                        max="255"
                        value={config.security.lockSettings.highThreshold}
                        onChange={(e) => updateSecuritySetting('highThreshold', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Steps */}
            <Card className="card-primary">
              <CardHeader className="card-header-primary">
                <CardTitle className="text-xl">🔄 Tokenization Steps</CardTitle>
                <CardDescription className="text-primary-100">
                  Execute each step of the tokenization process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 border rounded-lg ${
                      step.completed ? 'step-completed' :
                      step.error ? 'step-error' :
                      index === currentStep ? 'step-current' :
                      'step-pending'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{step.name}</h4>
                        <p className="text-sm text-secondary">{step.description}</p>
                        {step.error && (
                          <p className="text-sm text-error mt-1">Error: {step.error}</p>
                        )}
                        {step.result && (
                          <div className="text-sm text-success mt-1">
                            <p>
                              Success: {step.result.hash ? `Hash: ${step.result.hash.substring(0, 8)}...` : 'Completed'}
                            </p>
                            {step.id === 'check-balances' && step.result.balances && (
                              <div className="mt-2 text-xs">
                                <details className="cursor-pointer">
                                  <summary className="font-medium">View Balances</summary>
                                  <div className="mt-1 ml-2 space-y-1">
                                    {Object.entries(step.result.balances).map(([accountType, accountData]: [string, any]) => (
                                      <div key={accountType} className="border-l-2 border-success pl-2">
                                        <div className="font-medium text-success-700">{accountData.name}</div>
                                        <div className="text-success-600 text-xs">{accountData.publicKey.substring(0, 8)}...</div>
                                        {accountData.balances ? (
                                          <div className="text-success-600">
                                            {accountData.balances.map((balance: any, idx: number) => (
                                              <div key={idx}>{balance.formatted}</div>
                                            ))}
                                          </div>
                                        ) : accountData.error && (
                                          <div className="text-error text-xs">Error: {accountData.error}</div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {step.completed && <span className="text-success">✅</span>}
                        {step.error && <span className="text-error">❌</span>}
                        <Button
                          size="sm"
                          onClick={() => executeStep(index)}
                          disabled={isLoading || step.completed}
                        >
                          {isLoading && index === currentStep ? 'Executing...' : 'Execute'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-secondary">
                  <Button
                    onClick={executeAllSteps}
                    disabled={isLoading}
                    className="w-full btn-primary"
                  >
                    {isLoading ? 'Executing All Steps...' : 'Execute All Steps'}
                  </Button>
                </div>

                <div className="text-center">
                  <Link href="/">
                    <Button className="btn-outline">← Back to Home</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
