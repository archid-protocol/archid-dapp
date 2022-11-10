<template>
  <div class="page">
    <ul>
      <li>
        <router-link to="/">Home</router-link>
      </li>
      <li>
        <router-link to="/domains">Domains</router-link>
      </li>
      <li>
        <router-link to="/my-domains">Domains</router-link>
      </li>
    </ul>
    <h3 v-if="account">archid - domains owned by <span class="account">{{ account }}</span></h3>
    <ul v-if="tokens.length">
      <li v-for="(domain, i) in tokens" :key="i">
        <router-link :to="'/domains/' + domain">{{ domain }}</router-link>
      </li>
    </ul>
    <div v-else>
      <p v-if="loaded">No domains found for account {{ accounts[0].address }}</p>
    </div>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Config } from '../util/query';
import { TokensOf } from '../util/token';

export default {
  name: 'Profile',
  components: {},
  data: () => ({
    cwClient: null,
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
          this.cwClient = await Client();
          this.accounts = await Accounts(this.cwClient);
          console.log('Profile client', {cwClient: this.cwClient, accounts: this.accounts});

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
      let cw721Query = await Config(this.cwClient);
      this.cw721 = cw721Query.cw721;
      return;
    },
    tokenIds: async function () {
      if (!this.cw721) await this.setTokenContract();
      let query = await TokensOf(this.cw721, this.account, this.cwClient);
      this.tokens = (query['tokens']) ? query.tokens : [];
      console.log('My tokens query', this.tokens);
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
span.account {
  font-style: italic;
}
</style>
