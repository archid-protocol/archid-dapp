export const MainnetInfo = {
    // Chain-id of the Cosmos SDK chain.
    chainId: "archway-1",
    // The name of the chain to be displayed to the user.
    chainName: "Archway",
    // RPC endpoint of the chain.
    // rpc: "https://rpc.mainnet.archway.io",
    // rpc: "https://rpc-archway.whispernode.com",
    rpc: "https://rpc-1.archway.nodes.guru",
    // REST endpoint of the chain.
    rest: "https://api.mainnet.archway.io",
    // Staking coin information
    stakeCurrency: {
      // Coin denomination to be displayed to the user.
      coinDenom: "ARCH",
      // Actual denom (i.e. uatom, uscrt) used by the blockchain.
      coinMinimalDenom: "aarch",
      // # of decimal points to convert minimal denomination to user-facing denomination.
      coinDecimals: 6,
      // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
      // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
      // coinGeckoId: ""
    },
    // Bech32 configuration to show the address to user.
    // This field is the interface of
    // {
    //   bech32PrefixAccAddr: string;
    //   bech32PrefixAccPub: string;
    //   bech32PrefixValAddr: string;
    //   bech32PrefixValPub: string;
    //   bech32PrefixConsAddr: string;
    //   bech32PrefixConsPub: string;
    // }
    bech32Config: {
      bech32PrefixAccAddr: "archway",
      bech32PrefixAccPub: "archwaypub",
      bech32PrefixValAddr: "archwayvaloper",
      bech32PrefixValPub: "archwayvaloperpub",
      bech32PrefixConsAddr: "archwayvalcons",
      bech32PrefixConsPub: "archwayvalconspub"
    },
    bip44: {
      coinType: 118,
    },
    // List of all coin/tokens used in this chain.
    currencies: [{
      // Coin denomination to be displayed to the user.
      coinDenom: "ARCH",
      // Actual denom (i.e. uatom, uscrt) used by the blockchain.
      coinMinimalDenom: "aarch",
      // # of decimal points to convert minimal denomination to user-facing denomination.
      coinDecimals: 18,
      // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
      // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
      // coinGeckoId: ""
    }],
    // List of coin/tokens used as a fee token in this chain.
    feeCurrencies: [{
      // Coin denomination to be displayed to the user.
      coinDenom: "ARCH",
      // Actual denom (i.e. uatom, uscrt) used by the blockchain.
      coinMinimalDenom: "aarch",
      // # of decimal points to convert minimal denomination to user-facing denomination.
      coinDecimals: 18,
      // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
      // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
      // coinGeckoId: ""
      gasPriceStep: {
        low: 0,
        average: 0.1,
        high: 0.2
      },
    }],
    // (Optional) This is used to set the fee of the transaction.
    // If this field is not provided, Keplr extension will set the default gas price as (low: 0.01, average: 0.025, high: 0.04).
    // Currently, Keplr doesn't support dynamic calculation of the gas prices based on on-chain data.
    // Make sure that the gas prices are higher than the minimum gas prices accepted by chain validators and RPC/REST endpoint.
    features: ['cosmwasm']
  };
  