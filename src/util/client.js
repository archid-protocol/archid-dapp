import { keplrClient } from './cosmwasm';

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

async function Accounts(client = null) {
  if (!client) client = await Client();
  // console.log('Accounts?', client);
  const accounts = await client.offlineSigner.getAccounts();
  return accounts;
}

export { Client, Accounts };