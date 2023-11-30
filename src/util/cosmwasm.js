import { SigningArchwayClient } from '@archwayhq/arch3.js';
import { MainnetInfo } from '../chains/mainnet';
import { ConstantineInfo } from '../chains/testnet.constantine';

const Testnet = ConstantineInfo;
const Mainnet = MainnetInfo;
const IsTestnet = (/true/).test(process.env.VUE_APP_IS_TESTNET);

const Blockchain = (IsTestnet) ? Testnet : Mainnet;

let client = {
  offlineSigner: null,
  wasmClient: null,
  accountData: null,
  chainInfo: Blockchain,
  fees: "auto"
};

async function cosmostationClient() {
  if (!window) return {};
  if (!window['cosmostation']) return {};

  // User must authorize "experimental" chain
  await window.cosmostation.providers.keplr.experimentalSuggestChain(Blockchain);
  await window.cosmostation.providers.keplr.enable(Blockchain.chainId);

  // Default options
  window.cosmostation.providers.keplr.defaultOptions = {
    sign: {
      preferNoSetFee: true,
    }
  };

  // Bootstrap client
  client.offlineSigner = await window.cosmostation.providers.keplr.getOfflineSignerAuto(Blockchain.chainId);
  client.wasmClient = await SigningArchwayClient.connectWithSigner(
    Blockchain.rpc, 
    client.offlineSigner,
    { gasAdjustment: 1.4 }
  );
  client.accountData = await window.cosmostation.providers.keplr.getKey(Blockchain.chainId);

  return client;
}

async function keplrClient() {
  if (!window) return {};
  if (!window['keplr']) return {};

  // User must authorize "experimental" chain
  await window.keplr.experimentalSuggestChain(Blockchain);
  await window.keplr.enable(Blockchain.chainId);
  
  // Default options
  window.keplr.defaultOptions = {
    sign: {
      preferNoSetFee: true,
    }
  };
  
  // Bootstrap client
  client.offlineSigner = await window.getOfflineSignerAuto(Blockchain.chainId);
  client.wasmClient = await SigningArchwayClient.connectWithSigner(
    Blockchain.rpc, 
    client.offlineSigner,
    { gasAdjustment: 1.4 }
  );
  client.accountData = await window.keplr.getKey(Blockchain.chainId);

  return client;
}

async function leapClient() {
  if (!window) return {};
  if (!window['leap']) return {};

  let chainData = Blockchain;
  chainData.coinType = 118;
  chainData.bip44 = {
    coinType: 118
  };

  // User must authorize "experimental" chain
  await window.leap.experimentalSuggestChain(chainData);
  await window.leap.enable(Blockchain.chainId);
  
  // Default options
  window.leap.defaultOptions = {
    sign: {
      preferNoSetFee: true,
    }
  };
  
  // Bootstrap client
  client.offlineSigner = await window.leap.getOfflineSignerAuto(Blockchain.chainId);
  client.wasmClient = await SigningArchwayClient.connectWithSigner(
    Blockchain.rpc, 
    client.offlineSigner,
    { gasAdjustment: 1.4 }
  );
  client.accountData = await window.leap.getKey(Blockchain.chainId);

  return client;
}

async function offlineClient() {
  const Blockchain = (IsTestnet) ? Testnet : Mainnet;
  let cwClient = await SigningArchwayClient.connectWithSigner(Blockchain.rpc, null);
  let offlineClient = {
    offlineSigner: null,
    wasmClient: cwClient,
    chainInfo: Blockchain,
    readOnly: true
  };

  return offlineClient;
}

export {
  cosmostationClient,
  keplrClient,
  leapClient,
  offlineClient,
  IsTestnet
};