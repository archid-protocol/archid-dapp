<template>
  <div class="loggedout" v-if="!connected">
    <button id="connect_modal" class="btn-show-modal" @click="modal = !modal;">Connect Wallet</button>
  </div>
  <div class="loggedin" v-else>
    <div class="user" v-if="accounts.length">{{ accounts[0].address }}</div>
    <ul class="navigation">
      <li v-if="route !== '/'">
        <router-link to="/" @click="route = '/';">Home</router-link>
      </li>
      <li v-if="route !== '/test'">
        <router-link to="/test" @click="route = '/test';">Test Bench</router-link>
      </li>
      <li v-if="route !== '/domains'">
        <router-link to="/domains" @click="route = '/domains';">Domains</router-link>
      </li>
      <li v-if="route !== '/my-domains'">
        <router-link to="/my-domains" @click="route = '/my-domains';">My Domains</router-link>
      </li>
    </ul>
  </div>
  <div class="page-content" v-if="connected || route == '/'">
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
    route: null,
  }),
  mounted: function () {
    if (window) {
      this.route = location.pathname;
      let connected = window.sessionStorage.getItem('connected');
      if (connected) {
        this.resumeConnectedState();
        this.connected = true;
      }
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
    },
    resumeConnectedState: async function (attempts = 0) {
      if (attempts >= 5) return;
      try {
        setTimeout(async () => { 
          let walletType = sessionStorage.getItem("connected");
          this.cwClient = await Client(walletType);
          this.accounts = await Accounts(this.cwClient);
          console.log('Home client', {cwClient: this.cwClient, accounts: this.accounts, walletType: walletType});
        }, 100);
      } catch (e) {
        await this.resumeConnectedState((attempts + 1));
      }
    },
  }
}
</script>

<style scoped>
ul, ul li {
  list-style: none;
}
ul li {
  padding: 1em;
}
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