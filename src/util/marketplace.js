import { coin } from "@cosmjs/stargate";
import { Client } from './client';
import { FromAtto } from "./denom";

const MARKETPLACE_CONTRACT = process.env.VUE_APP_MARKETPLACE_CONTRACT;

const SELL_OFFER = "Sale";
// const BUY_OFFER = "Offer";

// Queries

/**
 * List swaps (paginated)
 * @param {String} start? : (Optional) Start paginated request after this swap id. Default null
 * @param {Number} limit? : (Optional) Amount of swaps per paginated request. Default limit 10, maximum limit 30
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function List(start, limit, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      list: {}
    };
    if (start) entrypoint.list.start_after = start;
    if (limit) entrypoint.list.limit = limit;

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return {};
  }
}

/**
 * Get details of a specific swap
 * @param {String} id : Swap id to get details for
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function Details(id = null, client = null) {
  if (typeof id !== 'string') return;
  if (!client) client = await Client();
  try {
    let entrypoint = {
      details: {
        id: id
      }
    };

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    // console.error(e);
    return { error: e };
  }
}

/**
 * Get all swaps created by a specific address
 * @param {String} address : Swap creator to get listings for
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function SwapsOf(address = null, client = null) {
  if (typeof address !== 'string') return;
  if (!client) client = await Client();
  try {
    let entrypoint = {
      swaps_of: {
        address: address
      }
    };

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return { error: e };
  }
}

// Txs

/**
 * Create swap for ARCH
 * @param {String} id : An ID to be used to refer to this swap
 * @param {String} token_id : token_id (domain) to be sold in the swap
 * @param {Number} expiration : A timestamp (nanosecond precision) after which the swap is invalid
 * @param {Number} price : A price, in `aarch`, to be paid by the buyer
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 */
async function CreateNative(id, token_id, expiration, price, client = null) {
  if (!id || !token_id || !expiration || !price) return;
  if (!client) client = await Client();

  let cost = coin(String(price), client.chainInfo.currencies[0].coinMinimalDenom);

  try {
    // Msg.
    let entrypoint = {
      create: {
        id: id,
        payment_token: null,
        token_id: token_id,
        expires: {
          at_time: String(expiration)
        },
        price: cost.amount,
        swap_type: SELL_OFFER
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      MARKETPLACE_CONTRACT,
      entrypoint,
      client.fees,
      "List " + token_id + " for " + FromAtto(price, true) + " ARCH"
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
 * Finalize and consume swap for ARCH
 * @param {String} id : ID of swap to finalize
 * @param {Object} swap : (Optional) A swap details object; can be loaded from `Details` entry point
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 * @see Details
 */
async function FinishNative(id, swap, client = null) {
  if (!id) return;
  if (!swap) swap = await Details(id, client);
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      finish: {
        id: id,
        payment_token: null,
        token_id: swap.token_id,
        expires: swap.expires,
        price: swap.price,
        swap_type: SELL_OFFER
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Purchase cost
    let funds = [coin(String(swap.price), client.chainInfo.currencies[0].coinMinimalDenom)];
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      MARKETPLACE_CONTRACT,
      entrypoint,
      client.fees,
      "Swap " + swap.token_id + " for " + FromAtto(swap.price, true) + " ARCH",
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
 * Create swap for a cw20 token
 * @param {String} id : An ID to be used to refer to this swap
 * @param {String} token_id : token_id (domain) to be sold in the swap
 * @param {Number} expiration : A timestamp (nanosecond precision) after which the swap is invalid
 * @param {Number} price : A price, in `aarch`, to be paid by the buyer
 * @param {String} denom? : (Optional) denom of payment cw20; only used for memo
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 */
async function CreateCw20(id, cw20_contract, token_id, expiration, price, denom = '', client = null) {
  if (!id || !cw20_contract || !token_id || !expiration || !price) return;
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      create: {
        id: id,
        payment_token: cw20_contract,
        token_id: token_id,
        expires: {
          at_time: expiration
        },
        price: String(price),
        swap_type: SELL_OFFER
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      MARKETPLACE_CONTRACT,
      entrypoint,
      client.fees,
      "List " + token_id + " for " + FromAtto(price, true) + denom
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
 * Finalize and consume swap for cw20 tokens
 * @param {String} id : ID of swap to finalize
 * @param {Object} swap : (Optional) A swap details object; can be loaded from `Details` entry point
 * @param {String} denom? : (Optional) denom of payment cw20; only used for memo
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 * @see Details
 */
async function FinishCw20(id, swap, denom = '', client = null) {
  if (!id) return;
  if (!swap) swap = await Details(id, client);
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      finish: {
        id: id,
        payment_token: swap.payment_token,
        token_id: swap.token_id,
        expires: swap.expires,
        price: swap.price,
        swap_type: SELL_OFFER
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      MARKETPLACE_CONTRACT,
      entrypoint,
      client.fees,
      "Swap " + swap.token_id + " for " + swap.price + denom
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
 * Cancel a swap  by ID; must be swap creator
 * @param {String} id : ID of swap to be cancelled
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 * @see Details
 */
async function Cancel(id, client = null) {
  if (!id) return;
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      cancel: {
        id: id
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      MARKETPLACE_CONTRACT,
      entrypoint,
      client.fees,
      "Cancel swap"
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

// Exports

const Query = {
  List,
  Details,
  SwapsOf
};

const Execute = {
  CreateNative,
  CreateCw20,
  FinishNative,
  FinishCw20,
  Cancel
};

export { Query, Execute }