import { SigningArchwayClient } from '@archwayhq/arch3.js';
import { MainnetInfo } from '../chains/mainnet';
import { ConstantineInfo } from '../chains/testnet.constantine';

const Testnet = ConstantineInfo;
const Mainnet = MainnetInfo;
const IsTestnet = (/true/).test(process.env.VUE_APP_IS_TESTNET);

async function cosmostationClient() {
  if (!window) return {};
  if (!window['cosmostation']) return {};

  const Blockchain = (IsTestnet) ? Testnet : Mainnet;

  let client = {
    offlineSigner: null,
    wasmClient: null,
    chainInfo: Blockchain,
    fees: "auto"
  };

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

  return client;
}

async function keplrClient() {
  if (!window) return {};
  if (!window['keplr']) return {};

  let Blockchain = (IsTestnet) ? Testnet : Mainnet;

  // Legacy coinType values
  // XXX: This is deprecated and only temporary to support 
  // users who havn't updated to Keplr version 2.0
  Blockchain.coinType = 118;
  Blockchain.bip44 = {
    coinType: 118
  };

  let client = {
    offlineSigner: null,
    wasmClient: null,
    chainInfo: Blockchain,
    fees: "auto"
  };

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

  return client;
}

async function leapClient() {
  if (!window) return {};
  if (!window['leap']) return {};

  let Blockchain = (IsTestnet) ? Testnet : Mainnet;
  
  // Legacy coinType values
  Blockchain.coinType = 118;
  Blockchain.bip44 = {
    coinType: 118
  };

  let client = {
    offlineSigner: null,
    wasmClient: null,
    chainInfo: Blockchain,
    fees: "auto"
  };

  // User must authorize "experimental" chain
  await window.leap.experimentalSuggestChain(Blockchain);
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

  return client;
}

async function offlineClient() {
  const Blockchain = (IsTestnet) ? Testnet : Mainnet;
  let cwClient = await SigningArchwayClient.connectWithSigner(Blockchain.rpc, null);
  let client = {
    offlineSigner: null,
    wasmClient: cwClient,
    chainInfo: Blockchain,
    readOnly: true
  };
  return client;
}

export {
  cosmostationClient,
  keplrClient,
  leapClient,
  offlineClient,
  IsTestnet
};