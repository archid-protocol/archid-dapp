<template>
  <div class="page">
    <!-- Home Banner -->
    <div class="welcome-banner" v-if="accountDisplay">
      <HomeBanner
        v-bind:cwClient="cwClient"
        v-bind:account="accountDisplay"
        @registration="registration"
      >
      </HomeBanner>
    </div>
    <!-- Recent Domains -->
    <div class="recent-domains-component" v-if="cwClient">
      <RecentDomains
        v-bind:cwClient="cwClient"
        v-bind:size="8"
      >
      </RecentDomains>
    </div>

    <!-- Home Page Content -->
    <div class="home content content-1">
      <div class="ln-1 heading txt-primary">More than a name,</div>
      <div class="ln-2 heading txt-focus">An identity<span class="txt-primary">.</span></div>
      <div class="ln-3">
        <p class="descr">When someone asks you who you are, you don't answer <br/>with the number on your ID, you use your name.</p>
        <p class="descr">ArchID is who you are on Archway, a name for your address, and so much more.</p>
      </div>
      <div class="ln-4 container container-fluid">
        <div class="row home1-row">
          <div class="col">
            <img class="content-1-img home1" src="/img/home1.svg" />
          </div>
          <div class="col">
            <img class="content-1-img home2" src="/img/home2.svg" />
          </div>
          <div class="col">
            <img class="content-1-img home3" src="/img/home3.svg" />
            <img class="content-1-img home4" src="/img/home4.svg" />
          </div>
        </div>
      </div>
      <div class="home content-1-inner">
        <div class="row home2-row">
          <div class="col">
            <h3 class="title home2-1">Become recognizable</h3>
            <p class="home2-1">The simple fact that you can give your ArchID domain instead of a 120 character long string is already a massive advantage.</p>
            <p class="home2-1">It makes you recognisable, since you choose where you identify yourself with your ArchID.</p>
          </div>
          <div class="col">
            <h3 class="title home2-1">Stay safe</h3>
            <p class="home2-1">Developers can choose to be identified as the owner of an application and address, allowing wallets to display and verify the owner of a particular interface.</p>
            <p class="home2-1">This makes it harder for people to take advantage of you with phishing applications and campaigns.</p>
          </div>
          <div class="col">
            <h3 class="title home2-1">More than just a name</h3>
            <p class="home2-1">If you choose to add your social media profiles, that information can be accessed by other applications so that you don’t have to enter and update it on all the applications you use.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="home content content-2">
      <div class="text">
        <div class="ln-1 heading txt-primary">One name</div>
        <div class="ln-2 heading txt-focus">For everything Archway</div>
      </div>
      <img class="content-2-img home5" src="/img/home5.svg" />
    </div>
    <div class="home content content-3">
      <div class="row token-header">
        <img class="content-3-img token" src="/img/token.svg" />
      </div>
      <div class="content-3-banner">
        <div class="bottom-banner">
          <div class="container container-sm">
            <div class="ln-1 heading txt-secondary">What should we</div>
            <div class="ln-2 btm heading txt-secondary">call you?</div>
            <p class="home3-1">Ready to become more than an address?<br />Join today and claim your identity.</p>
            <div class="ctrl">
              <button class="btn btn-inverse btn-register" v-if="accounts" @click="registerHandler();">Register Domain</button>
              <button class="btn btn-inverse btn-register" v-if="!accounts" @click="connectHandler();">Connect & Register Domain</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

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
import { Client, Accounts } from '../util/client';
import { Register } from '../util/execute';

import HomeBanner from './children/HomeBanner.vue';
import RecentDomains from './children/RecentDomains.vue';
import Notification from './children/Notification.vue'

const DEFAULT_TOKEN_IMG = 'token.svg';

