import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { ConstantineInfo } from '../chains/testnet.constantine';

const Testnet = ConstantineInfo;
const Mainnet = null;
const IsTestnet = true;

async function keplrClient() {
  if (!window) return {};
  if (!window['keplr']) return {};

  const Blockchain = (IsTestnet) ? Testnet : Mainnet;

  let client = {
    offlineSigner: null,
    wasmClient: null
  };

  // User must authorize "experimental" chain
  await window.keplr.experimentalSuggestChain(Blockchain);
  await window.keplr.enable(Blockchain.chainId);
  
  // Bootstrap client
  client.offlineSigner = await window.getOfflineSigner(Blockchain.chainId);
  client.wasmClient = await SigningCosmWasmClient.connectWithSigner(Blockchain.rpc, client.offlineSigner);
  client.chainInfo = Blockchain;

  return client;
}

export {
  keplrClient
};