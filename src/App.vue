<template>
  <div class="loggedout" v-if="!connected">
    <div class="logo">
      <span class="icon icon-archid">ArchID</span>
    </div>
    <div class="connect">
      <a id="connect_modal" class="btn btn-primary btn-show-modal" @click="modal = !modal;">Connect Wallet</a>
    </div>
  </div>
  <div class="loggedin" v-else>
    <div class="logo">
      <router-link class="home-logo" to="/" @click="route = '/';">
        <span class="icon icon-archid">ArchID</span>
      </router-link>
    </div>
    <div class="user" v-if="accounts.length">
      <a id="user_account" @click="showNav = !showNav;">{{ accountDisplayFormat(accounts[0].address) }}</a>
    </div>
    <ul class="navigation" v-if="showNav">
      <li>
        <router-link to="/" @click="route = '/';showNav = false;">Home</router-link>
      </li>
      <li>
        <router-link to="/test" @click="route = '/test';showNav = false;">Test Bench</router-link>
      </li>
      <li>
        <router-link to="/domains" @click="route = '/domains';showNav = false;">Domains</router-link>
      </li>
      <li>
        <router-link to="/my-domains" @click="route = '/my-domains';showNav = false;">My Domains</router-link>
      </li>
    </ul>
  </div>
  <div class="page-content" v-if="connected || route == '/'">
    <router-view test="test" :key="render" />
  </div>

  <transition name="modal" v-if="!connected">
    <div v-if="modal" class="modal-wrapper">
      <div class="modalt">
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
    showNav: false,
    render: 0,
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
      this.render += 1;
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
    accountDisplayFormat: function (account = null) {
      if (!account) return "";
      return account.slice(0,12) + "..." + account.slice(-5);
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
#connect_modal, #user_account {
  cursor: pointer;
  float: right;
}
.loggedout {
  clear: both;
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
.modalt {
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
.home-logo, .home-logo:active, .home-logo:focus {
  text-decoration: none;
}
</style>