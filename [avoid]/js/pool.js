// pool.js
import StellarSdk from "@stellar/stellar-sdk";
import config from "./config.json" assert { type: "json" };

const { issuer, distributor } = config.accounts;
const server = new StellarSdk.Horizon.Server("https://api.testnet.minepi.com");

const main = async () => {
  try {
    const distributorAccount = await server.loadAccount(distributor.publicKey);

    const bbc = new StellarSdk.Asset("BBC", issuer.publicKey);
    const testPi = StellarSdk.Asset.native();

    const txOptions = {
      fee: await server.fetchBaseFee(),
      networkPassphrase: "Pi Testnet",
    };

    // Liquidity pool deposit operation directly
    const transaction = new StellarSdk.TransactionBuilder(distributorAccount, txOptions)
      .addOperation(
        StellarSdk.Operation.liquidityPoolDeposit({
          liquidityPoolId: StellarSdk.LiquidityPoolId.fromAssets
            ? StellarSdk.LiquidityPoolId.fromAssets(testPi, bbc, StellarSdk.LiquidityPoolFeeV18)
            : undefined, // fallback, will use assets directly in operation
          maxAmountA: "50",
          maxAmountB: "500",
          minPrice: "0.01",
          maxPrice: "100",
        })
      )
      .setTimeout(0)
      .build();

    transaction.sign(StellarSdk.Keypair.fromSecret(distributor.secret));
    const result = await server.submitTransaction(transaction);
    console.log("✅ Liquidity pool created and funded:", result.hash);
  } catch (e) {
    console.error("❌ Liquidity pool operation failed:", e);
  }
};

main();
