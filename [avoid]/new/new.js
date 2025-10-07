import * as StellarSdk from "@stellar/stellar-sdk";
import config from "../js/config.json" assert { type: "json" };

const {
  accounts: { issuer, distributor },
  serverUrl
} = config;

const server = new StellarSdk.Horizon.Server(serverUrl);

const main = async () => {
  const distributorAccount = await server.loadAccount(distributor.publicKey);

  // Match the asset name here (BRD instead of BNG)
  const breadAsset = new StellarSdk.Asset("BRD", issuer.publicKey);

  const txOptions = {
    fee: await server.fetchBaseFee(),
    networkPassphrase: "Pi Testnet"
  };

  const transaction = new StellarSdk.TransactionBuilder(distributorAccount, txOptions)
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset: breadAsset,
        limit: "10000000"
      })
    )
    .setTimeout(0)
    .build();

  transaction.sign(StellarSdk.Keypair.fromSecret(distributor.secret));
  await server.submitTransaction(transaction);
};

main()
  .then(() => console.log("✅ Trustline set"))
  .catch(e => console.error("❌ Failed:", e.response?.data || e));
