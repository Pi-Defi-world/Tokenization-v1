import StellarSdk from "@stellar/stellar-sdk";
import config from "./config.json" assert { type: "json" };
import type { Config } from "./types.js";

const typedConfig = config as Config;

const { 
  accounts: { issuer, distributor, buyer }, 
  network: { serverUrl } 
} = typedConfig;

// Access the correct Server class
const server = new StellarSdk.Horizon.Server(serverUrl);

interface AccountBalance {
  name: string;
  accountId: string;
  balances: string[];
}

const displayTemplate = ({ name, accountId, balances }: AccountBalance): void => {
  console.log(
    `\u001b[33m${name}\u001b[0m \u001b[37;2m${accountId.substring(
      0,
      9
    )}${Array.from(new Array(15 - name.length))
      .map(() => "⋅")
      .join("")}\u001b[0m${balances}`
  );
};

const checkAccounts = async (): Promise<void> => {
  const stellarAccounts = await Promise.all(
    [issuer, distributor, buyer].map(async ({ name, publicKey }) => {
      const account = await server.loadAccount(publicKey);
      return {
        name,
        accountId: publicKey,
        balances: account.balances.map(
          ({ balance, asset_type, asset_code }: any) =>
            `${balance} ${asset_type === "native" ? "Test-π" : asset_code}`
        )
      };
    })
  );

  stellarAccounts.forEach(displayTemplate);
};

checkAccounts().catch((e: any) => {
  console.error("Error:", e.response?.data || e);
});
