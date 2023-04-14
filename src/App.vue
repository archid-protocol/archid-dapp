<template>
  <div class="loggedout" v-if="!connected">
    <div class="logo">
      <span class="icon icon-archid"></span>
      <span class="brand-a">Arch</span>
      <span class="brand-b">ID</span>
    </div>
    <div class="connect user">
      <a id="connect_modal" class="btn btn-primary btn-show-modal pointer" @click="modal = !modal;">Connect Wallet</a>
    </div>
  </div>
  <div class="loggedin" v-else>
    <div class="logo">
      <router-link to="/" @click="route = '/'; showNav = false;">
        <span class="icon icon-archid"></span>
        <span class="brand-a">Arch</span>
        <span class="brand-b">ID</span>
      </router-link>
    </div>
    <div class="connect user" v-if="accounts.length">
      <a id="user_account">
        <div class="menu-target main row">
          <div class="col">
            <span class="balance">{{ formatFromMicro(accounts[0].balance.amount) }}</span>
            <span class="icon icon-denom"></span>
          </div>
          <div class="col">
            <span class="address">{{ accountDisplayFormat(accounts[0].address) }}</span>
          </div>
          <div class="col">
            <span :class="{'caret-inv': true, 'active': true}" v-if="!showNav" @click="showNav = !showNav;">&caron;</span>
            <span class="close-x menu" v-if="showNav" @click="showNav = !showNav;">&times;</span>
          </div>
        </div>  
      </a>
    </div>
    <ul class="navigation" v-if="showNav">
      <li>
        <router-link to="/" @click="route = '/';showNav = false;">Home</router-link>
      </li>
      <li>
        <router-link to="/domains" @click="route = '/domains';showNav = false;">Domains</router-link>
      </li>
      <li>
        <router-link to="/my-domains" @click="route = '/my-domains';showNav = false;">My Domains</router-link>
      </li>
    </ul>
  </div>
  <div class="page-content">
    <router-view :key="render" />
  </div>
  <div class="no-auth row" v-if="!connected">
    <h3>Connect your wallet to view data on this page.</h3>
  </div>
  <div class="footer-content">
    <Footer />
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
import { FromMicro } from './util/denom';

import Footer from './components/children/Footer.vue';

export default {
  name: 'archid-dapp',
  components: { Footer },
  data: () => ({
    cwClient: null,
    accounts: [],
    connected: false,
    walletType: ['keplr', 'cosmostation'],
    modal: false,
    route: null,
    showNav: false,
    render: 0,
    formatFromMicro: FromMicro,
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
          console.log('App', {cwClient: this.cwClient, accounts: this.accounts, walletType: walletType});
        }, 100);
      } catch (e) {
        await this.resumeConnectedState((attempts + 1));
      }
    },
    accountDisplayFormat: function (account = null) {
      if (!account) return "";
      return account.slice(0,12) + "..." + account.slice(-5);
    }
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
li a {
  text-decoration: none;
}
li a:hover {
  opacity: 0.75;
}
#connect_modal {
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
.btn-show-modal, .btn-show-modal:hover, .btn-show-modal:active, .btn-show-modal:focus {
  background-color: transparent;
  border-color: transparent;
}
.btn-connect {
  margin: 1em;
}
.home-logo, .home-logo:active, .home-logo:focus {
  text-decoration: none;
}
div.logo, div.logo a {
  text-decoration: none;
}
.brand-a, .brand-b {  
  width: 64px;
  height: 22px;
  font-style: normal;
  font-weight: 500;
  font-size: 22px;
  line-height: 100%;
  letter-spacing: -0.07em;
  color: #FFFFFF;
}
.brand-b {
  opacity: 0.75;
}
.menu-target.main {
  clear: both;
  display: inline-block;
}
#user_account {
  color: #ffffff;
}
span.address {
  font-weight: 400;
  /* font-size: 12px; */
  font-size: 14px;
  line-height: 120%;
  align-items: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  margin-right: 20px;
}
.caret-inv {
  float: right;
}
.caret-inv, .close-x.menu  {
  top: -25px;
  position: relative;
}
.icon-denom {
  margin-left: 3px;
  margin-right: -5px;
}
.no-auth {
  text-align: center;
  margin-top: 2em;
  margin-bottom: 2em;
}
</style>