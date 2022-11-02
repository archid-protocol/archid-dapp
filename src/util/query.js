import { keplrClient } from './cosmwasm';

const REGISTRY_CONTRACT = process.env.VUE_APP_REGISTRY_CONTRACT;

/**
 * Gets signing client instance
 * @param {String} wallet : Supported wallet values are; 'keplr', 'falcon'
 * @returns {SigningCosmWasmClient}
 */
async function Client(wallet = 'keplr') {
  let client;
  switch (wallet) {
    case 'falcon': { return; } // TODO: Falcon wallet
    case 'keplr': {
      client = await keplrClient();
      return client;
    }
  }
}

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
    let query = await client.queryClient.wasm.queryContractSmart.query(
      REGISTRY_CONTRACT, 
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return {};
  }
}

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
    let query = await client.queryClient.wasm.queryContractSmart.query(
      REGISTRY_CONTRACT, 
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return {};
  }
}

async function Config(client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      config: {}
    };
    let query = await client.queryClient.wasm.queryContractSmart.query(
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
  Client, 
  ResolveRecord,
  RecordExpiration,
  Config
}