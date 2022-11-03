import { Client } from './client';

const REGISTRY_CONTRACT = process.env.VUE_APP_REGISTRY_CONTRACT;

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
    console.log('query?', query);
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

async function Config(client = null) {
  if (!client) client = await Client();
  console.log('REGISTRY_CONTRACT?', REGISTRY_CONTRACT);
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