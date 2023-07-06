<template>
  <div class="page">
    <!-- Domain Banner -->
    <div class="domain-banner">
      <DomainsBanner
        v-bind:title="title"
        v-bind:context="1"
        @filter="filter"
      >
      </DomainsBanner>
    </div>

    <!-- Domains -->
    <div v-if="tokens.length && searchThreshold !== false">
      <ul class="domains">
        <li v-for="(domain, i) in domainsList" :key="i">
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
      <div class="paging row">
        <div class="paging-items row">
          <div class="col left">
            <button :class="{'chevron-left': true, 'pointer': page > 0, 'disabled': page <= 0}" @click="pageHandler((page - 1));" :disabled="page <= 0"></button>
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
            <button :class="{'chevron-right': true, 'pointer': page < (totalPages - 1), 'disabled': page >= (totalPages - 1)}" @click="pageHandler((page + 1));" :disabled="page >= (totalPages - 1)"></button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tokens.length && searchThreshold == false"></div>

    <!-- No Domains were found -->
    <div v-if="!tokens.length">
      <p v-if="loaded">No domains found for account {{ accounts[0].address }}</p>
    </div>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Config, ResolveAddress } from '../util/query';
import { NumTokens, TokensOf } from '../util/token';
import * as Paging from '../util/pagination';

import DomainsBanner from './children/DomainsBanner.vue';
import DomainListEntry from './children/DomainListEntry.vue';

const LIMIT = 100;

export default {
  name: 'My Domains',
  components: { DomainsBanner, DomainListEntry },
  data: () => ({
    cwClient: null,
    config: null,
    cw721: null,
    accounts: [],
    tokens: [],
    filteredTokens: [],
    search: null,
    searchThreshold: null,
    loaded: false,
    title: 'My Domains',
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
          // console.log('Profile client', {cwClient: this.cwClient, accounts: this.accounts, walletType: walletType});

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
          let query = await TokensOf(this.cw721, this.accounts[0].address, this.cwClient, LIMIT, start);
          if (query['tokens']) this.tokens = [...this.tokens, ...query.tokens];
        }
      } else {
        let query = await TokensOf(this.cw721, this.accounts[0].address, this.cwClient);
        this.tokens = (query['tokens']) ? query.tokens : [];
      }
      // console.log('TokensOf query', this.tokens);
    },

    // Filter
    filter: function (filters) {
      if (!this.tokens.length) return;
      this.searchThreshold = null;
      this._collapseDomainListItems();
      if (filters.text) {
        this.searchThreshold = (filters.text.length >= 3) ? true : false;
        switch (filters.text.length) {
          case 0:
          case 1:
          case 2: {
            if (this.search) this.search = null;
            break;
          }
          case 46:
          case 66: {
            if (filters.text.substring(0,7) == 'archway') this._addressSearch(filters);
            else this._domainSearch(filters);
            break;
          }
          default: {
            this._domainSearch(filters);
            break;
          }
        }
      } else {
        this.search = null;
      }
    },
    pageHandler: function (page) {
      if (typeof page !== 'number') return;
      this._collapseDomainListItems();
      this.page = page;
    },
    _collapseDomainListItems: function () {
      if (!document) return;
      let htmlCollection = document.getElementsByClassName("caret active");
      if (!htmlCollection.length) return;
      for (let i = 0; i < htmlCollection.length; i++) {
        htmlCollection[0].click();
      }
    },
    _domainSearch: function (filters) {
      let filteredTokens = [];
      this.page = 0;
      if (!filters.text) return this.search = null;
      // Text filter
      for (let i = 0; i < this.tokens.length; i++) {
        if (this.tokens[i].includes(filters.text)) {
          filteredTokens.push(this.tokens[i]);
        }
        if (i == (this.tokens.length - 1)) {
          this.filteredTokens = filteredTokens;
          this.search = filters.text;
          // console.log(this.filteredTokens);
        }
      }
    },
    _addressSearch: async function (filters) {
      this.page = 0;
      let filteredTokens = [];
      if (typeof filters.text !== 'string') return this.search = null;
      if (filters.text.length !== 46 && filters.text.length !== 66) return this.search = null;
      let query = await ResolveAddress(filters.text, this.cwClient);
      if (!Array.isArray(query['names'])) return this.search = null;
      query.names.forEach((name)=> {
        if (this.tokens.indexOf(name) > -1) filteredTokens.push(name);
      });
      this.filteredTokens = filteredTokens
      if (!this.filteredTokens.length) this.search = null;
      else this.search = true;
      // console.log('Address search query', query, this.filteredTokens);
    },
    onChange(event) {
      this._collapseDomainListItems();
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
