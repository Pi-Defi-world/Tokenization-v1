"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import * as StellarSdk from "@stellar/stellar-sdk";

// Environment configuration (normally from .env.local)
const STELLAR_CONFIG = {
  serverUrl: "https://api.testnet.minepi.com",
  networkPassphrase: "Pi Testnet",
  security: {
    masterWeight: 0,
    lowThreshold: 0,
    medThreshold: 0,
    highThreshold: 0
  },
  transactions: {
    timeout: 30
  }
};

interface ChangeTrustForm {
  assetCode: string;
  issuerPublicKey: string;
  issuerSecret: string;
  distributorPublicKey: string;
  distributorSecret: string;
  distributorTrustLimit: string;
}

export default function ChangeTrustPage() {
  const [form, setForm] = useState<ChangeTrustForm>({
    assetCode: "",
    issuerPublicKey: "",
    issuerSecret: "",
    distributorPublicKey: "",
    distributorSecret: "",
    distributorTrustLimit: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const updateForm = (field: keyof ChangeTrustForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = [
      form.assetCode,
      form.issuerPublicKey,
      form.issuerSecret,
      form.distributorPublicKey,
      form.distributorSecret,
      form.distributorTrustLimit
    ];
    
    return required.every(field => field && field.trim() !== '');
  };

  const checkAccountExists = async (publicKey: string, server: any) => {
    try {
      const account = await server.loadAccount(publicKey);
      
      const nativeBalance = account.balances.find((balance: any) => balance.asset_type === 'native');
      return {
        exists: true,
        balance: nativeBalance ? parseFloat(nativeBalance.balance) : 0,
        assetName: 'Test-π'
      };
    } catch (error: any) {
      return {
        exists: false,
        balance: 0,
        assetName: 'Test-π',
        error: error.message
      };
    }
  };

  const executeChangeTrust = async () => {
    if (!validateForm()) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Destructure Stellar SDK components (matching TypeScript version)
      const { Horizon, Networks, Asset, TransactionBuilder, Operation, Keypair } = StellarSdk;
      
      // Initialize Stellar server connection
      const server = new Horizon.Server(STELLAR_CONFIG.serverUrl);
      
      // Check if accounts exist and are funded
      const issuerCheck = await checkAccountExists(form.issuerPublicKey, server);
      const distributorCheck = await checkAccountExists(form.distributorPublicKey, server);
      
      if (!issuerCheck.exists) {
        throw new Error(`Issuer account ${form.issuerPublicKey.substring(0, 8)}... does not exist or is not funded`);
      }
      
      if (!distributorCheck.exists) {
        throw new Error(`Distributor account ${form.distributorPublicKey.substring(0, 8)}... does not exist or is not funded`);
      }
      
      if (distributorCheck.balance < 1) {
        throw new Error(`Distributor account has insufficient ${distributorCheck.assetName} balance (${distributorCheck.balance} ${distributorCheck.assetName}). Need at least 1 ${distributorCheck.assetName} for transaction fees.`);
      }

      // Verify the secret key matches the public key
      const distributorKeypair = Keypair.fromSecret(form.distributorSecret);
      if (distributorKeypair.publicKey() !== form.distributorPublicKey) {
        throw new Error(`Secret key does not match the distributor public key. Expected: ${form.distributorPublicKey}, Got: ${distributorKeypair.publicKey()}`);
      }

      console.log("Account validation passed:", {
        issuerExists: issuerCheck.exists,
        distributorExists: distributorCheck.exists,
        distributorBalance: distributorCheck.balance,
        distributorPublicKey: form.distributorPublicKey,
        keypairPublicKey: distributorKeypair.publicKey(),
        keysMatch: distributorKeypair.publicKey() === form.distributorPublicKey
      });
      
      // Transaction options
      const baseFee = await server.fetchBaseFee();
      const txOptions = {
        fee: baseFee.toString(),
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      };

      // Load distributor account
      const distributorAccount = await server.loadAccount(form.distributorPublicKey);
      console.log("Distributor account loaded:", {
        publicKey: distributorAccount.accountId(),
        sequence: distributorAccount.sequenceNumber(),
        balances: distributorAccount.balances.length
      });

      // Create asset
      const bbc = new Asset(form.assetCode, form.issuerPublicKey);
      console.log("Asset created:", {
        code: form.assetCode,
        issuer: form.issuerPublicKey,
        assetString: bbc.toString()
      });

      // Validate and format trust limit
      const trustLimit = parseFloat(form.distributorTrustLimit);
      if (isNaN(trustLimit) || trustLimit <= 0) {
        throw new Error(`Invalid trust limit: ${form.distributorTrustLimit}. Must be a positive number.`);
      }

      // Change trust operation options
      const changeTrustOpts = {
        asset: bbc,
        limit: form.distributorTrustLimit.toString()
      };
      console.log("Change trust options:", changeTrustOpts);

      // Build transaction
      const transaction = new TransactionBuilder(distributorAccount, txOptions)
        .addOperation(Operation.changeTrust(changeTrustOpts))
        .setTimeout(0)
        .build();

      console.log("Transaction built:", {
        source: transaction.source,
        fee: transaction.fee,
        sequence: transaction.sequence,
        operations: transaction.operations.length
      });

      // Sign transaction with distributor's secret (use already created keypair)
      transaction.sign(distributorKeypair);
      console.log("Transaction signed successfully");

      // Submit transaction
      const response = await server.submitTransaction(transaction);
      
      setResult({
        success: true,
        hash: response.hash,
        message: "✅ ChangeTrust successful!"
      });
      
    } catch (error: any) {
      console.error("ChangeTrust failed:", error);
      console.error("Full error response:", JSON.stringify(error.response?.data, null, 2));
      
      // Parse Stellar-specific error details
      let errorMessage = "❌ ChangeTrust failed: ";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.extras?.result_codes?.transaction) {
          const resultCode = errorData.extras.result_codes.transaction;
          
          switch (resultCode) {
            case "tx_bad_auth":
              errorMessage += "Authentication failed. Please check:\n";
              errorMessage += "• Account exists and is funded with Test-π\n";
              errorMessage += "• Secret key is correct\n";
              errorMessage += "• Account has enough Test-π for transaction fees";
              break;
            case "tx_insufficient_fee":
              errorMessage += "Insufficient fee. The account doesn't have enough Test-π for the transaction fee.";
              break;
            case "tx_no_source_account":
              errorMessage += "Source account not found. The distributor account doesn't exist.";
              break;
            default:
              errorMessage += `Transaction failed with code: ${resultCode}`;
          }
        } else if (errorData.detail) {
          errorMessage += errorData.detail;
        } else {
          errorMessage += errorData.message || "Unknown error";
        }
      } else {
        errorMessage += error.message || "Unknown error occurred";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <ThemeToggle />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">
              🔄 Change Trust Operation
            </h1>
            <p className="text-secondary text-lg">
              Set up trust line for distributor account (replicating 1_changeTrust.js)
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <Card className="card-primary">
              <CardHeader className="card-header-primary">
                <CardTitle className="text-xl">⚙️ Configuration</CardTitle>
                <CardDescription className="text-primary-100">
                  Configure your change trust parameters. All fields are required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Network Configuration Display */}
                <div className="section-network">
                  <h3 className="text-lg font-semibold text-info flex items-center gap-2">
                    🌐 Network Settings
                  </h3>
                  <div className="p-4 bg-info-50 rounded-lg border border-info-200">
                    <p className="text-sm text-info-700">
                      <strong>Server:</strong> {STELLAR_CONFIG.serverUrl}
                    </p>
                    <p className="text-sm text-info-700">
                      <strong>Network:</strong> {STELLAR_CONFIG.networkPassphrase}
                    </p>
                    <p className="text-xs text-info-600 mt-2">
                      These settings are configured from environment variables
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
                      value={form.assetCode}
                      onChange={(e) => updateForm('assetCode', e.target.value)}
                      placeholder="e.g., MYTOKEN, BBC, USDC"
                      required
                    />
                  </div>
                </div>

                {/* Issuer Account */}
                <div className="section-issuer">
                  <h3 className="text-lg font-semibold text-warning flex items-center gap-2">
                    🏦 Issuer Account
                  </h3>
                  <p className="text-sm text-warning-700 mb-4">
                    The account that creates and issues the token.
                  </p>
                  <div className="space-y-3 p-4 bg-white/50 rounded-lg border border-warning-200">
                    <div>
                      <Label htmlFor="issuerPublicKey">Issuer Public Key</Label>
                      <Input
                        id="issuerPublicKey"
                        value={form.issuerPublicKey}
                        onChange={(e) => updateForm('issuerPublicKey', e.target.value)}
                        placeholder="Enter issuer public key (starts with G)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="issuerSecret">Issuer Secret Key</Label>
                      <Input
                        id="issuerSecret"
                        type="password"
                        value={form.issuerSecret}
                        onChange={(e) => updateForm('issuerSecret', e.target.value)}
                        placeholder="Enter issuer secret key (starts with S)"
                      />
                    </div>
                  </div>
                </div>

                {/* Distributor Account */}
                <div className="section-distributor">
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    📤 Distributor Account
                  </h3>
                  <p className="text-sm text-primary-700 mb-4">
                    The account that will receive the trust line for the asset.
                    <br />
                    <span className="text-xs text-primary-600">
                      ⚠️ This account must exist and have at least 1 Test-π for transaction fees.
                    </span>
                  </p>
                  <div className="space-y-3 p-4 bg-white/50 rounded-lg border border-primary-200">
                    <div>
                      <Label htmlFor="distributorPublicKey">Distributor Public Key</Label>
                      <Input
                        id="distributorPublicKey"
                        value={form.distributorPublicKey}
                        onChange={(e) => updateForm('distributorPublicKey', e.target.value)}
                        placeholder="Enter distributor public key (starts with G)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="distributorSecret">Distributor Secret Key</Label>
                      <Input
                        id="distributorSecret"
                        type="password"
                        value={form.distributorSecret}
                        onChange={(e) => updateForm('distributorSecret', e.target.value)}
                        placeholder="Enter distributor secret key (starts with S)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="distributorTrustLimit">Trust Limit</Label>
                      <Input
                        id="distributorTrustLimit"
                        type="number"
                        value={form.distributorTrustLimit}
                        onChange={(e) => updateForm('distributorTrustLimit', e.target.value)}
                        placeholder="e.g., 10000000"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Execution Panel */}
            <Card className="card-primary">
              <CardHeader className="card-header-primary">
                <CardTitle className="text-xl">🚀 Execute Change Trust</CardTitle>
                <CardDescription className="text-primary-100">
                  Execute the change trust operation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Operation Details */}
                <div className="section-operation">
                  <h3 className="text-lg font-semibold text-accent flex items-center gap-2">
                    📋 Operation Details
                  </h3>
                  <div className="p-4 bg-white/50 rounded-lg border border-accent-200">
                    <div className="space-y-2 text-sm">
                      <p><strong>Operation:</strong> ChangeTrust</p>
                      <p><strong>Asset:</strong> {form.assetCode || 'Not specified'}</p>
                      <p><strong>Issuer:</strong> {form.issuerPublicKey ? `${form.issuerPublicKey.substring(0, 8)}...` : 'Not specified'}</p>
                      <p><strong>Distributor:</strong> {form.distributorPublicKey ? `${form.distributorPublicKey.substring(0, 8)}...` : 'Not specified'}</p>
                      <p><strong>Trust Limit:</strong> {form.distributorTrustLimit || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Execute Button */}
                <div className="section-execute">
                  <Button
                    onClick={executeChangeTrust}
                    disabled={isLoading || !validateForm()}
                    className="w-full btn-primary"
                    size="lg"
                  >
                    {isLoading ? 'Executing Change Trust...' : 'Execute Change Trust'}
                  </Button>
                </div>

                {/* Results */}
                {result && (
                  <div className="section-results">
                    <h3 className="text-lg font-semibold text-success flex items-center gap-2">
                      ✅ Results
                    </h3>
                    <div className="p-4 bg-success-50 rounded-lg border border-success-200">
                      <p className="text-success-700 font-medium">{result.message}</p>
                      {result.hash && (
                        <div className="mt-2">
                          <p className="text-sm text-success-600">
                            <strong>Transaction Hash:</strong>
                          </p>
                          <p className="text-xs font-mono bg-success-100 p-2 rounded mt-1 break-all">
                            {result.hash}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="section-error">
                    <h3 className="text-lg font-semibold text-error flex items-center gap-2">
                      ❌ Error
                    </h3>
                    <div className="p-4 bg-error-50 rounded-lg border border-error-200">
                      <p className="text-error-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="text-center space-y-2">
                  <Link href="/">
                    <Button className="btn-outline w-full">← Back to Home</Button>
                  </Link>
                  <Link href="/tokenization">
                    <Button className="btn-outline w-full">→ Go to Full Tokenization</Button>
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
