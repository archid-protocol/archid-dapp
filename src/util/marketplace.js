import { coin } from "@cosmjs/stargate";
import { Client } from './client';
import { FromAtto } from "./denom";

const MARKETPLACE_CONTRACT = process.env.VUE_APP_MARKETPLACE_CONTRACT;

const SALE = "Sale";
const OFFER = "Offer";

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
 * @param {String} type : Swap type; must be either "Sale" or "Offer"
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function SwapsOf(
  address = null, 
  type = SALE,
  page = 0, 
  limit = 10, 
  client = null
) {
  if (typeof address !== 'string') return;
  if (typeof type !== SALE && typeof type !== OFFER) type = SALE;
  if (!client) client = await Client();
  try {
    let entrypoint = {
      swaps_of: {
        address: address,
        swap_type: type,
        page: page,
        limit: limit
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

/**
 * Count the total number of swaps for a `SwapType` ('Sale' / 'Offer')
 * @param {String} type : Either SALE ('Sale') or OFFER ('Offer')
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function GetTotal(type = SALE, client = null) {
  if (type !== SALE && type !== OFFER) type = SALE;
  if (!client) client = await Client();
  try {
    let entrypoint = {
      get_total: {
        swap_type: type
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

/**
 * Fetch all swaps of type `SwapType::Offer`
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function GetOffers(page = 0, limit = 10, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      get_offers: {
        page: page,
        limit: limit
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

/**
 * Fetch all swaps of type `SwapType::Sale`
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function GetListings(page = 0, limit = 10, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      get_listings: {
        page: page,
        limit: limit
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

/**
 * Fetch all swaps for a specific token ID. Can be filtered by swap type.
 * @param {String} token_id 
 * @param {String} type? : Optional filter to limit results by swap type; must be either "Sale" or "Offer" (or `null` to show all results)
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function ListingsOfToken(
  token_id = null, 
  type = null, 
  page = 0, 
  limit = 10, 
  client = null
) {
  if (typeof token_id !== 'string') return;
  if (!client) client = await Client();
  try {
    let entrypoint = {
      listings_of_token: {
        token_id: token_id,
        page: page,
        limit: limit
      }
    };
    if (type) entrypoint.listings_of_token.swap_type = type;

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

/**
 * Fetch all swaps within a given price range
 * @param {Number} min? : (Optional) Minimum price range, cannot be negative. Defaults to 0.
 * @param {Number} max? : (Optional) Maximum price range. Defaults to showing all swaps greater than `min`
 * @param {String} type : Swap type; must be either "Sale" or "Offer"
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function SwapsByPrice(
  min = null,
  max = null,
  type = SALE,
  page = 0, 
  limit = 10, 
  client = null
) {
  if (type !== SALE && type !== OFFER) type = SALE;
  if (typeof min !== 'number' && typeof min !== 'bigint') min = null;
  if (typeof max !== 'number' && typeof min !== 'bigint') max = null;
  if (!client) client = await Client();
  try {
    let entrypoint = {
      swaps_by_price: {
        swap_type: type,
        page: page,
        limit: limit
      }
    };
    if (min) entrypoint.swaps_by_price.min = String(min);
    if (max) entrypoint.swaps_by_price.max = String(max);

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

/**
 * Fetch all swaps for a given denom. 
 * Must provide `payment_token` (contract address) for cw20 swaps; 
 * Or, exclude `payment_token` to fetch swaps for native ARCH.
 * @param {String|Addr} payment_token? : (Optional) Cosmos address of the cw20 payment token, or `null` for native ARCH
 * @param {String} type : Swap type; must be either "Sale" or "Offer"
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function SwapsByDenom(
  payment_token = null,
  type = SALE,
  page = 0, 
  limit = 10, 
  client = null
) {
  if (!client) client = await Client();
  if (typeof payment_token !== 'string') payment_token = null;
  try {
    let entrypoint = {
      swaps_by_denom: {
        swap_type: type,
        page: page,
        limit: limit
      }
    };
    if (payment_token) entrypoint.swaps_by_denom.payment_token = payment_token;

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

/**
 * Fetch all swaps by payment type; either cw20 payments or native ARCH payments
 * @param {Boolean} cw20 : `true` to show all swaps for cw20 payments, `false` to show all swaps for native ARCH payments
 * @param {String} type : Swap type; must be either "Sale" or "Offer"
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function SwapsByPaymentType(
  cw20 = false, 
  type = SALE,
  page = 0, 
  limit = 10, 
  client = null
) {
  if (!client) client = await Client();
  if (typeof cw20 !== 'boolean') cw20 = false;
  try {
    let entrypoint = {
      swaps_by_payment_type: {
        cw20: cw20,
        swap_type: type,
        page: page,
        limit: limit
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

const Query = {
  List,
  Details,
  SwapsOf,
  GetTotal,
  GetOffers,
  GetListings,
  ListingsOfToken,
  SwapsByPrice,
  SwapsByDenom,
  SwapsByPaymentType
};

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
        swap_type: SALE
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
        swap_type: SALE
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
        swap_type: SALE
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
        swap_type: SALE
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

/**
 * 
 * @param {String} id 
 * @param {Number} expires 
 * @param {*} price 
 * @param {*} client 
 * @returns 
 */
async function Update(id, expiration, price, client = null) {
  if (!id || !price || !expiration) return { error: "Invalid Update parameters" };
  if (!client) client = await Client();

  let cost = coin(String(price), client.chainInfo.currencies[0].coinMinimalDenom);

  try {
    // Msg.
    let entrypoint = {
      update: {
        id: id,
        expires: {
          at_time: String(expiration)
        },
        price: cost.amount,
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
      "Update swap"
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
  CreateNative,
  CreateCw20,
  FinishNative,
  FinishCw20,
  Cancel,
  Update,
};

// Export
export { Query, Execute }