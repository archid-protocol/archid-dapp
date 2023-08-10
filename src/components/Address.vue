<template>
  <div class="page">

    <!-- Address Banner -->
    <div class="address-banner">
      <div class="title address" v-if="account">
        <h3>{{ accountDisplayFormat(account) }}</h3>
        <h4>Domains</h4>
      </div>
      <div class="search">
        <div class="type-filter left">
          <div class="button-group select-expiry">
            <a :class="{'active': search.type == 0, 'btn-all-domains': true}" @click="typeSearchHandler(0);">All</a>
            <a :class="{'active': search.type == 1, 'btn-active-domains': true}" @click="typeSearchHandler(1);">Active</a>
            <a :class="{'active': search.type == 2, 'btn-expired-domains': true}" @click="typeSearchHandler(2);">Expired</a>
          </div>
        </div>
        <div class="text-filter right">
          <input 
            type="text" 
            placeholder="Search domain name, Archway address"
            class="domain form-control"
            name="domain"
            @keyup="textSearchHandler"
            v-model="search.input"
          />
        </div>
      </div>
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
            v-bind:status="statuses[domain]"
            @ownershipTransfer="newOwnerHandler"
            @listing="newListingHandler"
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
    <div v-else>
      <p v-if="loaded">No domains found for account {{ account }}</p>
    </div>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Config, ResolveAddress, ResolveRecord } from '../util/query';
import { TokensOf } from '../util/token';
import * as Paging from '../util/pagination';
import  { Query as MarketplaceQuery } from '../util/marketplace';

import DomainListEntry from './children/DomainListEntry.vue';

const ACTIVE = 1;
const EXPIRED = 2;
const LIMIT = 100;

