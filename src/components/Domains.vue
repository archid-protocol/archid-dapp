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

    <!-- Domains -->
    <div v-if="tokens.length">
      <ul class="domains">
        <li v-for="(domain, i) in domainsList" :key="i">
          <DomainListEntry
            v-bind:domain="domain"
            v-bind:cw721="cw721"
            v-bind:cwClient="cwClient"
            v-bind:isSubdomain="isSubdomain(domain)"
            v-bind:isReadOnly="true"
            v-bind:baseCost="parseInt(config.base_cost)"
            v-bind:collapsible="true"
            :key="'item-'+i"
          >
          </DomainListEntry>
        </li>
      </ul>
      <div class="paging row">
        <div class="paging-items row">
          <div class="col left">
            <button :class="{'chevron-left': true, 'pointer': page > 0, 'disabled': page <= 0}" @click="page = page - 1;" :disabled="page <= 0"></button>
          </div>
          <div class="col mid">
            <div class="paging-display">
              <div class="page-select-wrapper">
                <select class="page-select"  @change="onChange($event)" v-model="page">
                  <option class="page-select-option form-control" v-for="(pageOption, i) in totalPages" :key="'page-option-'+i" :value="i">{{ String(i+1) }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="col right">
            <button :class="{'chevron-right': true, 'pointer': page < (totalPages - 1), 'disabled': page >= (totalPages - 1)}" @click="page = page + 1" :disabled="page >= (totalPages - 1)"></button>
          </div>
        </div>
      </div>
    </div>

    <!-- No Domains were found -->
    <div v-if="!tokens.length">
      <p v-if="loaded && cw721">No domains found for contract {{ cw721 }}</p>
    </div>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Config } from '../util/query';
import { NumTokens, Tokens } from '../util/token';
import * as Paging from '../util/pagination';

import DomainsBanner from './children/DomainsBanner.vue';
import DomainListEntry from './children/DomainListEntry.vue';

const LIMIT = 500;

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
    page: 0,
    pageSize: Paging.DEFAULT_PAGE_SIZE,
    pageSizes: Paging.ALL_PAGE_SIZES,
    pageSelect: false,
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
          if (!walletType) this.cwClient = await Client("offline");
          else {
            this.cwClient = await Client(walletType);
            this.accounts = await Accounts(this.cwClient);
          }
          // console.log('Tokens client', {cwClient: this.cwClient, accounts: this.accounts, walletType: walletType});

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
      // Total tokens
      let total = await NumTokens(this.cw721, this.cwClient);
      total = (total['count']) ? total.count : 0;
      if (!total || typeof total !== 'number') return;
      // Load tokens
      if (total > LIMIT) {
        let pages = Math.ceil(total / LIMIT);
        for (let i = 0; i < pages; i++) {
          let start = (i > 0) ? this.tokens[this.tokens.length - 1] : null;
          let query = await Tokens(this.cw721, this.cwClient, LIMIT, start);
          if (query['tokens']) this.tokens = [...this.tokens, ...query.tokens];
        }
      } else {
        let query = await Tokens(this.cw721, this.cwClient);
        this.tokens = (query['tokens']) ? query.tokens : [];
      }
      // console.log('Tokens query', this.tokens);
    },

    // Filter
    filter: function (filters) {
      if (!this.tokens.length) return;
      // console.log('Update filters', filters);
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
            // console.log(this.filteredTokens);
          }
        }
      } else {
        this.search = null;
      }
      this.page = 0;
    },
    onChange(event) {
      this.page = parseInt(event.target.value);
    },

    // Util
    isSubdomain: function (domain = null) {
      if (!domain || typeof domain !== 'string') return null;
      return (domain.slice(0,-5).indexOf(".") >= 0) ? true : false
    },
  },
  computed: {
    domainsList: function () {
      let domains, start, end;
      if (this.search) domains = this.filteredTokens;
      else domains = this.tokens;
      if (this.page == 0) {
        start = 0;
        end = this.pageSize;
      } else {
        start = (this.page * this.pageSize);
        end = (this.page * this.pageSize) + this.pageSize;
      }
      return domains.slice(start, end);
    },
    totalPages: function () {
      if (!this.tokens.length) return 0;
      return Math.ceil((this.tokens.length / this.pageSize));
    },
  },
}
</script>

<style scoped>
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
