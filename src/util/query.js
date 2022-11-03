import { Client } from './client';

const REGISTRY_CONTRACT = process.env.VUE_APP_REGISTRY_CONTRACT;

/**
 * Resolve a Domain name record from storage
 * @param {String} name : Domain name to be resolved
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function ResolveRecord(name, client = null) {
  if (typeof name !== 'string') return;
  if (!name.length) return;
  if (!client) client = await Client();
  try {
    let entrypoint = {
      resolve_record: {
        name: name
      }
    };
    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      REGISTRY_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return {};
  }
}

/**
 * Resolve the expiration information for a Domain
 * @param {String} name : Domain name to be resolve the expiration of
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function RecordExpiration(name, client = null) {
  if (typeof name !== 'string') return;
  if (!name.length) return;
  if (!client) client = await Client();
  try {
    let entrypoint = {
      record_expiration: {
        name: name
      }
    };
    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      REGISTRY_CONTRACT, 
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return {};
  }
}

/**
 * Reads the contract Config
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function Config(client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      config: {}
    };
    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      REGISTRY_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return {};
  }
}

export {
  ResolveRecord,
  RecordExpiration,
  Config
}