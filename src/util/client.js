import { 
  leapClient, 
  keplrClient, 
  cosmostationClient, 
  offlineClient, 
  nomosClient,
  metamaskClient
} from './cosmwasm';

/**
 * Gets signing client instance
 * @param {String} wallet : Supported wallet values are; 'keplr', 'leap', 'cosmostation', 'offline'
 * @returns {SigningCosmWasmClient}
 */
 async function Client(wallet = 'keplr') {
  let client;
  switch (wallet) {
    case 'cosmostation': {
      client = await cosmostationClient();
      break;
    }
    case 'keplr': {
      client = await keplrClient();
      break;
    }
    case 'leap': {
      client = await leapClient();
      break;
    }
    case 'nomos': {
      client = await nomosClient();
      break;
    }
    case 'metamask': {
      client = await metamaskClient();
      break;
    }
    case 'offline': {
      client = await offlineClient();
      break;
    }
  }
  return client;
}

async function Accounts(client = null) {
  if (!client) client = await Client();
  let accounts = (client['offlineSigner']) ? await client.offlineSigner.getAccounts() : [];
  if (!accounts.length) return accounts;

  for (let i = 0; i < accounts.length; i++) {
    accounts[i].balance = await client.wasmClient.getBalance(
      accounts[i].address, 
      client.chainInfo.currencies[0].coinMinimalDenom
    );
  }

  // Regular accounts
  if (!client.nomosClient) return accounts;

  // Nomos accounts
  let account = await client.offlineSigner.getAccount("");
  let balance = await client.wasmClient.getBalance(
    account.address,
    client.chainInfo.currencies[0].coinMinimalDenom
  );
  account.balance = balance;
  let nomosAccounts = [account];
  return nomosAccounts;
}

export { Client, Accounts };