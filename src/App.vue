<template>
  <div class="loggedout" v-if="!connected">
    <div class="logo">
      <router-link to="/" @click="route = '/'; showNav = false;">
        <span class="icon icon-archid"></span>
        <span class="brand-a">Arch</span>
        <span class="brand-b">ID</span>
      </router-link>
    </div>
    <div class="connect user">
      <a id="connect_modal" class="btn btn-primary btn-show-modal pointer" @click="modal = !modal;">Connect Wallet</a>
      <div class="col disconnected">
        <span :class="{'caret-inv': true, 'active': true}" v-if="!showNav" @click="showNav = !showNav;">&caron;</span>
        <span class="close-x menu" v-if="showNav" @click="showNav = !showNav;">&times;</span>
      </div>
    </div>
    <ul class="navigation" v-if="showNav">
      <li>
        <router-link to="/" @click="route = '/';showNav = false;">Home</router-link>
      </li>
      <li>
        <router-link to="/domains" @click="route = '/domains';showNav = false;">All Domains</router-link>
      </li>
    </ul>
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
            <span class="balance">{{ formatFromAtto(accounts[0].balance.amount) }}</span>
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
        <router-link to="/domains" @click="route = '/domains';showNav = false;">All Domains</router-link>
      </li>
      <li>
        <router-link to="/my-domains" @click="route = '/my-domains';showNav = false;">My Domains</router-link>
      </li>
      <li>
        <div class="pointer disconnect" @click="disconnectWallet();">Logout</div>
      </li>
    </ul>
  </div>

  <!-- Page Content -->
  <div class="page-content">
    <router-view :key="render" />
  </div>
  <div class="footer-content">
    <Footer />
  </div>

  <transition name="modal" v-if="!connected">
    <div v-if="modal" class="modal-wrapper">
      <div class="modalr">
        <div class="modal-header t">
          <span class="close-x" @click="modal = !modal">&times;</span>
        </div>
        <div class="modal-body">
          <div class="wallet-choice" v-if="!connecting">
            <p class="title">Choose a wallet to connect</p>
            <p class="subtitle">Select from the supported wallets to get started.</p>
            <ul class="wallet-connect row">
              <li 
                id="connect_keplr" 
                class="btn-connect btn-keplr" 
                @click="connectWallet('keplr');"
                v-if="!archx"
              ><span class="icon icon-keplr"></span>Keplr</li>
              <li 
                id="connect_keplr" 
                class="btn-connect btn-archx" 
                @click="connectWallet('keplr');"
                v-if="archx"
              ><span class="icon icon-archx"></span>ArchX</li>
              <li 
                id="connect_cosmostation" 
                class="btn-connect btn-cosmostation" 
                @click="connectWallet('cosmostation');"
              ><span class="icon icon-cosmostation"></span>Cosmostation</li>
              <li 
                id="connect_leap" 
                class="btn-connect btn-leap" 
                @click="connectWallet('leap');"
              ><span class="icon icon-leap"></span>Leap</li>
            </ul>
          </div>
          <div v-if="connecting">
            <ul class="wallet-connect row">
              <li 
                id="connect_keplr" 
                class="btn-connect btn-keplr" 
                v-if="walletType == walletTypes[0] && !archx"
              ><span class="icon icon-keplr"></span>Keplr</li>
              <li 
                id="connect_archx" 
                class="btn-connect btn-archx" 
                v-if="walletType == walletTypes[0] && archx"
              ><span class="icon icon-archx"></span>ArchX</li>
              <li 
                id="connect_cosmostation" 
                class="btn-connect btn-cosmostation" 
                v-if="walletType == walletTypes[1]"
              ><span class="icon icon-cosmostation"></span>Cosmostation</li>
              <li 
                id="connect_leap" 
                class="btn-connect btn-leap" 
                v-if="walletType == walletTypes[2]"
              ><span class="icon icon-leap"></span>Leap</li>
            </ul>
            <div class="loading default"></div>
            <div class="cancel reset">
              <p class="cancel" @click="connectCancel();">Cancel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <Notification
    v-bind:type="notify.type"
    v-bind:title="notify.title"
    v-bind:msg="notify.msg"
    v-bind:img="notify.img"
    v-if="notify.type"
    @closeNotification="closeNotification"
  >
  </Notification>

</template>

<script>
import { Client, Accounts } from './util/client';
import { FromAtto } from './util/denom';

import Notification from './components/children/Notification.vue';
import Footer from './components/children/Footer.vue';

const WALLET_DOWNLOADS = {
  keplr: 'https://www.keplr.app/download',
  cosmostation: 'https://cosmostation.io/wallet',
  leap: 'https://www.leapwallet.io/cosmos'
};

