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
    <div v-if="tokens.length && searchThreshold !== false">
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
            <button :class="{'chevron-left': true, 'pointer': page > 0, 'disabled': page <= 0}" @click="pageHandler((page - 1));" :disabled="page <= 0"></button>
          </div>
          <div class="col mid">
            <div class="paging-display">
              <!-- <div class="page-select-wrapper">
                <select class="page-select"  @change="onChange($event)" v-model="page">
                  <option class="page-select-option form-control" v-for="(pageOption, i) in totalPages" :key="'page-option-'+i" :value="i">{{ String(i+1) }}</option>
                </select>
              </div> -->
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
      <p v-if="loaded && cw721">No domains found for contract {{ cw721 }}</p>
    </div>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Config, ResolveAddress } from '../util/query';
import { NumTokens, Tokens, Token } from '../util/token';
import * as Paging from '../util/pagination';

import DomainsBanner from './children/DomainsBanner.vue';
import DomainListEntry from './children/DomainListEntry.vue';

const LIMIT = 10;

export default {
  name: 'Domains',
  components: { DomainsBanner, DomainListEntry },
  data: () => ({
    cwClient: null,
    accounts: null,
    config: null,
    cw721: null,
    tokens: [],
    tokenQuantity: null,
    filteredTokens: [],
    search: null,
    searchThreshold: null,
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
      if (typeof this.page !== 'number') return;
      if (!this.cw721) await this.setTokenContract();
      // Total tokens
      let total = await NumTokens(this.cw721, this.cwClient);
      total = (total['count']) ? total.count : 0;
      if (!total || typeof total !== 'number') return;
      else this.tokenQuantity = total;
      // Load tokens page
      if (this.page > (total / LIMIT)) this.page = Math.floor(total / LIMIT);
      let start = (this.page > 0) ? this.tokens[this.tokens.length - 1] : null;
      let query = await Tokens(this.cw721, this.cwClient, LIMIT, start);
      this.tokens = (query['tokens']) ? query.tokens : [];
      // console.log('Query page', {
      //   start: start,
      //   limit: LIMIT,
      //   query: query,
      //   tokens: this.tokens
      // });
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
    pageHandler: async function (page) {
      if (typeof page !== 'number') return;
      this._collapseDomainListItems();
      this.page = page;
      await this.tokenIds();
    },
    _collapseDomainListItems: function () {
      if (!document) return;
      let htmlCollection = document.getElementsByClassName("caret active");
      if (!htmlCollection.length) return;
      for (let i = 0; i < htmlCollection.length; i++) {
        htmlCollection[0].click();
      }
    },
    _domainSearch: async function (filters) {
      let tokenSearch = null;
      let textFilter = null;
      let domainSuffix = ".arch";
      this.page = 0;
      if (!this.cwClient || typeof filters !== 'object') return this.search = null;
      else if (!filters.text) return this.search = null;
      else if (filters.text.length < 5) textFilter = filters.text + domainSuffix;
      else if (filters.text.slice(-5) !== domainSuffix) textFilter = filters.text + domainSuffix;
      else textFilter = filters.text;
      try {
        if (!this.cw721) await this.setTokenContract();
        tokenSearch = await Token(textFilter, this.cw721, this.cwClient);
        if (tokenSearch['extension']) this.filteredTokens = [tokenSearch.extension.domain];
        else this.filteredTokens = [];
        this.search = true;
      } catch(e) {
        console.error(`Token search for ${filters.text} failed`, e);
        return;
      }
    },
    _addressSearch: async function (filters) {
      this.page = 0;
      if (typeof filters.text !== 'string') return this.search = null;
      if (filters.text.length !== 46 && filters.text.length !== 66) return this.search = null;
      let query = await ResolveAddress(filters.text, this.cwClient);
      this.filteredTokens = (query['names']) ? query.names : [];
      if (!this.filteredTokens.length) this.search = null;
      else this.search = true;
      // console.log('Address search query', query, this.filteredTokens);
    },
    async onChange(event) {
      this._collapseDomainListItems();
      this.page = parseInt(event.target.value);
      await this.tokenIds();
    },

    // Util
    isSubdomain: function (domain = null) {
      if (!domain || typeof domain !== 'string') return null;
      return (domain.slice(0,-5).indexOf(".") >= 0) ? true : false
    },
  },
  computed: {
    totalPages: function () {
      if (!this.tokenQuantity) return 0;
      return Math.ceil((this.tokenQuantity / this.pageSize));
    },
    domainsList: function () {
      if (this.filteredTokens && this.search) return this.filteredTokens;
      else if (this.tokens) return this.tokens;
      else return [];
    }
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