export default {
  name: 'Profile',
  components: { DomainListEntry },
  data: () => ({
    cwClient: null,
    config: null,
    cw721: null,
    account: null,
    accounts: [],
    tokens: [],
    filteredTokens: [],
    statuses: {},
    search: {
      input: null,
      text: null,
      type: 0,
    },
    searchThreshold: null,
    loaded: false,
    page: 0,
    pageSize: Paging.DEFAULT_PAGE_SIZE,
    pageSizes: Paging.ALL_PAGE_SIZES,
    pageSelect: false,
  }),
  mounted: function () {
    if (window) this.resumeConnectedState();
    this.account = this.$route.params.id;
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
      // Load tokens
      let finished = false, i = 0;
      do {
        let start = (i > 0) ? this.tokens[this.tokens.length - 1] : null;
        let query = await TokensOf(this.cw721, this.account, this.cwClient, LIMIT, start);
        i++;
        if (!Array.isArray(query['tokens'])) return;
        else if (!query.tokens.length) {
          await this.tokenStatuses();
          return finished = true;
        } else this.tokens = [...this.tokens, ...query.tokens];
      } while (!finished);
    },
    tokenStatuses: async function () {
      let domains, start, end;
      if (this.search.text || this.search.type) domains = this.filteredTokens;
      else domains = this.tokens;
      if (!this.tokens.length) return;
      start = (this.page * this.pageSize);
      end = (this.page * this.pageSize) + this.pageSize;
      domains.slice(start, end).forEach(async (domain) => {
        if (!this.statuses[domain]) {
          let query = await ResolveRecord(domain, this.cwClient);
          let swap = await MarketplaceQuery.Details(domain, this.cwClient);
          this.statuses[domain] = {
            expiration: query.expiration,
            isExpired: new Date().getTime() > (query.expiration * 1000),
            address: query.address,
            isMismatch: query.address !== this.accounts[0].address,
            // isListed: (swap['error']) ? false : true
            isListed: (swap['error']) ? false : swap.open
          };
        }
      });
    },

    // Filter 
    typeSearchHandler: function (type) {
      if (typeof type !== 'number') return;
      if (type < 0 || type > 2) return;
      this.search.text = null;
      this.search.type = type;
      this.filter(this.search);
    },
    textSearchHandler: function () {
      this.search.type = 0;
      this.search.text = this.search.input;
      this.filter(this.search);
    },
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
            if (this.search.text) this.search.text = null;
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
      } else if (typeof filters.type == 'number') {
        switch (filters.type) {
          case 0: {
            this.search = { text: null, type: 0 };
            break;
          }
          case 1:
          case 2: {
            this._statusSearch(filters);
            break;
          }
          default: {
            this.search = { text: null, type: 0 };
            break;
          }
        }
      } else {
        this.search = { text: null, type: 0 };
      }
      this.tokenStatuses();
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
      if (!filters.text) return this.search = { text: null, type: 0 };
      // Text filter
      for (let i = 0; i < this.tokens.length; i++) {
        if (this.tokens[i].includes(filters.text)) {
          filteredTokens.push(this.tokens[i]);
        }
        if (i == (this.tokens.length - 1)) {
          this.filteredTokens = filteredTokens;
          this.search.text = filters.text;
          // console.log(this.filteredTokens);
        }
      }
    },
    _addressSearch: async function (filters) {
      this.page = 0;
      let filteredTokens = [];
      if (typeof filters.text !== 'string') return this.search = { text: null, type: 0 };
      if (filters.text.length !== 46 && filters.text.length !== 66) return this.search = { text: null, type: 0 };
      let query = await ResolveAddress(filters.text, this.cwClient);
      if (!Array.isArray(query['names'])) return this.search = { text: null, type: 0 };
      query.names.forEach((name)=> {
        if (this.tokens.indexOf(name) > -1) filteredTokens.push(name);
      });
      this.filteredTokens = filteredTokens
      if (!this.filteredTokens.length) this.search = { text: null, type: 0 };
      // else this.search = true;
      // console.log('Address search query', query, this.filteredTokens);
    },
    _statusSearch: async function (filters) {
      this.page = 0;
      let filteredTokens = [];
      switch (filters.type) {
        case ACTIVE: {
          this.tokens.forEach(async (domain) => {
            if (!this.statuses[domain]) {
              let query = await ResolveRecord(domain, this.cwClient);
              this.statuses[domain] = {
                expiration: query.expiration,
                isExpired: new Date().getTime() > (query.expiration * 1000)
              };
            }
            if (this.statuses[domain].isExpired == false) filteredTokens.push(domain);
          });
          break;
        }
        case EXPIRED: {
          this.tokens.forEach(async (domain) => {
            if (!this.statuses[domain]) {
              let query = await ResolveRecord(domain, this.cwClient);
              this.statuses[domain] = {
                expiration: query.expiration,
                isExpired: new Date().getTime() > (query.expiration * 1000)
              };
            }
            if (this.statuses[domain].isExpired == true) filteredTokens.push(domain);
          });
          break;
        }
        default: {
          this.search = { text: null, type: 0 };
          break;
        }
      }
      this.filteredTokens = filteredTokens;
    },
    onChange(event) {
      this._collapseDomainListItems();
      this.page = parseInt(event.target.value);
      this.tokenStatuses();
    },
    newOwnerHandler: async function (domain) {
      if (!this.tokens) return;
      if (!this.tokens.length) return;
      if (this.tokens.indexOf(domain) < 0) return;
      // Reload all token data
      this.loaded = false;
      this.tokens = [];
      this.filteredTokens = [];
      this.statuses = {};
      await this.tokenIds();
      await this.tokenStatuses();
      this.loaded = true;
    },
    newListingHandler: async function (domain) {
      if (!this.tokens) return;
      if (!this.tokens.length) return;
      if (this.tokens.indexOf(domain) < 0) return;
      // Reload statuses
      this.statuses = {};
      await this.tokenStatuses();
    },

    // Util
    isSubdomain: function (domain = null) {
      if (!domain || typeof domain !== 'string') return null;
      return (domain.slice(0,-5).indexOf(".") >= 0) ? true : false
    },
    accountDisplayFormat: function (account = null) {
      if (!account) return "";
      let ucfirst = account.substr(0,1).toUpperCase();
      return ucfirst + account.slice(1,13) + "..." + account.slice(-7);
    }
  },
  computed: {
    domainsList: function () {
      let domains, start, end;
      if (this.search.text || this.search.type > 0) domains = this.filteredTokens;
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
.address-banner {
  padding: 1.25em;
  background: #FF4D00;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 1em;
  height: 374px;
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
span.account {
  font-style: italic;
}
div.title {
  padding-top: 82px;
}
div.title h3 {
  font-style: normal;
  font-weight: 600;
  font-size: 64px;
  line-height: 120%;
  letter-spacing: -0.05em;
  color: #FFFFFF;
}
div.title h4 {
  font-style: normal;
  font-weight: 500;
  font-size: 32px;
  line-height: 130%;
  letter-spacing: -0.02em;
  color: #FFFFFF;
}
.button-group {
  border-radius: 4px;
  padding: 1em;
  border: 1px solid #F2EFED;
  display: inline-block;
  background: #fff;
  color: #000;
}
.button-group a {
  padding: 0.75em;
  margin-right: 1em;
  cursor: pointer;
}
.button-group a.active {
  color: #FF4D00;
}
.left, .right {
  width: 50%;
  display: inline-block;
}
input {
  width: 100%;
}
.type-filter.left {
  position: relative; 
  top: -10px;
}
.text-filter input {
  padding: 16px;
  max-width: 462px;
  height: 56px;
  background: #FFFFFF;
  border: 1px solid #F2EFED;
  border-radius: 8px;
  top: 12px;
  float: right;
  position: relative;
}
div.title {
  padding-top: 82px;
}
div.title h3 {
  font-style: normal;
  font-weight: 600;
  font-size: 64px;
  line-height: 120%;
  letter-spacing: -0.05em;
  color: #FFFFFF;
}
div.search {
  padding: 16px;
  gap: 32px;
  position: relative;
  background: #FFFFFF;
  border-radius: 8px;
  margin-top: 1.25em;
  clear: both;
}
.disabled {
  cursor: not-allowed !important;
}
.token-info {
  color: rgba(0, 0, 0, 0.667);
}
</style>
