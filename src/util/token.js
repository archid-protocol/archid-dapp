import { Client, Accounts } from './client';
import { Config } from './query';

/**
 * Returns the total number of active tokens in the contract; allows for pagination loops
 * @param {String} contract? : (Optional) contract address string for token contract
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function NumTokens (contract = null, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      num_tokens: {}
    };

    if (!contract || typeof contract !== "string") {
      let cw721Query = await Config(client);
      contract = cw721Query.cw721;
    }

    let tokenQuery = await client.wasmClient.queryClient.wasm.queryContractSmart(
      contract,
      entrypoint
    );
    
    return tokenQuery;
  } catch(e) {
    console.error(e);
    return {};
  }
}

/**
 * Loads token ids from token contract
 * @param {String} contract? : (Optional) contract address string for token contract
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @param {Number} limit? : (Optional) max amount of tokens to be loaded; defaults to 100
 * @param {String} start_after? : (Optional) `tokenId` for pagination, begin loading tokens beginning after a specific `tokenId`
 * @returns {QueryResult}
 */
async function Tokens(contract = null, client = null, limit = 100, start_after = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      all_tokens: {
        limit: limit,
      }
    };

    if (start_after) entrypoint.all_tokens["start_after"] = start_after;

    if (!contract || typeof contract !== "string") {
      let cw721Query = await Config(client);
      contract = cw721Query.cw721;
    }

    let tokenQuery = await client.wasmClient.queryClient.wasm.queryContractSmart(
      contract,
      entrypoint
    );
    
    return tokenQuery;
  } catch(e) {
    console.error(e);
    return {};
  }
}

/**
 * Loads token ids owned by a specific address
 * @param {String} contract? : (Optional) contract address string for token contract
 * @param {String} account? : (Optional) owner account address to be queried
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @param {Number} limit? : (Optional) max amount of tokens to be loaded; defaults to 100
 * @param {String} start_after? : (Optional) `tokenId` for pagination, begin loading tokens beginning after a specific `tokenId`
 * @returns {QueryResult}
 */
 async function TokensOf(contract = null, account = null, client = null,  limit = 100, start_after = null) {
  if (!client) client = await Client();
  try {
    if (!account) {
      let accounts = await Accounts(client);
      account = accounts[0].address;
    }
    if (!contract || typeof contract !== "string") {
      let cw721Query = await Config(client);
      contract = cw721Query.cw721;
    }

    let entrypoint = {
      tokens: {
        owner: account,
        limit: limit,
      }
    };

    if (start_after) entrypoint.tokens["start_after"] = start_after;

    let tokenQuery = await client.wasmClient.queryClient.wasm.queryContractSmart(
      contract,
      entrypoint
    );
    
    return tokenQuery;
  } catch(e) {
    console.error(e);
    return {};
  }
}

/**
 * Load token metadata from token contract for a valid token ID
 * @param {String} tokenId : The domain name / token ID to be fetched
 * @param {String} contract? : (Optional) contract address string for token contract
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function Token (tokenId = null, contract = null, client = null) {
  if (!client) client = await Client();
  if (!tokenId || typeof tokenId !== 'string') {
    console.warn('Invalid token ID ' + typeof tokenId);
    return {};
  }

  try {
    let entrypoint = {
      nft_info: {
        token_id: tokenId
      }
    };

    if (!contract || typeof contract !== "string") {
      let cw721Query = await Config(client);
      contract = cw721Query.cw721;
    }

    let tokenQuery = await client.wasmClient.queryClient.wasm.queryContractSmart(
      contract,
      entrypoint
    );

    return tokenQuery;
  } catch(e) {
    console.error(e);
    return {};
  }
}

/**
 * Load token owner from token contract for a valid token ID
 * @param {String} tokenId : The domain name / token ID to be fetched
 * @param {String} contract? : (Optional) contract address string for token contract
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function OwnerOf (tokenId = null, contract = null, client = null) {
  if (!client) client = await Client();
  if (!tokenId || typeof tokenId !== 'string') {
    console.warn('Invalid token ID ' + typeof tokenId);
    return {};
  }

  try {
    let entrypoint = {
      owner_of: {
        token_id: tokenId,
        include_expired: null
      }
    };

    if (!contract || typeof contract !== "string") {
      let cw721Query = await Config(client);
      contract = cw721Query.cw721;
    }

    let ownerQuery = await client.wasmClient.queryClient.wasm.queryContractSmart(
      contract,
      entrypoint
    );

    return ownerQuery;
  } catch(e) {
    console.error(e);
    return {};
  }
}

/**
 * Private parsing function for tx filter args.
 * @param { String } oneLiner : Tx filter arguments; e.g. `wasm._contract_address=${contract}&wasm.token_id=${tokenId}`
 * @returns { Object } : { key, value } kv pairs
 */
function _makeTags(oneLiner)  {
  return oneLiner.split("&").map((pair) => {
    if (pair.indexOf("=") === -1) throw new Error("Parsing error: Equal sign missing");
    const parts = pair.split("=");
    if (parts.length > 2) {
      throw new Error(
        "Parsing error: multiple equal signs found.",
      );
    }
    const [key, value] = parts;
    if (!key) throw new Error("Parsing error: key must not be empty");
    return { key, value };
  });
}

/**
 * Load token transaction history from token contract for a valid token ID
 * @param {String} tokenId : The domain name / token ID to be fetched
 * @param {String} contract? : (Optional) contract address string for token contract
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function HistoryOf(tokenId = null, contract = null, client = null) {
  if (!client) client = await Client();
  if (!tokenId || typeof tokenId !== 'string') {
    console.warn('Invalid token ID ' + typeof tokenId);
    return {};
  }

  try {
    if (!contract || typeof contract !== "string") {
      let cw721Query = await Config(client);
      contract = cw721Query.cw721;
    }

    let historyQuery = await client.wasmClient.searchTx({
      tags: _makeTags(`wasm._contract_address=${contract}&wasm.token_id=${tokenId}`),
    });

    return historyQuery;
  } catch(e) {
    console.error(e);
    return {};
  }
}

async function RecentDomains(contract = null, client = null) {
  if (!client) client = await Client();
  try {
    if (!contract || typeof contract !== "string") {
      let cw721Query = await Config(client);
      contract = cw721Query.cw721;
    }

    let historyQuery = await client.wasmClient.searchTx({
      tags: _makeTags(`wasm._contract_address=${contract}&wasm.action=mint`),
    });
    return historyQuery;
  } catch(e) {
    console.error(e);
    return {};
  }
}

export {
  NumTokens,
  Tokens,
  TokensOf,
  Token,
  OwnerOf,
  HistoryOf,
  RecentDomains,
}