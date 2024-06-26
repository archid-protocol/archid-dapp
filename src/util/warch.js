import { coin } from "@cosmjs/stargate";
import { Client } from './client';
import { FromAtto } from "./denom";

const WRAP_CONTRACT = process.env.VUE_APP_WARCH_CONTRACT;


// Queries

/**
 * Get the allowance for a specific spender address approved by the owner (e.g. how many 
 * wARCH from the owner's balance that can be spent by the marketplace for an Offer swap)
 * @param {String} owner : cw20 owner to fetch spender allowance for
 * @param {String} spender : Address of spender to fetch allowance for (e.g. MARKETPLACE_CONTRACT)
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function Allowance(owner = null, spender = null, client = null) {
  if (typeof owner !== 'string' || typeof spender !== 'string') return;
  if (!client) client = await Client();
  try {
    let entrypoint = {
      allowance: { owner, spender}
    };

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      WRAP_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    // console.error(e);
    return { error: e };
  }
}

/**
 * Get an array of all allowances approved by the owner
 * @param {String} owner : cw20 owner to fetch spender all allowances for
 * @param {String} start_after? : Optional `spender` value to start after for pagination
 * @param {Number} limit? : Optional paging size for pagination
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function AllAllowances(owner = null, start = null, limit = null, client = null) {
  if (typeof owner !== 'string') return;
  if (!client) client = await Client();
  try {
    let entrypoint = {
      all_allowances: { owner }
    };

    if (start) entrypoint.all_allowances.start_after = start;
    if (limit) entrypoint.all_allowances.limit = limit;

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      WRAP_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    // console.error(e);
    return { error: e };
  }
}

/**
 * Get the wARCH balance of an Archway address
 * @param {String} address : Address to fetch wARCH balance for
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function Balance(address = null, client = null) {
  if (typeof address !== 'string') return;
  if (!client) client = await Client();
  try {
    let entrypoint = {
      balance: { address }
    };

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      WRAP_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    // console.error(e);
    return { error: e };
  }
}

const Query = {
  Allowance,
  AllAllowances,
  Balance
};

// Txs

/**
 * Deposit coins into WRAP_CONTRACT and receive an equivalent amount of wARCH
 * @param {Number} amount : Denomination of coins in `aarch` to be wrapped
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 */
async function Deposit(amount, client = null) {
  if (!amount) return;
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      deposit: {}
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Coins to be wrapped
    let funds = [coin(String(amount), client.chainInfo.currencies[0].coinMinimalDenom)];
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      WRAP_CONTRACT,
      entrypoint,
      client.fees,
      "Wrap " + FromAtto(amount, true) + " ARCH into wARCH",
      funds
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {
      error: String(e)
    };
  }
}

/**
 * Withdraw previously deposited coins from WRAP_CONTRACT
 * @param {Number} amount : Denomination of coins in `aarch` to be unwrapped
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 */
async function Withdraw(amount, client = null) {
  if (!amount) return;
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      withdraw: { amount }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      WRAP_CONTRACT,
      entrypoint,
      client.fees,
      "Unwrap " + FromAtto(amount, true) + " wARCH into ARCH",
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {
      error: String(e)
    };
  }
}

const Execute = {
  Deposit,
  Withdraw
};

// Export
export { Query, Execute }