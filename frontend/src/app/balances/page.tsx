"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import StellarSdk from '@stellar/stellar-sdk';

interface AccountBalance {
  name: string;
  accountId: string;
  balances: any[];
}

export default function Balances() {
  // Constants - not user configurable
  const SERVER_URL = "https://api.testnet.minepi.com";

  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accountKeys, setAccountKeys] = useState({
    issuer: "",
    distributor: "",
    buyer: ""
  });

  const fetchBalances = async () => {
    if (!accountKeys.issuer || !accountKeys.distributor || !accountKeys.buyer) {
      alert('Please enter all account public keys first');
      return;
    }

    setIsLoading(true);
    try {
      const server = new StellarSdk.Horizon.Server(SERVER_URL);
      const balanceResults: AccountBalance[] = [];

      const accounts = [
        { name: "Issuer", publicKey: accountKeys.issuer },
        { name: "Distributor", publicKey: accountKeys.distributor },
        { name: "Buyer", publicKey: accountKeys.buyer }
      ];

      for (const account of accounts) {
        try {
          const accountData = await server.loadAccount(account.publicKey);
          balanceResults.push({
            name: account.name,
            accountId: account.publicKey,
            balances: accountData.balances
          });
        } catch (error) {
          console.error(`Error loading ${account.name} account:`, error);
          balanceResults.push({
            name: account.name,
            accountId: account.publicKey,
            balances: [{ error: `Failed to load account: ${(error as Error).message}` }]
          });
        }
      }

      setBalances(balanceResults);
    } catch (error) {
      console.error("Error fetching balances:", error);
      setBalances([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📊 Account Balances
            </h1>
            <p className="text-gray-600">
              View balances across all accounts in your token ecosystem
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Configuration</CardTitle>
              <CardDescription>
                Enter the public keys of the accounts you want to check
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Network:</strong> Pi Testnet ({SERVER_URL})
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="issuerKey">Issuer Public Key</Label>
                  <Input
                    id="issuerKey"
                    value={accountKeys.issuer}
                    onChange={(e) => setAccountKeys({...accountKeys, issuer: e.target.value})}
                    placeholder="G..."
                  />
                </div>
                <div>
                  <Label htmlFor="distributorKey">Distributor Public Key</Label>
                  <Input
                    id="distributorKey"
                    value={accountKeys.distributor}
                    onChange={(e) => setAccountKeys({...accountKeys, distributor: e.target.value})}
                    placeholder="G..."
                  />
                </div>
                <div>
                  <Label htmlFor="buyerKey">Buyer Public Key</Label>
                  <Input
                    id="buyerKey"
                    value={accountKeys.buyer}
                    onChange={(e) => setAccountKeys({...accountKeys, buyer: e.target.value})}
                    placeholder="G..."
                  />
                </div>
              </div>
              <div className="text-center">
                <Button onClick={fetchBalances} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Check Balances"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {balances.length > 0 ? (
              balances.map((account, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">
                        {account.name === "Issuer" ? "🏦" : 
                         account.name === "Distributor" ? "📦" : "👤"}
                      </span>
                      {account.name}
                    </CardTitle>
                    <CardDescription>
                      {account.accountId.substring(0, 9)}...{account.accountId.substring(account.accountId.length - 4)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {account.balances.length > 0 ? (
                        account.balances.map((balance: any, balanceIndex: number) => (
                          <div key={balanceIndex} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {balance.asset_type === 'native' ? 'Test-π' : 
                                 `${balance.asset_code}:${balance.asset_issuer?.substring(0, 8)}...`}
                              </span>
                              <span className="text-sm text-gray-600">
                                {balance.balance} {balance.asset_type === 'native' ? 'Test-π' : balance.asset_code}
                              </span>
                            </div>
                            {balance.error && (
                              <span className="text-red-500 text-sm">{balance.error}</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No balances found</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">
                    {isLoading ? "Loading balances..." : "No account data available"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link href="/">
              <Button className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">← Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
