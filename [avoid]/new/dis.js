import * as StellarSdk from "@stellar/stellar-sdk";

const server = new StellarSdk.Horizon.Server("https://api.testnet.minepi.com");

const distributorSecret = "SCZ7OW4R3GSQGZ4ACKPC7X4DCF5ZKZ3P2UERS6UPCF2QRSPEKU7HVFT6"; // distributor’s secret
const distributorKeypair = StellarSdk.Keypair.fromSecret(distributorSecret);

const asset = new StellarSdk.Asset("BRD", "GAZDGVEINRIL3CAZB5LECLV7V2F5OUJ4J426LD25WGFL7SE6IW6VK5MIINRIL3CAZB5LECLV7V2F5OUJ4J426LD25WGFL7SE6IW6VK5MI"); // issuer’s pubkey here

async function setTrustline() {
  const account = await server.loadAccount(distributorKeypair.publicKey());

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: "Pi Testnet"
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset,
        limit: "1000000" // optional limit
      })
    )
    .setTimeout(0)
    .build();

  tx.sign(distributorKeypair);

  await server.submitTransaction(tx);
  console.log("✅ Trustline created");
}

setTrustline().catch(console.error);
