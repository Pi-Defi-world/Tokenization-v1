"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import StellarSdk from '@stellar/stellar-sdk';

export default function Trade() {
  // Constants - not user configurable
  const SERVER_URL = "https://api.testnet.minepi.com";
  const NETWORK_PASSPHRASE = "Pi Testnet";

  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [formData, setFormData] = useState({
    amount: "1",
    price: "1",
    secretKey: "",
    assetCode: "",
    issuerPublicKey: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetCode || !formData.issuerPublicKey || !formData.secretKey) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const server = new StellarSdk.Horizon.Server(SERVER_URL);
      
      if (tradeType === 'buy') {
        // Load buyer account - get public key from secret key
        const buyerKeypair = StellarSdk.Keypair.fromSecret(formData.secretKey);
        const buyerAccount = await server.loadAccount(buyerKeypair.publicKey());
        
        // Create asset
        const asset = new StellarSdk.Asset(formData.assetCode, formData.issuerPublicKey);
        
        const txOptions = {
          fee: (await server.fetchBaseFee()).toString(),
          networkPassphrase: NETWORK_PASSPHRASE
        };

        // Create change trust operation
        const changeTrustOpts = {
          asset: asset,
          limit: "1000000" // High limit for buyer
        };

        // Create a manage sell offer operation (buying asset with Test-π)
        const manageSellOfferOpts = {
          selling: StellarSdk.Asset.native(),
          buying: asset,
          amount: formData.amount,
          price: formData.price
        };

        // Build transaction
        const transaction = new StellarSdk.TransactionBuilder(buyerAccount, txOptions)
          .addOperation(StellarSdk.Operation.changeTrust(changeTrustOpts))
          .addOperation(StellarSdk.Operation.manageSellOffer(manageSellOfferOpts))
          .setTimeout(0)
          .build();

        // Sign transaction
        transaction.sign(buyerKeypair);

        // Submit to network
        const result = await server.submitTransaction(transaction);
        setResult(`✅ Token purchase successful! Hash: ${result.hash}`);
        
      } else {
        // Load distributor account - get public key from secret key
        const distributorKeypair = StellarSdk.Keypair.fromSecret(formData.secretKey);
        const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
        
        // Create asset
        const asset = new StellarSdk.Asset(formData.assetCode, formData.issuerPublicKey);

        const txOptions = {
          fee: (await server.fetchBaseFee()).toString(),
          networkPassphrase: NETWORK_PASSPHRASE,
        };

        const manageSellOfferOpts = {
          selling: asset,
          buying: StellarSdk.Asset.native(),
          amount: formData.amount,
          price: formData.price,
        };

        const transaction = new StellarSdk.TransactionBuilder(distributorAccount, txOptions)
          .addOperation(StellarSdk.Operation.manageSellOffer(manageSellOfferOpts))
          .setTimeout(0)
          .build();

        transaction.sign(distributorKeypair);
        const result = await server.submitTransaction(transaction);
        setResult(`✅ Token sale successful! Hash: ${result.hash}`);
      }
      
    } catch (error: any) {
      console.error(`${tradeType} error:`, error);
      setResult(`❌ Error ${tradeType === 'buy' ? 'purchasing' : 'selling'} token: ${error.response?.data || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🔄 Trade Tokens
            </h1>
            <p className="text-gray-600">
              Buy and sell tokens on the Pi Network testnet
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Trade Configuration</CardTitle>
              <CardDescription>
                Choose your trade type and configure the parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex gap-2">
                  <Button
                    className={tradeType === 'buy' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}
                    onClick={() => setTradeType('buy')}
                  >
                    🛒 Buy Tokens
                  </Button>
                  <Button
                    className={tradeType === 'sell' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}
                    onClick={() => setTradeType('sell')}
                  >
                    💰 Sell Tokens
                  </Button>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Network:</strong> Pi Testnet ({SERVER_URL})
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assetCode">Asset Code</Label>
                      <Input
                        id="assetCode"
                        value={formData.assetCode}
                        onChange={(e) => setFormData({...formData, assetCode: e.target.value})}
                        placeholder="e.g., BBC"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="issuerPublicKey">Issuer Public Key</Label>
                      <Input
                        id="issuerPublicKey"
                        value={formData.issuerPublicKey}
                        onChange={(e) => setFormData({...formData, issuerPublicKey: e.target.value})}
                        placeholder="G..."
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.00000001"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="1.00000000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secretKey">
                      {tradeType === 'buy' ? 'Buyer' : 'Distributor'} Secret Key
                    </Label>
                    <Input
                      id="secretKey"
                      type="password"
                      value={formData.secretKey}
                      onChange={(e) => setFormData({...formData, secretKey: e.target.value})}
                      placeholder={`Enter ${tradeType === 'buy' ? 'buyer' : 'distributor'} secret key`}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? `${tradeType === 'buy' ? 'Buying' : 'Selling'}...` : `${tradeType === 'buy' ? 'Buy' : 'Sell'} Tokens`}
                </Button>
              </form>

              {result && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm">{result}</p>
                </div>
              )}

              <div className="mt-6 text-center">
                <Link href="/">
                  <Button className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">← Back to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}