export default {
  name: 'Home',
  components: { HomeBanner, RecentDomains, Notification },
  data: () => ({
    cwClient: null,
    cw721: null,
    accounts: null,
    accountDisplay: null,
    executeResult: null,
    notify: {
      type: null,
      title: null,
      msg: null,
      img: null,
    },
  }),
  mounted: async function () {
    if (window) {
      let connected = window.sessionStorage.getItem('connected');
      if (connected) {
        this.resumeConnectedState();
      } else {
        this.accountDisplay = "archway12891";
      }
    }
  },
  methods: {
    resumeConnectedState: async function (attempts = 0) {
      if (attempts >= 5) return;
      try {
        setTimeout(async () => { 
          let walletType = sessionStorage.getItem("connected");
          this.cwClient = await Client(walletType);
          this.accounts = await Accounts(this.cwClient);
          this.accountDisplay = this.accounts[0].address;
          console.log('Home client', {cwClient: this.cwClient, accounts: this.accounts, walletType: walletType});
        }, 100);
      } catch (e) {
        await this.resumeConnectedState((attempts + 1));
      }
    },
    closeNotification: function () {
      this.notify = {
        type: null,
        title: null,
        msg: null,
        img: null,
      };
    },
    registration: async function (params) {
      if (!params.name || !params.expiry || !params.base_cost) return;

      // Waiting notification
      this.notify = {
        type: "loading",
        title: "Creating your new domain",
        msg: "You're registering " + params.name + ".arch",
        img: null,
      };

      this.executeResult = await Register(
        params.name,
        params.years,
        Number(params.base_cost),
        this.cwClient
      );
      
      console.log('Register tx', this.executeResult);

      if (!this.executeResult['error']) {
        // Success notification
        this.notify = {
          type: "success",
          title: "Your domain is ready",
          msg: "You registered " + params.name + ".arch",
          img: DEFAULT_TOKEN_IMG,
        };
      } else {
        // Error notification
        this.notify = {
          type: "error",
          title: "Something went wrong",
          msg: this.executeResult.error,
          img: null,
        };
      }
    },
    registerHandler: function () {
      const searchEl = document.getElementById('domain');
      searchEl.focus();
    },
    connectHandler: function () {
      const connectEl = document.getElementById('connect_modal');
      connectEl.click();
    },
  },
}
</script>

<style scoped>
.content {
  margin-top: 4em;
  clear: both;
}
.content.content-3 {
  margin-top: 0;
  position: relative;
  top: -250px;
}
.heading {
  font-style: normal;
  font-weight: 600;
  font-size: 64px;
  line-height: 100%;
  letter-spacing: -0.06em;
  text-transform: uppercase;
}
.content-2 .text {
  position: relative;
  z-index: 200;
}
div.ln-2 {
  margin-bottom: 64px;
}
div.ln-2.btm {
  margin-bottom: 32px;
}
div.ln-3 {
  width: 885px;
  margin: auto;
}
div.ln-3 p {
  font-weight: 500;
  font-size: 21px;
  line-height: 130%;
  letter-spacing: -0.02em;
}
.home1-row .col:nth-child(1) {
  position: relative;
  left: 10%;
}
.home1-row .col:nth-child(2) {
  z-index: 100;
}
.home1-row .col:nth-child(3) {
  position: relative;
  left: -10%;
}
img.content-1-img {
  position: relative;
  width: 105%;
}
img.home2 {
  top: 120px;
}
img.home4 {
  position: relative;
  top: -60px;
}
img.home5 {
  width: 1480px;
  margin: auto;
  display: block;
  position: relative;
  top: -100px;
}
img.token {
  width: 200px;
  margin: auto;
  position: relative;
  top: 75px;
}
.title.home2-1 {
  font-weight: 500;
  font-size: 32px;
  line-height: 130%;
  letter-spacing: -0.02em;
  color: #242424;
  margin-bottom: 16px;
}
p.home2-1, p.home3-1 {
  font-style: normal;
  font-weight: 400;
  /* font-size: 16px; */
  font-size: 18px;
  line-height: 150%;
  letter-spacing: -0.01em;
}
p.home2-1 {
  color: #242424;
}
p.home3-1 {
  margin-bottom: 32px;
}
.bottom-banner {
  padding: 4em;
  background: #FF4D00;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 1em;
  text-align: center;
}
.bottom-banner .container-sm {
  margin-top: 2em;
}
.content-3-banner {
  margin-bottom: -192px;
}
</style>