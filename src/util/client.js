import { keplrClient, cosmoStation } from './cosmwasm';

/**
 * Gets signing client instance
 * @param {String} wallet : Supported wallet values are; 'keplr', 'falcon'
 * @returns {SigningCosmWasmClient}
 */
 async function Client(wallet = 'keplr') {
  let client;
  switch (wallet) {
    case 'cosmostation': {
      client = await cosmoStation();
      return client;
    }
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
  let accounts = await client.offlineSigner.getAccounts();
  if (!accounts.length) return accounts;

  for (let i = 0; i < accounts.length; i++) {
    accounts[i].balance = await client.wasmClient.getBalance(
      accounts[i].address, 
      client.chainInfo.currencies[0].coinMinimalDenom
    );
  }

  return accounts;
}

export { Client, Accounts };