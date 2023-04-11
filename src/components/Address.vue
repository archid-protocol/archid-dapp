<template>
  <div class="page">
    <div class="address-banner">
      <div class="title" v-if="account">
        <h3>Domains owned by <span class="account">{{ account }}</span></h3>
      </div>
    </div>

    <ul v-if="tokens.length">
      <li v-for="(domain, i) in tokens" :key="i">
        <DomainListEntry
          v-bind:domain="domain"
          v-bind:cw721="cw721"
          v-bind:cwClient="cwClient"
          v-bind:isSubdomain="isSubdomain(domain)"
          v-bind:isReadOnly="false"
          v-bind:baseCost="parseInt(config.base_cost)"
          v-bind:collapsible="true"
          :key="'item-'+i"
        >
        </DomainListEntry>
      </li>
    </ul>

    <div v-else>
      <p v-if="loaded">No domains found for account {{ account }}</p>
    </div>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Config } from '../util/query';
import { TokensOf } from '../util/token';

import DomainListEntry from './children/DomainListEntry.vue';

export default {
  name: 'Profile',
  components: { DomainListEntry },
  data: () => ({
    cwClient: null,
    config: null,
    cw721: null,
    account: null,
    accounts: [],
    tokens: [],
    loaded: false,
  }),
  mounted: function () {
    if (window) this.resumeConnectedState();
    this.account = this.$route.params.id;
  },
  methods: {
    resumeConnectedState: async function (attempts = 0) {
      if (attempts >= 5) return;
      try {
        setTimeout(async () => {
          let walletType = sessionStorage.getItem("connected");
          this.cwClient = await Client(walletType);
          this.accounts = await Accounts(this.cwClient);
          console.log('Profile client', {cwClient: this.cwClient, accounts: this.accounts, walletType: walletType});

          // Load tokens
          await this.tokenIds();
          this.loaded = true;
        }, 100);
      } catch (e) {
        await this.resumeConnectedState((attempts + 1));
      }
    },

    // Query
    setTokenContract: async function () {
      this.config = await Config(this.cwClient);
      this.cw721 = this.config.cw721;
      return;
    },
    tokenIds: async function () {
      if (!this.cw721) await this.setTokenContract();
      let query = await TokensOf(this.cw721, this.account, this.cwClient);
      this.tokens = (query['tokens']) ? query.tokens : [];
      console.log('My tokens query', this.tokens);
    },

    // Util
    isSubdomain: function (domain = null) {
      if (!domain || typeof domain !== 'string') return null;
      return (domain.slice(0,-5).indexOf(".") >= 0) ? true : false
    },
  },
}
</script>

<style scoped>
.address-banner {
  padding: 4em;
  background: #FF4D00;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 1em;
}
ul {
  padding-left: 0;
}
ul, ul li {
  list-style: none;
}
ul li {
  padding: 32px;
  margin-bottom: 1em;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
}
span.account {
  font-style: italic;
}
</style>
