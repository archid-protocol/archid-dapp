<template>
  <div class="page">

    <!-- Address Banner -->
    <div class="address-banner">
      <div class="title" v-if="account">
        <h3>{{ accountDisplayFormat(account) }}</h3>
        <h4>Domains</h4>
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
import { Config } from '../util/query';
import { NumTokens, TokensOf } from '../util/token';
import * as Paging from '../util/pagination';

import DomainListEntry from './children/DomainListEntry.vue';

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
          console.log('Profile client', {cwClient: this.cwClient, accounts: this.accounts, walletType: walletType});

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
          let query = await TokensOf(this.cw721, this.account, this.cwClient, LIMIT, start);
          if (query['tokens']) this.tokens = [...this.tokens, ...query.tokens];
        }
      } else {
        let query = await TokensOf(this.cw721, this.account, this.cwClient);
        this.tokens = (query['tokens']) ? query.tokens : [];
      }
      console.log('TokensOf query', this.tokens);
    },
    onChange(event) {
      this.page = parseInt(event.target.value);
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
      let domains = this.tokens, start, end;
      if (this.page == 0) {
        start = 0;
        end = Paging.DEFAULT_PAGE_SIZE;
      } else {
        start = (this.page * Paging.DEFAULT_PAGE_SIZE);
        end = (this.page * Paging.DEFAULT_PAGE_SIZE) + Paging.DEFAULT_PAGE_SIZE;
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
  height: 325px;
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
  padding-top: 160px;
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
</style>
