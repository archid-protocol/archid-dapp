<template>
  <div class="page">
    <h3>archid - home</h3>
    <!-- Welcome Banner -->
    <div class="welcome-banner" v-if="cwClient && accounts">
      <WelcomeBanner
        v-bind:cwClient="cwClient"
        v-bind:account="accounts[0].address"
      >
      </WelcomeBanner>
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

import WelcomeBanner from './children/WelcomeBanner.vue';
import RecentDomains from './children/RecentDomains.vue';

export default {
  name: 'Home',
  components: { WelcomeBanner, RecentDomains },
  data: () => ({
    cwClient: null,
    cw721: null,
    accounts: null,
  }),
  mounted: function () {
    if (window) {
      let connected = window.sessionStorage.getItem('connected');
      if (connected) {
        this.resumeConnectedState();
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
          console.log('Home client', {cwClient: this.cwClient, accounts: this.accounts, walletType: walletType});
        }, 100);
      } catch (e) {
        await this.resumeConnectedState((attempts + 1));
      }
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
