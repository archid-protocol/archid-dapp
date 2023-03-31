<template>
  <div class="page">
    <div class="domain-banner">
      <div class="title" v-if="domain">
        <h3>{{domain}}</h3>
      </div>
    </div>

    <div class="query-result nft-metadata" v-if="token.extension">
      <p v-if="owner">
        <strong>Owned by: </strong>
        <router-link :to="'/address/' + owner.owner">{{ owner.owner }}</router-link>
      </p>
      <p v-if="domainRecord.address">
        <strong>Resolves to: </strong>
        <router-link :to="'/address/' + domainRecord.address">{{ domainRecord.address }}</router-link>
      </p>
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
import { Token, OwnerOf } from '../util/token';

export default {
  name: 'Tokens',
  components: {},
  data: () => ({
    cwClient: null,
    accounts: null,
    cw721: null,
    token: {},
    owner: null,
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
          let walletType = sessionStorage.getItem("connected");
          this.cwClient = await Client(walletType);
          this.accounts = await Accounts(this.cwClient);
          console.log('Token client', {cwClient: this.cwClient, accounts: this.accounts, walletType: walletType});

          // Load token data
          this.tokenData();
          this.ownerData();
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
    ownerData: async function () {
      if (!this.$route.params.id || typeof this.$route.params.id !== 'string') return;
      if (!this.cw721) await this.setTokenContract();
      this.owner = await OwnerOf(this.$route.params.id, this.cw721, this.cwClient);
      console.log('Token owner query', this.owner);
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
.domain-banner {
  padding: 4em;
  background: #FF4D00;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 1em;
}
</style>