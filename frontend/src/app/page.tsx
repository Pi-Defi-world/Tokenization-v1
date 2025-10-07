import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 Pi Token Launchpad
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Launch, trade, and manage your tokens on the Pi Network with our comprehensive token launchpad platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚀 Complete Tokenization
              </CardTitle>
              <CardDescription>
                Execute all 6 steps of the Pi Network tokenization process in one seamless workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tokenization">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Complete Workflow</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 View Balances
              </CardTitle>
              <CardDescription>
                Check account balances and token holdings across all accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/balances">
                <Button className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">View Balances</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔄 Trade Tokens
              </CardTitle>
              <CardDescription>
                Buy and sell tokens on the decentralized exchange
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/trade">
                <Button className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">Start Trading</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏊 Liquidity Pools
              </CardTitle>
              <CardDescription>
                View and manage liquidity pools on the network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pool">
                <Button className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">View Pools</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Trade History
              </CardTitle>
              <CardDescription>
                View recent trades and market activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/trade-history">
                <Button className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">View History</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔄 Change Trust
              </CardTitle>
              <CardDescription>
                Test individual change trust operation (replicating 1_changeTrust.js)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/change-trust">
                <Button className="w-full bg-green-600 hover:bg-green-700">Test Change Trust</Button>
              </Link>
            </CardContent>
          </Card>
        </div>


        <div className="text-center mt-16">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Getting Started</h3>
            <p className="text-blue-800 mb-4">
              Start with the <strong>Complete Tokenization</strong> workflow to launch your token on Pi Network. 
              It guides you through all 6 steps in the correct order with proper validation and error handling.
            </p>
            <p className="text-blue-700 text-sm">
              Use the other tools to check balances, trade tokens, view pools, and monitor market activity.
            </p>
          </div>
          <p className="text-gray-500 mt-8">
            Built on Pi Network • Powered by Stellar Protocol
          </p>
        </div>
      </div>
    </div>
  );
}