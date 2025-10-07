import StellarSdk from "@stellar/stellar-sdk";
import config from "../config.json" assert { type: "json" };

const { 
  accounts: { issuer, distributor },
  network: { serverUrl, networkPassphrase },
  asset: { code: assetCode },
  trading: { sellAmount, sellPrice }
} = config;

// Destructure from default export
const { Server, Asset, TransactionBuilder, Operation, Keypair } = StellarSdk;

const server = new StellarSdk.Horizon.Server(serverUrl);

const main = async () => {
  const distributorAccount = await server.loadAccount(distributor.publicKey);

  const breadAsset = new Asset(assetCode, issuer.publicKey);

  const txOptions = {
    fee: await server.fetchBaseFee(),
    networkPassphrase: networkPassphrase,
  };

  const manageSellOfferOpts = {
    selling: breadAsset,
    buying: Asset.native(),
    amount: sellAmount,
    price: sellPrice,
  };

  const transaction = new TransactionBuilder(distributorAccount, txOptions)
    .addOperation(Operation.manageSellOffer(manageSellOfferOpts))
    .setTimeout(0)
    .build();

  transaction.sign(Keypair.fromSecret(distributor.secret));

  await server.submitTransaction(transaction);
  console.log("✅ Token distribution completed!");
};

main().catch((e) => {
  console.error("❌ Failed during token distribution:", e);
});
