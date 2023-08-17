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
            v-bind:status="statuses[domain]"
            @dataResolution="dataResolution"
            :key="domain"
          >
          </DomainListEntry>
        </li>
      </ul>
    </div>

    <div class="domain-history" v-if="domain && history.length">
      <div class="history title">
        <span class="icon icon-info"></span>&nbsp;<h3>Domain History</h3>
      </div>
      <ul class="history-ul">
        <li v-for="(tx, i) in history" :key="i">
          <HistoryListEntry
            v-bind:domain="domain"
            v-bind:historyItem="tx"
          >
          </HistoryListEntry>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Config, ResolveRecord } from '../util/query';
import { Token, OwnerOf, HistoryOf } from '../util/token';
import { Query as MarketplaceQuery } from '../util/marketplace';

import DomainBanner from './children/DomainBanner.vue';
import DomainListEntry from './children/DomainListEntry.vue';
import HistoryListEntry from './children/HistoryListEntry.vue';

export default {
  name: 'Domain',
  components: { DomainBanner, DomainListEntry, HistoryListEntry },
  data: () => ({
    cwClient: null,
    accounts: null,
    config: null,
    cw721: null,
    token: {},
    owner: null,
    domain: null,
    statuses: {},
    history: [],
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
          // console.log('Token client', {cwClient: this.cwClient, accounts: this.accounts, walletType: walletType});

          // Load token data
          await this.tokenData();
          await this.ownerData();
          await this.resolveDomainRecord();
          await this.tokenStatuses();
          this.historyData();
        }, 100);
      } catch (e) {
        await this.resumeConnectedState((attempts + 1));
      }
    },
    dataResolution: async function () {
      this.renderBanner += 1;
      await this.historyData();
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
      // console.log('Token query', this.token);
    },
    ownerData: async function () {
      if (!this.$route.params.id || typeof this.$route.params.id !== 'string') return;
      if (!this.cw721) await this.setTokenContract();
      this.owner = await OwnerOf(this.$route.params.id, this.cw721, this.cwClient);
      // console.log('Token owner query', this.owner);
    },
    tokenStatuses: async function () {
      if (!this.domain || !this.domainRecord) return;
      let swap = await MarketplaceQuery.Details(this.domain, this.cwClient);
      this.statuses[this.domain] = {
        expiration: this.domainRecord.expiration,
        isExpired: new Date().getTime() > (this.domainRecord.expiration * 1000),
        address: this.domainRecord.address,
        isMismatch: this.domainRecord.address !== this.accounts[0].address,
        isListed: (swap['error']) ? false : true
      };
    },
    historyData: async function () {
      if (!this.$route.params.id || typeof this.$route.params.id !== 'string') return;
      if (!this.cw721) await this.setTokenContract();
      this.history = await HistoryOf(this.$route.params.id, this.cw721, this.cwClient);
      // console.log('History query', this.history);
    },
    resolveDomainRecord: async function () {
      if (!this.$route.params.id || typeof this.$route.params.id !== 'string') return;
      this.domainRecord = await ResolveRecord(
        this.$route.params.id, 
        this.cwClient
      );
      if (typeof this.domainRecord == 'undefined') this.domainRecord = {error: "Error reading from Registry"};
      // console.log('ResolveRecord query', this.domainRecord);
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
  margin-bottom: 1.75em;
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
ul.history-ul {
  margin-top: 1.75em;
  border-radius: unset;
}
ul.history-ul li {
  margin-bottom: 0;
  border-radius: unset;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
ul.history-ul li:last-of-type {
  border: none;
}
div.domain-history {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 1em;
}
.history.title {
  margin-top: 2em;
  margin-left: 27px;
}
.history.title span {
  position: relative;
  top: 3px;
}
.history.title h3 {
  font-style: normal;
  font-weight: 400;
  font-size: 24px;
  line-height: 130%;
  letter-spacing: -0.02em;
  color: #000000;
  display: inline-block;
}
</style>