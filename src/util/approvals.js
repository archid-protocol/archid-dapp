import { Client } from './client';

const MARKETPLACE_CONTRACT = process.env.VUE_APP_MARKETPLACE_CONTRACT;
const CW721_CONTRACT = process.env.VUE_APP_CW721_CONTRACT;

// Queries

/**
 * 
 * @param {String} token_id : Token to list approvals of
 * @param {Boolean} include_expired : Include expired approvals in query result, or don't
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult}
 */
async function ApprovalsCw721(token_id, include_expired = false, client = null) {
  if (!token_id || typeof include_expired !== 'boolean') return;
  try {
    let entrypoint = {
      approvals: {
        token_id: token_id,
        include_expired: include_expired
      }
    };
    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      CW721_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return {};
  }
}

// Txs

/**
 * Allow swap contract admin over a specified amount of some cw20 token
 * @param {Number} amount : Amount of cw20 tokens swap contract can transfer
 * @param {String} cw20_contract : Contract address of the cw20 token
 * @param {String} denom? : (Optional) denom of cw20; only used for memo
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 */
async function ApproveCw20(amount, cw20_contract, denom, client = null) {
  if (!amount || !cw20_contract) return;
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      increase_allowance: {
        spender: MARKETPLACE_CONTRACT,
        amount: String(amount),
        expires: null
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      cw20_contract,
      entrypoint,
      client.fees,
      "Approve ArchID to spend " + amount + denom
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
 * Allow swap contract admin over a cw721 token (domain)
 * @param {String} token_id : `token_id` (domain) the swap contract will be allowed to transfer
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult}
 */
async function ApproveCw721(token_id, client = null) {
  if (!token_id) return;
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      approve: {
        spender: MARKETPLACE_CONTRACT,
        token_id: token_id,
        expires: null
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      CW721_CONTRACT,
      entrypoint,
      client.fees,
      "Approving ArchID to transfer " + token_id
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

export {
  ApproveCw20,
  ApprovalsCw721,
  ApproveCw721
}