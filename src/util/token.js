import { Client } from './client';
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

export {
  Tokens,
  Token
}