import StellarSdk from "@stellar/stellar-sdk";
import config from "./config.json" with { type: "json" };

const { issuer, distributor } = config.accounts;
const server = new StellarSdk.Horizon.Server("https://api.testnet.minepi.com");

const main = async () => {
  try {
    const distributorAccount = await server.loadAccount(distributor.publicKey);

    const meme = new StellarSdk.Asset("MEME", issuer.publicKey);
    const testPi = StellarSdk.Asset.native();

    const txOptions = {
      fee: await server.fetchBaseFee(),
      networkPassphrase: "Pi Testnet",
    };

    // Create liquidity pool asset with 0.3% fee (30 basis points)
    const liquidityPoolAsset = new StellarSdk.LiquidityPoolAsset(
      testPi,
      meme,
      StellarSdk.LiquidityPoolFeeV18
    );

    // Step 1: Establish trustline to the liquidity pool
    console.log("🔗 Step 1: Establishing trustline to liquidity pool...");
    const trustTransaction = new StellarSdk.TransactionBuilder(distributorAccount, txOptions)
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset: liquidityPoolAsset,
        })
      )
      .setTimeout(0)
      .build();

    trustTransaction.sign(StellarSdk.Keypair.fromSecret(distributor.secret));
    const trustResult = await server.submitTransaction(trustTransaction);
    console.log("✅ Trustline established:", trustResult.hash);

    // Get the pool ID from the account balances after trustline is established
    const distributorAccountReloaded = await server.loadAccount(distributor.publicKey);
    let poolId = null;
    
    // Find the liquidity pool share balance
    for (const balance of distributorAccountReloaded.balances) {
      if (balance.asset_type === "liquidity_pool_shares") {
        poolId = balance.liquidity_pool_id;
        console.log("📊 Liquidity Pool ID:", poolId);
        break;
      }
    }

    if (!poolId) {
      throw new Error("Could not find liquidity pool ID from account balances");
    }

    // Step 2: Deposit into the liquidity pool
    console.log("💰 Step 2: Depositing into liquidity pool...");
    const depositTransaction = new StellarSdk.TransactionBuilder(distributorAccountReloaded, txOptions)
      .addOperation(
        StellarSdk.Operation.liquidityPoolDeposit({
          liquidityPoolId: poolId,
          maxAmountA: "40",
          maxAmountB: "400",
          minPrice: "0.01",
          maxPrice: "100",
        })
      )
      .setTimeout(0)
      .build();

    depositTransaction.sign(StellarSdk.Keypair.fromSecret(distributor.secret));
    const depositResult = await server.submitTransaction(depositTransaction);
    console.log("✅ Liquidity pool funded:", depositResult.hash);
    console.log("🎉 Liquidity pool successfully created and funded!");
  } catch (e) {
    console.error("❌ Liquidity pool operation failed:", e);
    if (e.response?.data?.extras) {
      console.error("Details:", JSON.stringify(e.response.data.extras, null, 2));
    }
  }
};

main();
