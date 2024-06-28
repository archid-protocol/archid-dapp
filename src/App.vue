<template>
  <div class="loggedout" v-if="!connected">
    <div class="logo col">
      <router-link to="/" @click="route = '/'; showNav = false;">
        <span class="icon icon-archid"></span>
        <span class="brand-a">Arch</span>
        <span class="brand-b">ID</span>
      </router-link>
    </div>
    <div class="middle nav quick-nav col">
      <div>
        <router-link 
          to="/domains" 
          type="button" 
          :class="{'btn': true, 'btn-primary': route !== '/domains', 'btn-inverse': route == '/domains'}"
          @click="route = '/domains';showNav = false;"
        >All Domains</router-link>
        <router-link 
          to="/marketplace" 
          type="button" 
          :class="{'btn': true, 'btn-primary': route !== '/marketplace', 'btn-inverse': route == '/marketplace'}"
          @click="route = '/marketplace';showNav = false;"
        >Marketplace</router-link>
      </div>
    </div>
    <div class="connect user col disconnected">
      <a id="connect_modal" class="btn btn-primary btn-show-modal pointer" @click="modal = !modal;">Connect Wallet</a>
      <div class="col disconnected">
        <span class="menu mobile caret-inv" v-if="!showNav" @click="toggleNavigation();">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8H14" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 4H14" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12H14" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="close-x menu" v-if="showNav" @click="toggleNavigation();">&times;</span>
      </div>
    </div>
    <ul class="navigation" v-if="showNav">
      <li>
        <router-link to="/" @click="route = '/';showNav = false;">Home</router-link>
      </li>
      <li>
        <router-link to="/domains" @click="route = '/domains';showNav = false;">All Domains</router-link>
      </li>
      <li>
        <router-link to="/marketplace" @click="route = '/marketplace';showNav = false;">Marketplace</router-link>
      </li>
    </ul>
  </div>
  <div class="loggedin" v-else>
    <div class="logo col">
      <router-link to="/" @click="route = '/'; showNav = false;">
        <span class="icon icon-archid"></span>
        <span class="brand-a">Arch</span>
        <span class="brand-b">ID</span>
      </router-link>
    </div>
    <div class="middle nav quick-nav col">
      <div>
        <router-link 
          to="/domains" 
          type="button" 
          :class="{'btn': true, 'btn-primary': route !== '/domains', 'btn-inverse': route == '/domains'}"
          @click="route = '/domains';showNav = false;"
        >All Domains</router-link>
        <router-link 
          to="/marketplace" 
          type="button" 
          :class="{'btn': true, 'btn-primary': route !== '/marketplace', 'btn-inverse': route == '/marketplace'}"
          @click="route = '/marketplace';showNav = false;"
        >Marketplace</router-link>
      </div>
    </div>
    <div class="connect user col" v-if="accounts.length">
      <div class="user-wrapper row">
        <div 
          :class="{
            'balance': true, 
            'row': true,
            'active': warchNav,
          }"
        >
          <div class="col wallet-balance" :alt="formatFromAtto(accounts[0].balance.amount) + ' ARCH'" :title="formatFromAtto(accounts[0].balance.amount) + ' ARCH'">
            <span class="balance">{{ balanceDisplayFormat(accounts[0].balance.amount) }}</span>
            <span class="denom denom-arch">&nbsp;ARCH</span>
          </div>
          <div class="col warch-balance">
            <span class="balance" v-if="warch.balance">{{ balanceDisplayFormat(warch.balance) }}</span>
            <span class="denom denom-arch">&nbsp;wARCH</span>
            <button 
              :class="{
                'btn': true,
                'btn-warch-menu': true,
                'btn-primary': !warchNav, 
                'btn-inverse': warchNav,
                'active': warchNav,
              }"
              @click="toggleNavigation('warch');"
            >
              <span class="open-elipses menu warch" v-if="!warchNav">...</span>
              <span class="close-x menu warch" v-else>&times;</span>
            </button>
          </div>
        </div>
        <a id="user_account" :class="{'col':true, 'active': showNav}">
          <div class="menu-target main">
            <div class="account-name">
              <span class="account-name">{{ accountName }}</span>
            </div>
            <div class="account-address">
              <span class="address">{{ accountDisplayFormat(accounts[0].address) }}</span>
            </div>
          </div>
          <div class="col">
            <span class="menu mobile connected caret-inv connected" v-if="!showNav" @click="toggleNavigation();">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8H14" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 4H14" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12H14" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="close-x menu connected" v-if="showNav" @click="toggleNavigation();">&times;</span>
          </div>
        </a>
      </div>
    </div>
    <!-- wARCH Menu Navigation -->
    <ul class="navigation warch" v-if="warchNav">
      <li>
        <ul class="nav nav-pills wrap-unwrap">
          <li 
            role="presentation" 
            :class="{'active': warch.context == warch.contexts.wrap, 'wrap-pill': true}"
            @click="warch.context = warch.contexts.wrap"
          >Wrap</li>
          <li 
            role="presentation" 
            :class="{'active': warch.context == warch.contexts.unwrap, 'unwrap-pill': true}"
            @click="warch.context = warch.contexts.unwrap"
          >Unwrap</li>
        </ul>
      </li>
      <li class="warch-input-li">
        <div class="wrap-unwrap amount" v-if="accounts.length">
          <div class="wrap-input" v-if="accounts[0].balance.amount">
            <input 
              type="number"
              step="any"
              min="0"
              class="wrap-denom form-control"
              name="wrap"
              v-model="warch.txAmount"
            />
            <div class="denom wrap icon-display" v-if="warch.context == warch.contexts.wrap">
              <span class="icon icon-denom-alt"></span>&nbsp;<span class="denom denom-text">ARCH</span>
            </div>
            <div class="denom wrap icon-display" v-else>
              <span class="icon icon-denom-warch"></span>&nbsp;<span class="denom denom-text">wARCH</span>
            </div>
            <div class="warch-max">
              <button class="btn btn-inverse btn-max" @click="maxWarch();">Max</button>
            </div>
          </div>
        </div>
      </li>
      <li class="warch-explainer">
        <div class="drawer">
          <div class="head">
            <div class="left pointer" @click="warch.details = !warch.details">
              <p class="descr warch-descr">What is Wrapped ARCH?</p>
            </div>
            <div class="right pointer" @click="warch.details = !warch.details">
              <div :class="{'caret': true, 'caret-warch': true, 'active': warch.details}">&caron;</div>
            </div>
          </div>
          <div class="body" v-if="warch.details">
            <p class="descr warch-descr">wARCH is a tokenized version of ARCH, required for certain application uses.</p>
            <p class="descr warch-descr">You can wrap and unwrap ARCH at any time, and they have a 1:1 relation.</p>
            <p class="descr warch-descr">On ArchID, it is the token you will use to make offers on domains.</p>
          </div>
        </div>
      </li>
      <li class="warch-submitter">
        <button 
          :class="{
            'btn': true, 
            'btn-primary': true, 
            'wrap': warch.context == warch.contexts.wrap,
            'unwrap': warch.context == warch.contexts.unwrap
          }"
          :disabled="!validWarchParams"
          @click="executeWrapOrUnwrap();"
        >
          <span v-if="warch.context == warch.contexts.wrap">Wrap</span>
          <span v-else>Unwrap</span>
        </button>
      </li>
    </ul>
    <!-- Main Menu navigation -->
    <ul class="navigation connected" v-if="showNav">
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
        <router-link to="/marketplace" @click="route = '/marketplace';showNav = false;">Marketplace</router-link>
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
                v-if="!isIframe"
              >
                <span class="icon icon-keplr"></span>
                <span class="label label-keplr">Keplr</span>
              </li>
              <li 
                id="connect_cosmostation" 
                class="btn-connect btn-cosmostation" 
                @click="connectWallet('cosmostation');"
                v-if="!isIframe"
              >
                <span class="icon icon-cosmostation"></span>
                <span class="label label-cosmostation">Cosmostation</span>
              </li>
              <li 
                id="connect_leap" 
                class="btn-connect btn-leap" 
                @click="connectWallet('leap');"
                v-if="!isIframe"
              >
                <span class="icon icon-leap"></span>
                <span class="label label-leap">Leap</span>
              </li>
              <li 
                id="connect_nomos" 
                class="btn-connect btn-nomos" 
                @click="connectWallet('nomos');"
                v-if="isIframe"
              >
                <span class="icon icon-nomos"></span>
                <span class="label label-nomos">Nomos</span>
              </li>
              <li 
                id="connect_metamask" 
                class="btn-connect btn-metamask" 
                @click="connectWallet('metamask');"
                v-if="!isIframe"
              >
                <span class="icon icon-metamask"></span>
                <span class="label label-metamask">Metamask</span>
              </li>

            </ul>
          </div>
          <div v-if="connecting">
            <ul class="wallet-connect row">
              <li 
                id="connect_keplr" 
                class="btn-connect btn-keplr" 
                v-if="walletType == walletTypes[0]"
              >
                <span class="icon icon-keplr"></span>
                <span class="label label-keplr">Keplr</span>
              </li>
              <li 
                id="connect_cosmostation" 
                class="btn-connect btn-cosmostation" 
                v-if="walletType == walletTypes[1]"
              >
                <span class="icon icon-cosmostation"></span>
                <span class="label label-cosmostation">Cosmostation</span>
              </li>
              <li 
                id="connect_leap" 
                class="btn-connect btn-leap" 
                v-if="walletType == walletTypes[2]"
              >
                <span class="icon icon-leap"></span>
                <span class="label label-leap">Leap</span>
              </li>
              <li 
                id="connect_nomos" 
                class="btn-connect btn-nomos" 
                 v-if="walletType == walletTypes[3]"
              >
                <span class="icon icon-nomos"></span>
                <span class="label label-nomos">Nomos</span>
              </li>
              <li 
                id="connect_metamask" 
                class="btn-connect btn-metamask" 
                 v-if="walletType == walletTypes[4]"
              >
                <span class="icon icon-metamask"></span>
                <span class="label label-metamask">Metamask</span>
              </li>
            </ul>
            <div class="loading default"></div>
            <div class="cancel reset">
              <p class="cancel" @click="connectCancel();">Cancel</p>
            </div>
          </div>

          <!-- Ledger PSA -->
          <div class="warning warning-msg row" v-if="warning.display">
            <div class="col left">
              <span class="icon icon-warning-alt"></span>
            </div>
            <div class="col right">
              <p class="warning title" v-if="warning.title">{{ warning.title }}</p>
              <p class="warning msg" v-if="warning.body">{{ warning.body }}</p>
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
import * as WrappedArch from './util/warch';
import { FromAtto, ToAtto } from './util/denom';

