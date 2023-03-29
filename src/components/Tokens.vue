<template>
  <div class="page">
    <h3>archid - domains</h3>
    <ul v-if="tokens.length">
      <li v-for="(domain, i) in tokens" :key="i">
        <router-link :to="'/domains/' + domain">{{ domain }}</router-link>
      </li>
    </ul>
    <div v-else>
      <p v-if="loaded && cw721">No domains found for contract {{ cw721 }}</p>
    </div>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Config } from '../util/query';
import { Tokens } from '../util/token';

export default {
  name: 'Tokens',
  components: {},
  data: () => ({
    cwClient: null,
    accounts: null,
    cw721: null,
    tokens: [],
    loaded: false,
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
          console.log('Tokens client', {cwClient: this.cwClient, accounts: this.accounts, walletType: walletType});

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
      let query = await Tokens(this.cw721, this.cwClient);
      this.tokens = (query['tokens']) ? query.tokens : [];
      console.log('Tokens query', this.tokens);
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
</style>
