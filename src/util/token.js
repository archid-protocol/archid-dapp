import { Client, Accounts } from './client';
import { Config } from './query';

/**
 * Loads token ids from token contract
 * @param {String} contract? : (Optional) contract address string for token contract
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function Tokens(contract = null, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      all_tokens: {}
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
 * Loads token ids owned by a specific address
 * @param {String} contract? : (Optional) contract address string for token contract
 * @param {String} account? : (Optional) owner account address to be queried
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
 async function TokensOf(contract = null, account = null, client = null) {
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
        owner: account
      }
    };

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


export {
  Tokens,
  TokensOf,
  Token,
  OwnerOf
}