import Notification from './components/children/Notification.vue';
import Footer from './components/children/Footer.vue';

const WALLET_DOWNLOADS = {
  keplr: 'https://www.keplr.app/download',
  cosmostation: 'https://cosmostation.io/wallet',
  leap: 'https://www.leapwallet.io/cosmos',
  nomos: 'https://nomos.ms',
};

const WRAP_CONTEXT = 0;
const UNWRAP_CONTEXT = 1;

export default {
  name: 'ArchID',
  components: { Notification, Footer },
  data: () => ({
    cwClient: null,
    accounts: [],
    warch: {
      balance: null,
      txAmount: 0,
      context: WRAP_CONTEXT,
      contexts: {
        wrap: WRAP_CONTEXT, 
        unwrap: UNWRAP_CONTEXT
      },
      details: false,
      executeResult: null,
    },
    accountName: null,
    connected: false,
    connecting: false,
    walletTypes: ['keplr', 'cosmostation', 'leap', 'nomos', 'metamask'],
    nomosTypes: ['keplr', 'cosmostation', 'leap'],
    walletType: null,
    modal: false,
    route: null,
    showNav: false,
    warchNav: false,
    render: 0,
    notify: {
      type: null,
      title: null,
      msg: null,
      img: null,
    },
    warning: {
      title: null,
      body: null,
      display: false,
    },
    formatFromAtto: FromAtto,
  }),
  mounted: async function () {
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
      if (this.walletTypes.indexOf(wallet) == -1) return;

      this.connecting = true;
      this.walletType = wallet;

      try {
        this.cwClient = await Client(this.walletType);
        this.accounts = await Accounts(this.cwClient);
        if (this.cwClient.accountData['name']) this.accountName = this.cwClient.accountData.name;
        if (!this.accounts[0].address) return;
        let warch = await WrappedArch.Query.Balance(
          this.accounts[0].address, 
          this.cwClient
        );
        this.warch.balance = (warch.balance) ? warch.balance : null;
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
    },
    resumeConnectedState: async function (attempts = 0) {
      if (attempts >= 5) {
        this.cwClient = await Client('offline');
        return;
      }
      try {
        setTimeout(async () => { 
          let walletType = sessionStorage.getItem("connected"), warch;
          this.cwClient = await Client(walletType);
          this.accounts = await Accounts(this.cwClient);
          if (this.cwClient.accountData['name']) this.accountName = this.cwClient.accountData.name;
          if (this.accounts.length) warch = await WrappedArch.Query.Balance(
            this.accounts[0].address, 
            this.cwClient
          );
          this.warch.balance = (warch.balance) ? warch.balance : null;
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
        let warch = await WrappedArch.Query.Balance(
          this.accounts[0].address, 
          this.cwClient
        );
        this.warch.balance = (warch.balance) ? warch.balance : null;
      } catch(e) {
        console.error('Error resolving wallet balance', e);
      }
    },
    balanceDisplayFormat: function (balance = null) {
      if (!balance) return "";
      let archBalance = FromAtto(balance);
      if (archBalance < 1) return archBalance;
      return archBalance.toLocaleString("en");
    },
    accountDisplayFormat: function (account = null) {
      if (!account) return "";
      return account.slice(0,12) + "..." + account.slice(-5);
    },
    ucFirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    toggleNavigation: function (context = null) {
      switch (context) {
        case 'warch': {
          this.showNav = false;
          this.warch.txAmount = 0;
          this.warchNav = !this.warchNav;
          if (!this.warchNav) this.warch.txAmount = 0;
          break;
        }
        default: {
          this.warchNav = false;
          if (this.warch.txAmount) this.warch.txAmount = 0;
          this.showNav = !this.showNav;
        }
      }
    },
    maxWarch: function () {
      if (this.warch.context == this.warch.contexts.wrap) {
        this.warch.txAmount = FromAtto(this.accounts[0].balance.amount);
      } else {
        this.warch.txAmount = FromAtto(this.warch.balance);
      }
    },
    // Txs
    executeWrapOrUnwrap: async function () {
      if (!this.warch.txAmount || typeof this.warch.txAmount !== 'number') 
        return console.error("Error: invalid token amount", this.warch.txAmount);
      else this.warchNav = false;

      // XXX TMP: temporary BigNum fix; 
      // TODO: use BigNum lib for ToAtto math
      // @see: DomainListEntry.vue for same issue
      let amount = (this.warch.txAmount >= 1000) ? parseInt(this.warch.txAmount) : this.warch.txAmount;
      let useBigInt = Number.isInteger(amount);
      let txAmount = ToAtto(amount, useBigInt);

      switch (this.warch.context) {
        case this.warch.contexts.wrap: {
          // Waiting notification
          this.notify = {
            type: "loading",
            title: "Wrapping your ARCH",
            msg: "Preparing to wrap " + this.warch.txAmount + " ARCH into wARCH",
            img: null,
          };
          // Tx Broadcast
          this.warch.executeResult = await WrappedArch.Execute.Deposit(txAmount, this.cwClient);
          break;
        }
        case this.warch.contexts.unwrap: {
          // Waiting notification
          this.notify = {
            type: "loading",
            title: "Unwrapping your wARCH",
            msg: "Preparing to unwrap " + this.warch.txAmount + " wARCH into native ARCH",
            img: null,
          };
          // Tx Broadcast
          this.warch.executeResult = await WrappedArch.Execute.Withdraw(txAmount, this.cwClient);
          break;
        }
        default: {
          this.closeNotification();
          return console.error("Error: invalid tx context", this.warch.context);
        }
      }
      if (!this.warch.executeResult['error']) {
        this.notify = {
          type: "success",
          title: (!this.warch.context) ? "ARCH wrapped" : "wARCH unwrapped",
          msg: (!this.warch.context) ? "wARCH balance successfully updated" : "ARCH balance successfully updated",
          img: null,
        };
        // Resolve updates
        await this.resolveUpdates();
      } else {
        // Error notification
        this.notify = {
          type: "error",
          title: "Something went wrong",
          msg: this.warch.executeResult.error,
          img: null,
        };
      }
      // console.log('warch.executeResult', this.warch.executeResult);
    }
  },
  computed: {
    isIframe: function () {
      if (!window) return null;
      else if (!window.parent) return null;
      return window !== window.parent;
    },
    validWarchParams: function () {
      if (!this.accounts.length || !this.warch.txAmount) return false;
      if (Number(this.accounts[0].balance.amount) == 0) return false;
      let amount = (this.warch.txAmount >= 1000) ? parseInt(this.warch.txAmount) : this.warch.txAmount;
      let useBigInt = Number.isInteger(amount);
      let txAmount = ToAtto(amount, useBigInt);
      if (this.warch.context == this.warch.contexts.wrap) {
        if (txAmount <= Number(this.accounts[0].balance.amount)) return true;
        else return false;
      } else {
        if (txAmount <= Number(this.warch.balance)) return true;
        else return false;
      }
    }
  },
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
  margin-right: 1em;
}
#connect_modal {
  margin-right: 0.5em;
}
#user_account {
  position: relative;
  color: #ffffff;
  height: 70px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.20);
  margin-left: 1.25em;
  padding-top: 5px;
}
#user_account.active {
  background: rgba(255, 255, 255, 0.20);
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
.caret-inv, .close-x.menu {
  position: relative;
}
.caret-inv {
  float: right;
  top: -50px;
  position: relative;
  left: 10px;
  font-weight: 200;
  font-size: 40px;
}
.disconnected .caret-inv {
  top: -45px;
}
.head {
  display: inline-flex;
}
.head .left {
  margin-right: 1em;
}
.caret-warch {
  position: relative;
}
.caret-warch.active {
  top: -23px;
}
.close-x.menu {
  top: -40px;
  left: 8px;
  position: relative;
  font-size: 20px;
  font-weight: 200;
}
.close-x.menu.connected {
  margin-right: 0.5em;
}
.close-x.warch {
  top: 0px;
  left: 0px;
}
.col.disconnected span {
  color: #FFFFFF;
}
.disconnected .close-x {
  top: -34px;
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
div.warning.warning-msg {
  display: flex;
  padding: 16px;
  align-items: center;
  gap: 16px;
  align-self: stretch;
  border-radius: 8px;
  border: 1px solid #FF4D00;
  margin-left: 8px;
  margin-right: 16px;
}
div.warning .col.left {
  max-width: 30px;
}
p.warning {
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 120%;
}
p.warning.title {
  color: #FF4D00;
}
div.account-name {
  position: relative;
  right: 20px;
}
div.balance.row {
  max-width: fit-content;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.20);
  height: 70px;
  justify-content: center;
  align-items: center;
  gap: 16px;
}
div.balance.row.active {
  background: rgba(255, 255, 255, 0.20);
}
div.balance.row .col {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
div.wallet-balance {
  border-right: 1px solid rgba(255, 255, 255, 0.20);
}
div.wallet-balance,
div.warch-balance {
  color: #FFFFFF;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 120%;
  position: relative;
}
a.btn-primary:focus {
  color: #FFFFFF;
}
a.btn-inverse:focus {
  color: #FF4D00;
  position: relative;
  z-index: 1000;
}
.menu.mobile {
  display: inline-block;
}
.menu.mobile.connected {
  margin-right: 0.25em;
}
.nav-pills.wrap-unwrap {
  background: #F2EFED;
  justify-content: space-evenly;
  border-radius: 8px;
  display: flex;
  padding: 4px;
  align-items: flex-start;
  gap: 8px;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 8px;
  border: 1px solid #F2EFED;
}
.nav-pills.wrap-unwrap li {
  color: #FF4D00;
  cursor: pointer;
  border-radius: 8px;
  width: 45%;
  text-align: center;
}
.nav-pills.wrap-unwrap li.active {
  background: #FFFFFF;
  box-shadow: 3px 9px 32px -4px rgba(0, 0, 0, 0.07);
}
div.wrap.icon-display {
  position: relative;
  top: -52px;
  margin-left: 20px;
  display: inline-block;
}
.btn-warch-menu {
  position: relative;
  left: 0.75em;
}
.btn-warch-menu, 
.btn-warch-menu:hover, 
.btn-warch-menu:focus, 
.btn-warch-menu:active,
.btn-warch-menu:active:focus {
  background-image: none;
  outline: 0;
  -webkit-box-shadow: none;
  box-shadow: none;
  outline: none !important;
}
.btn-warch-menu span {
  position: relative;
  top: -5px;
}
.warch-submitter button {
  width: 100%;
  height: 50px;
}
div.wrap-input {
  max-height: 65px;
}
.wrap-denom.form-control {
  background: #F2EFED;
  border-radius: 8px;
  height: 56px;
  border: none;
  text-align: center;
  padding-top: 2em;
  padding-bottom: 2em;
  font-style: normal;
  font-weight: 400;
  line-height: 170%;
}
div.denom.icon-display {
  position: relative;
  top: -52px;
  margin-left: 20px;
  display: inline-block;
}
div.warch-max {
  position: relative;
  left: 200px;
  top: -88px;
}
div.warch-max button {
  height: 36px;
  width: 63px;
}
</style>