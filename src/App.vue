<template>
  <div class="loggedout" v-if="!connected">
    <button id="connect_modal" class="btn-show-modal" @click="modal = !modal;">Connect Wallet</button>
  </div>
  <div class="loggedin" v-else>
    <router-view />
  </div>

  <transition name="modal" v-if="!connected">
    <div v-if="modal" class="modal-wrapper">
      <div class="modal">
        <div class="modal-header">
          <span class="close-x" @click="modal = !modal">&times;</span>
        </div>
        <div class="modal-body">
          <button 
            id="connect_keplr" 
            class="btn-connect btn-keplr" 
            @click="connectWallet('keplr');"
          >Keplr</button>
          <button 
            id="connect_cosmostation" 
            class="btn-connect btn-cosmostation" 
            @click="connectWallet('cosmostation');"
          >Cosmostation</button>
        </div>
      </div>
    </div>
  </transition>

</template>

<script>
import { Client, Accounts } from './util/client';

export default {
  name: 'archid-dapp',
  components: {},
  data: () => ({
    cwClient: null,
    accounts: [],
    connected: false,
    walletType: ['keplr', 'cosmostation'],
    modal: false,
  }),
  mounted: function () {
    if (window) {
      let connected = window.sessionStorage.getItem('connected');
      if (connected) this.connected = true;
    }
  },
  methods: {
    connectWallet: async function (wallet = "keplr") {
      if (this.walletType.indexOf(wallet) == -1) return;

      this.walletType = wallet;
      this.cwClient = await Client(this.walletType);
      this.accounts = await Accounts(this.cwClient);
      
      try {
        if (!this.accounts[0].address) return;
        this.connected = true;
        window.sessionStorage.setItem('connected', this.walletType);
      } catch(e) {
        console.error(e);
      }
      
      console.log('App', {cwClient: this.cwClient, accounts: this.accounts, walletType: this.walletType});
    }
  }
}
</script>

<style scoped>
.modal-wrapper {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0,0,0);
  background-color: rgba(0,0,0,0.4);
}

.modal {
  clear: both;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 450px;
  background: #ffffff;
  border-radius: 4px;
}

.close-x {
  float: right;
  cursor: pointer;
}

.btn-connect {
  margin: 1em;
}
</style>