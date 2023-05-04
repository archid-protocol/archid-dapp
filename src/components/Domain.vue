<template>
  <div class="page">
    <div class="domain-banner" v-if="domain && cw721">
      <DomainBanner
        v-bind:domain="domain"
        v-bind:cw721="cw721"
        v-bind:cwClient="cwClient"
        :key="renderBanner"
      >
      </DomainBanner>
    </div>

    <div class="token-metadata" v-if="domain && cw721 && config">
      <ul>
        <li>
          <DomainListEntry
            v-bind:domain="domain"
            v-bind:cw721="cw721"
            v-bind:cwClient="cwClient"
            v-bind:isSubdomain="isSubdomain(domain)"
            v-bind:isReadOnly="true"
            v-bind:baseCost="parseInt(config.base_cost)"
            v-bind:collapsible="false"
            @dataResolution="dataResolution"
            :key="domain"
          >
          </DomainListEntry>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Config, ResolveRecord } from '../util/query';
import { Token, OwnerOf } from '../util/token';

import DomainBanner from './children/DomainBanner.vue';
import DomainListEntry from './children/DomainListEntry.vue';

export default {
  name: 'Domain',
  components: { DomainBanner, DomainListEntry },
  data: () => ({
    cwClient: null,
    accounts: null,
    config: null,
    cw721: null,
    token: {},
    owner: null,
    domain: null,
    domainRecord: {},
    renderBanner: 0,
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
          if (!walletType) this.cwClient = await Client("offline");
          else {
            this.cwClient = await Client(walletType);
            this.accounts = await Accounts(this.cwClient);
          }
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
    dataResolution: function () {
      this.renderBanner += 1;
    },

    // Query
    setTokenContract: async function () {
      this.config = await Config(this.cwClient);
      this.cw721 = this.config.cw721;
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

    // Util
    isSubdomain: function (domain = null) {
      if (!domain || typeof domain !== 'string') return null;
      return (domain.slice(0,-5).indexOf(".") >= 0) ? true : false
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
div.domain-banner {
  border: 1px solid #F2EFED;
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
</style>