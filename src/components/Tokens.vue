<template>
  <div class="page">
    <p>
      <router-link to="/">Home</router-link>
    </p>
    <h3>archid - domains</h3>
    <ul v-if="tokens.length">
      <li v-for="(domain, i) in tokens" :key="i">
        <a href="#">{{ domain }}</a>
      </li>
    </ul>
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
  }),
  mounted: function () {
    if (window) this.resumeConnectedState();
  },
  methods: {
    resumeConnectedState: async function (attempts = 0) {
      if (attempts >= 5) return;
      try {
        setTimeout(async () => { 
          this.cwClient = await Client();
          this.accounts = await Accounts(this.cwClient);
          console.log('Tokens', {cwClient: this.cwClient, accounts: this.accounts});

          // Load tokens
          await this.tokenIds();
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
      let query = await Tokens();
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
