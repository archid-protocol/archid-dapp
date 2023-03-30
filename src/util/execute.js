import { coin } from "@cosmjs/stargate";
import { Client } from './client';

const REGISTRY_CONTRACT = process.env.VUE_APP_REGISTRY_CONTRACT;
const BASE_DOMAIN_COST = 50;

/**
 * Register a new domain tx
 * @param {String} name : Domain name to be registered
 * @param {Number} years : Number of years to be registered; an integer between 1 and 3, impacts cost
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 */
async function Register(name, years = 1, base_cost = BASE_DOMAIN_COST, client = null) {
  if (typeof name !== 'string' || typeof years !== 'number' || typeof base_cost !== 'number') return;
  if (!name.length || years <= 0) return;
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      register: {
        name: name
      }
    };
    console.log('Register entrypoint', entrypoint);
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Purchase cost
    let funds = [coin((base_cost * years), client.chainInfo.currencies[0].coinMinimalDenom)];
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      REGISTRY_CONTRACT,
      entrypoint,
      client.fees,
      "Registering domain",
      funds
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {};
  }
}

/**
 * Renew registration of a domain tx
 * @param {String} name : Registered domain name to be renewed
 * @param {Number} years : Number of years to be renewed for; an integer between 1 and 3, impacts cost
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 */
async function RenewRegistration(name, years = 1, base_cost = BASE_DOMAIN_COST, client = null) {
  if (typeof name !== 'string' || typeof years !== 'number' || typeof base_cost !== 'number') return;
  if (!name.length || years <= 0) return;
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      renew_registration: {
        name: name
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Purchase cost
    let funds = [coin((base_cost * years), client.chainInfo.currencies[0].coinMinimalDenom)];
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      REGISTRY_CONTRACT,
      entrypoint,
      client.fees,
      "Renewing domain registration",
      funds
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {};
  }
}

/**
 * Update resolver address of an entry tx
 * @param {String} name : Domain name to be updated
 * @param {String} new_resolver : An Addr type
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 */
async function UpdateResolver(name, new_resolver, client = null) {
  if (typeof name !== 'string' || typeof new_resolver !== 'string') return;
  if (!name.length || !new_resolver.length) return;
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      update_resolver: {
        name: name,
        new_resolver: new_resolver
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      REGISTRY_CONTRACT,
      entrypoint,
      client.fees,
      "Updating resolver"
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {};
  }
}

/**
 * Register a new sub-domain tx
 * @param {String} domain : Registered top level domain
 * @param {String} subdomain : Sub-domain to be registered
 * @param {String} new_resolver : An Addr type
 * @param {Boolean} mint : Mint, or do not mint, an NFT token containing sub-domain metadata
 * @param {Number} expiration : Unix timestamp after which resolution of the sub-domain is no longer enforceable
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 */
async function RegisterSubDomain(domain, subdomain, new_resolver, new_owner, mint, expiration, client = null) {
  if (typeof domain !== 'string' 
    || typeof subdomain !== 'string' 
    || typeof new_resolver !== 'string' 
    || typeof mint !== 'boolean' 
    || typeof expiration !== 'number'
  ) return;
  if (!domain.length || !subdomain.length || ! new_resolver.length || expiration < 0) return;
  if (!client) client = await Client();

  if (!new_owner) new_owner = new_resolver;

  try {
    // Msg.
    let entrypoint = {
      register_sub_domain: {
        domain: domain,
        subdomain: subdomain,
        new_resolver: new_resolver,
        new_owner: new_owner,
        mint: mint,
        expiration: expiration
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      REGISTRY_CONTRACT,
      entrypoint,
      client.fees,
      "Registering subdomain"
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {};
  }
}

/**
 * Update metadata tx;
 * Updates metadata of an owned domain.
 * @param {String} name : Domain name to be updated
 * @param {Object} metadata_update : New metadata object to be updated 
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 * @see MetaDataUpdateMsg (archid-registr/msg.rs)
 */
async function UpdataUserDomainData(name, metadata_update, client = null) {
  if (typeof name !== 'string' || typeof metadata_update !== 'object') return;
  if (!name.length) return;
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      updata_user_domain_data: { // XXX: @jjj sp. mistake in this entry point name ("updata") :)
        name: name,
        metadata_update: metadata_update
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      REGISTRY_CONTRACT,
      entrypoint,
      client.fees,
      "Updating user domain data"
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {};
  }
}

/**
 * Config update tx;
 * Updates the registry-resolver contract configuration. Can only be called by contract admin.
 * @param {Object} update_config 
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 */
async function UpdateConfig(update_config, client = null) {
  if (typeof update_config !== 'object') return;
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      update_config: {
        config: update_config
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      REGISTRY_CONTRACT,
      entrypoint,
      client.fees,
      "Updating config"
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {};
  }
}

/**
 * Withdraw contract funds tx;
 * Withdraw funds from contract balance. Can only be called by contract admin.
 * @param {Number} amount : Amount of funds to withdraw from contract balance
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 */
async function Withdraw(amount, client = null) {
  if (typeof amount !== 'number') return;
  if (amount <= 0) return;
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      withdraw: {
        amount: String(amount)
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      REGISTRY_CONTRACT,
      entrypoint,
      client.fees,
      "Withdrawing from contract"
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {};
  }
}

/**
 * Remove subdomain tx;
 * Permanently remove a registered sub-domain tx
 * @param {String} domain : Registered top level domain
 * @param {String} subdomain : Registered sub-domain to be revoked
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 */
async function RemoveSubDomain(domain, subdomain, client = null) {
  if (typeof domain !== 'string' || typeof subdomain !== 'string') return;
  if (!domain.length || !subdomain.length) return;
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      remove_sub_domain: {
        domain: domain,
        subdomain: subdomain
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      REGISTRY_CONTRACT,
      entrypoint,
      client.fees,
      "Removing subdomain"
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {};
  }
}

export {
  Register,
  RenewRegistration,
  UpdateResolver,
  RegisterSubDomain,
  UpdataUserDomainData,
  UpdateConfig,
  Withdraw,
  RemoveSubDomain
}