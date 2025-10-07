import StellarSdk from "@stellar/stellar-sdk";
import config from "./config.json" assert { type: "json" };
import type { Config } from "./types.js";

const typedConfig = config as Config;

const { 
  accounts: { issuer, buyer },
  network: { serverUrl, networkPassphrase },
  asset: { code: assetCode },
  trading: { buyerTrustLimit, purchaseAmount, purchasePrice }
} = typedConfig;

const server = new StellarSdk.Horizon.Server(serverUrl);

const main = async (): Promise<void> => {
  // Load buyer account
  const buyerAccount = await server.loadAccount(buyer.publicKey);

  // Create asset
  const bbc = new StellarSdk.Asset(assetCode, issuer.publicKey);

  const txOptions = {
    fee: await server.fetchBaseFee(),
    networkPassphrase: networkPassphrase
  };

  // Create change trust operation
  const changeTrustOpts = {
    asset: bbc,
    limit: buyerTrustLimit
  };

  // Create a manage sell offer operation
  const manageSellOfferOpts = {
    selling: StellarSdk.Asset.native(),
    buying: bbc,
    amount: purchaseAmount,
    price: purchasePrice
  };

  // Build transaction
  const transaction = new StellarSdk.TransactionBuilder(buyerAccount, txOptions)
    .addOperation(StellarSdk.Operation.changeTrust(changeTrustOpts))
    .addOperation(StellarSdk.Operation.manageSellOffer(manageSellOfferOpts))
    .setTimeout(0)
    .build();

  // Sign transaction
  transaction.sign(StellarSdk.Keypair.fromSecret(buyer.secret));

  // Submit to network
  const result = await server.submitTransaction(transaction);
  console.log("✅ Transaction successful:", result.hash);
};

main().catch((e: any) => {
  console.error("❌ Transaction failed:", e);
});
