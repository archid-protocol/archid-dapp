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
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Register } from '../util/execute';

import HomeBanner from './children/HomeBanner.vue';
import RecentDomains from './children/RecentDomains.vue';

export default {
  name: 'Home',
  components: { HomeBanner, RecentDomains },
  data: () => ({
    cwClient: null,
    cw721: null,
    accounts: null,
    accountDisplay: null,
    executeResult: null,
  }),
  mounted: async function () {
    if (window) {
      let connected = window.sessionStorage.getItem('connected');
      if (connected) {
        this.resumeConnectedState();
      } else {
        this.accountDisplay = "archway1289";
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
    registration: async function (params) {
      if (!params.name || !params.expiry || !params.base_cost) return;
      this.executeResult = await Register(
        params.name,
        params.years,
        Number(params.base_cost),
        this.cwClient
      );
      if (typeof this.executeResult == 'undefined') console.error({error: "Error calling entry point in Registry"});
      console.log('Register tx', this.executeResult);
    },
  },
}
</script>

<style scoped>
.page {
  max-width: 90vw;
  padding: 3em;
}
input {
  width: 500px;
}
input, label.withdraw-label {
  margin-left: 5px;
}
input.number {
  width: 45px;
}
</style>
