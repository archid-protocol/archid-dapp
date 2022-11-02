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

export { Client };