export default {
  name: 'ArchID',
  components: { Notification, Footer },
  data: () => ({
    cwClient: null,
    accounts: [],
    connected: false,
    connecting: false,
    walletTypes: ['keplr', 'cosmostation', 'leap'],
    walletType: null,
    archx: false,
    modal: false,
    route: null,
    showNav: false,
    render: 0,
    notify: {
      type: null,
      title: null,
      msg: null,
      img: null,
    },
    formatFromAtto: FromAtto,
  }),
  mounted: async function () {
    if (window) {
      this.route = location.pathname;
      let connected = window.sessionStorage.getItem('connected');
      if (window.archx) this.archx = true;
      if (connected) {
        this.resumeConnectedState();
        this.connected = true;
      }
    }
  },
  methods: {
    connectWallet: async function (wallet = "keplr") {
      if (this.walletTypes.indexOf(wallet) == -1) return;

      this.connecting = true;
      this.walletType = wallet;

      try {
        this.cwClient = await Client(this.walletType);
        this.accounts = await Accounts(this.cwClient);
        if (!this.accounts[0].address) return;
        this.connected = true;
        this.connecting = false;
        window.sessionStorage.setItem('connected', this.walletType);
      } catch(e) {
        this.connected = false;
        this.connecting = false;
        this.modal = false;
        // Error notification
        this.notify = {
          type: "error",
          title: "Something went wrong",
          msg: 'Error connecting to ' + this.ucFirst(this.walletType) + ' wallet.<br/><p class="descr offset"><a href="'+ WALLET_DOWNLOADS[this.walletType] +'" target="_blank">Download '+ this.ucFirst(this.walletType) +'</a></p>',
          img: null,
        };
        console.error(e);
      }
      this.render += 1;
      // console.log('App', {cwClient: this.cwClient, accounts: this.accounts, walletType: this.walletType});
    },
    resumeConnectedState: async function (attempts = 0) {
      if (attempts >= 5) {
        this.cwClient = await Client('offline');
        return;
      }
      try {
        setTimeout(async () => { 
          let walletType = sessionStorage.getItem("connected");
          this.cwClient = await Client(walletType);
          this.accounts = await Accounts(this.cwClient);
          // console.log('App', {cwClient: this.cwClient, accounts: this.accounts, walletType: walletType});
        }, 100);
      } catch (e) {
        await this.resumeConnectedState((attempts + 1));
      }
    },
    connectHandler: function () {
      window.scrollTo(0, 0);
      const connectEl = document.getElementById('connect_modal');
      connectEl.click();
    },
    connectCancel: function () {
      this.connected = false;
      this.connecting = false;
    },
    disconnectWallet: async function () {
      sessionStorage.removeItem("connected");
      window.location.reload();
    },
    closeNotification: function () {
      this.notify = {
        type: null,
        title: null,
        msg: null,
        img: null,
      };
    },
    resolveUpdates: async function () {
      try {
        let accounts = await Accounts(this.cwClient);
        if (!accounts[0].address) return;
        this.accounts = accounts;
      } catch(e) {
        console.error('Error resolving wallet balance', e);
      }
    },
    accountDisplayFormat: function (account = null) {
      if (!account) return "";
      return account.slice(0,12) + "..." + account.slice(-5);
    },
    ucFirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
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
li a:hover, .wallet-connect li:hover, li .disconnect:hover {
  opacity: 0.75;
}
#connect_modal {
  float: right;
}
.loggedout {
  clear: both;
}
.modal-header.t {
  border: none;
  display: block;
}
.close-x {
  float: right;
}
.btn-show-modal, .btn-show-modal:hover, .btn-show-modal:active, .btn-show-modal:focus {
  background-color: transparent;
  border-color: transparent;
}
.btn-connect {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  margin-right: 1em;
  margin-left: 1em;
  cursor: pointer;
  color: #000000;
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
.caret-inv, .close-x.menu {
  top: -25px;
  position: relative;
}
.col.disconnected span {
  color: white;
  top: 7px;
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
.wallet-choice .title {
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  align-items: center;
  letter-spacing: -0.01em;
}
.wallet-choice .subtitle {
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  align-items: center;
  letter-spacing: -0.01em;
  color: #666666;
}
.wallet-connect {
  padding: 0;
}
.wallet-connect li {
  display: inline-block;
  padding: 16px;
  gap: 8px;
  background: #FFFFFF;
  box-shadow: 0px 15px 54px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  max-width: 90%;
}
.loading.default {
  margin-top: 1.75em;
  margin-bottom: 1.75em;
}
div.cancel.reset {
  padding: 1em;
  border-top: 1px solid #F2EFED;
  margin-top: 1.5em;
}
.cancel p.cancel {
  padding-top: 1em;
  cursor: pointer;
  text-align: center;
  color: #FF4D00;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
}
</style>