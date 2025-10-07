import StellarSdk from "@stellar/stellar-sdk";
import config from "../config.json" assert { type: "json" };

const {
  accounts: { issuer, distributor },
  network: { serverUrl, networkPassphrase },
  asset: { code: assetCode },
  trading: { distributorTrustLimit }
} = config;

const { Horizon, Networks, Asset, TransactionBuilder, Operation, Keypair } = StellarSdk;

const server = new Horizon.Server(serverUrl);

const main = async () => {
  const txOptions = {
    fee: await server.fetchBaseFee(),
    networkPassphrase: networkPassphrase,
  };

  const distributorAccount = await server.loadAccount(distributor.publicKey);

  const bbc = new Asset(assetCode, issuer.publicKey);

  const changeTrustOpts = {
    asset: bbc,
    limit: distributorTrustLimit
  };

  const transaction = new TransactionBuilder(distributorAccount, txOptions)
    .addOperation(Operation.changeTrust(changeTrustOpts))
    .setTimeout(0)
    .build();

  transaction.sign(Keypair.fromSecret(distributor.secret));

  try {
    const res = await server.submitTransaction(transaction);
    console.log("✅ ChangeTrust successful:", res.hash);
  } catch (e) {
    console.error("❌ ChangeTrust failed:", e.response?.data || e);
  }
};

main();
