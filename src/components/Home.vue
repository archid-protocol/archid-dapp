<template>
  <div class="page">
    <h3>archid - home</h3>
    <ul class="navigation">
      <li>
        <router-link to="/test">Test Bench</router-link>
      </li>
      <li>
        <router-link to="/domains">Domains</router-link>
      </li>
      <li>
        <router-link to="/my-domains">My Domains</router-link>
      </li>
    </ul>
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

import RecentDomains from './children/RecentDomains.vue';

export default {
  name: 'Home',
  components: { RecentDomains },
  data: () => ({
    cwClient: null,
    cw721: null,
    accounts: null,
  }),
  mounted: function () {
    if (window) this.resumeConnectedState();
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
ul, ul li {
  list-style: none;
}
ul li {
  padding: 1em;
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
