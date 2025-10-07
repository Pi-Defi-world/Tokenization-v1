// 2_createAsset.js
import StellarSdk from "@stellar/stellar-sdk";
import config from "../config.json" assert { type: "json" };

const {
  accounts: { issuer, distributor },
  network: { serverUrl, networkPassphrase },
  asset: { code: assetCode },
  issuance: { initialAmount },
  transactions: { timeout }
} = config;

const server = new StellarSdk.Horizon.Server(serverUrl);

const issuingKeys = StellarSdk.Keypair.fromSecret(issuer.secret);
const distributorKeys = StellarSdk.Keypair.fromSecret(distributor.secret);

// 🪙 Define your custom token
const asset = new StellarSdk.Asset(assetCode, issuingKeys.publicKey());

(async () => {
  try {
    // Load issuer account
    const account = await server.loadAccount(issuingKeys.publicKey());

    // Build transaction to send tokens from Issuer → Distributor
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: await server.fetchBaseFee(),
      networkPassphrase: networkPassphrase 
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: distributorKeys.publicKey(),
          asset,
          amount: initialAmount   // amount to issue
        })
      )
      .setTimeout(timeout)
      .build();

    // Sign with Issuer’s secret
    tx.sign(issuingKeys);

    // Submit to Pi Testnet
    const res = await server.submitTransaction(tx);
    console.log("✅ Asset issued successfully:", res.hash);

  } catch (e) {
  if (e.response && e.response.data) {
    console.error("❌ Failed:", JSON.stringify(e.response.data, null, 2));
  } else {
    console.error("❌ Failed:", e.message || e);
  }
}

})();
