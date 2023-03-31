<template>
  <div class="page">
    <!-- Domain Banner -->
    <div class="domain-banner">
      <DomainsBanner
        v-bind:title="title"
        v-bind:context="0"
        @filter="filter"
      >
      </DomainsBanner>
    </div>
    <ul v-if="tokens.length && !search">
      <li v-for="(domain, i) in tokens" :key="i">
        <DomainListEntry
          v-bind:domain="domain"
          v-bind:cw721="cw721"
          v-bind:cwClient="cwClient"
          v-bind:isSubdomain="isSubdomain(domain)"
          v-bind:isReadOnly="true"
          v-bind:baseCost="parseInt(config.base_cost)"
          :key="'item-'+i"
        >
        </DomainListEntry>
      </li>
    </ul>
    <ul v-if="tokens.length && search">
      <li v-for="(domain, i) in filteredTokens" :key="i">
        <DomainListEntry
          v-bind:domain="domain"
          v-bind:cw721="cw721"
          v-bind:cwClient="cwClient"
          v-bind:isSubdomain="isSubdomain(domain)"
          v-bind:isReadOnly="true"
          v-bind:baseCost="parseInt(config.base_cost)"
          :key="'item-'+i"
        >
        </DomainListEntry>
      </li>
      <li v-if="!filteredTokens.length">
        <p>No domains matching "{{ search }}"</p>
      </li>
    </ul>
    <div v-if="!tokens.length">
      <p v-if="loaded && cw721">No domains found for contract {{ cw721 }}</p>
    </div>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Config } from '../util/query';
import { Tokens } from '../util/token';

import DomainsBanner from './children/DomainsBanner.vue';
import DomainListEntry from './children/DomainListEntry.vue';

export default {
  name: 'Domains',
  components: { DomainsBanner, DomainListEntry },
  data: () => ({
    cwClient: null,
    accounts: null,
    config: null,
    cw721: null,
    tokens: [],
    filteredTokens: [],
    search: null,
    loaded: false,
    title: 'Domains',
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
      this.config = await Config(this.cwClient);
      this.cw721 = this.config.cw721;
      return;
    },
    tokenIds: async function () {
      if (!this.cw721) await this.setTokenContract();
      let query = await Tokens(this.cw721, this.cwClient);
      this.tokens = (query['tokens']) ? query.tokens : [];
      console.log('Tokens query', this.tokens);
    },

    // Filter
    filter: function (filters) {
      if (!this.tokens.length) return;
      console.log('Update filters', filters);
      let filteredTokens = [];

      // Text filter
      if (filters.text) {
        for (let i = 0; i < this.tokens.length; i++) {
          if (this.tokens[i].includes(filters.text)) {
            filteredTokens.push(this.tokens[i]);
          }
          if (i == (this.tokens.length - 1)) {
            // XXX TODO: type filter (when API available)
            this.filteredTokens = filteredTokens;
            this.search = filters.text;
            console.log(this.filteredTokens);
          }
        }
      } else {
        this.search = null;
      }
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
.page {
  max-width: 90vw;
  padding: 3em;
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
