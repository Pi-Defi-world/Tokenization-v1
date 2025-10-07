import StellarSdk from "@stellar/stellar-sdk";
import config from "../config.json" assert { type: "json" };

const { 
  accounts: { issuer },
  network: { serverUrl, networkPassphrase },
  security: { lockSettings }
} = config;

// Destructure from default export
const { Server, Keypair, TransactionBuilder, Operation } = StellarSdk;
const server = new StellarSdk.Horizon.Server(serverUrl);


const main = async () => {
  const issuingAccount = await server.loadAccount(issuer.publicKey);

  const txOptions = {
    fee: await server.fetchBaseFee(),
    networkPassphrase: networkPassphrase,
  };

  const transaction = new TransactionBuilder(issuingAccount, txOptions)
    .addOperation(
      Operation.setOptions(lockSettings)
    )
    .setTimeout(0)
    .build();

  transaction.sign(Keypair.fromSecret(issuer.secret));

  await server.submitTransaction(transaction);
  console.log("✅ Issuing account locked successfully!");
};

main().catch((e) => {
  console.error("❌ Failed to lock issuing account:", e);
});
