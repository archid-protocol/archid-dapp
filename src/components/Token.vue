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
        <router-link to="/my-domains">My Domains</router-link>
      </li>
    </ul>
    <h3>archid - domain: {{ domain }}</h3>

    <div class="query-result nft-metadata" v-if="token.extension">
      <p>
        <strong>Token data:</strong>
      </p>
      <pre v-html="metadataQueryResult"></pre>
    </div>
    <div class="query-result domain-record" v-if="domainRecord.address">
      <p>
        <strong>Domain record:</strong>
      </p>
      <pre v-html="domainRecordQueryResult"></pre>
    </div>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Config, ResolveRecord } from '../util/query';
import { Token } from '../util/token';

export default {
  name: 'Tokens',
  components: {},
  data: () => ({
    cwClient: null,
    accounts: null,
    cw721: null,
    token: {},
    domain: null,
    domainRecord: {},
  }),
  mounted: function () {
    if (window) this.resumeConnectedState();
    this.domain = this.$route.params.id;
  },
  methods: {
    resumeConnectedState: async function (attempts = 0) {
      if (attempts >= 5) return;
      try {
        setTimeout(async () => { 
          this.cwClient = await Client();
          this.accounts = await Accounts(this.cwClient);
          console.log('Token client', {cwClient: this.cwClient, accounts: this.accounts});

          // Load token data
          this.tokenData();
          this.resolveDomainRecord();
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
    tokenData: async function () {
      if (!this.$route.params.id || typeof this.$route.params.id !== 'string') return;
      if (!this.cw721) await this.setTokenContract();
      this.token = await Token(this.$route.params.id, this.cw721, this.cwClient);
      console.log('Token query', this.token);
    },
    resolveDomainRecord: async function () {
      if (!this.$route.params.id || typeof this.$route.params.id !== 'string') return;
      this.domainRecord = await ResolveRecord(
        this.$route.params.id, 
        this.cwClient
      );
      if (typeof this.domainRecord == 'undefined') this.domainRecord = {error: "Error reading from Registry"};
      console.log('ResolveRecord query', this.domainRecord);
    },
  },
  computed: {
    metadataQueryResult: function () {
      if (!this.token || this.token == {}) return '';
      return JSON.stringify(this.token, null, 2);
    },
    domainRecordQueryResult: function () {
      if (!this.domainRecord || this.domainRecord == {}) return '';
      return JSON.stringify(this.domainRecord, null, 2);
    },
  }
}
</script>

<style scoped>
.page {
  max-width: 90vw;
  padding: 3em;
}
ul, ul li {
  list-style: none;
  padding: 0;
}
li, .query-result {
  margin-bottom: 1em;
}
</style>