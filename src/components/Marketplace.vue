<template>
  <div class="page">
    <!-- Marketplace Banner -->
    <div class="marketplace-banner">
      <MarketplaceBanner
        v-bind:title="title"
        v-bind:accounts="accounts"
        @filter="filter"
        @listingType="listingType"
      >
      </MarketplaceBanner>
    </div>

    <!-- Domains -->
    <div v-if="swaps.length && searchThreshold !== false">
      <ul class="swaps">
        <li v-for="(swap, i) in swapsList" :key="i">
          <MarketplaceListEntry
            v-bind:domain="swap"
            v-bind:accounts="accounts"
            v-bind:cw721="cw721"
            v-bind:cwClient="cwClient"
            v-bind:collapsible="true"
            @dataResolution="dataResolution"
            :key="'item-'+i"
          >
          </MarketplaceListEntry>
        </li>
      </ul>
      <div class="paging row">
        <div class="paging-items row">
          <div class="col left">
            <button :class="{'chevron-left': true, 'pointer': page > 0, 'disabled': page <= 0}" @click="pageHandler((page - 1));" :disabled="page <= 0"></button>
          </div>
          <div class="col mid">
            <div class="paging-display">
              <div class="page-select-wrapper" v-if="filteredSwaps && search">
                <select class="page-select"  @change="onChange($event)" v-model="page">
                  <option class="page-select-option form-control" v-for="(pageOption, i) in totalPages" :key="'page-option-'+i" :value="i">{{ String(i+1) }}</option>
                </select>
              </div>
              <div class="page-display-wrapper" v-if="!search">
                <span>{{ (page + 1) }}</span>
              </div>
            </div>
          </div>
          <div class="col right">
            <button :class="{'chevron-right': true, 'pointer': page < (totalPages - 1), 'disabled': page >= (totalPages - 1)}" @click="pageHandler((page + 1));" :disabled="page >= (totalPages - 1)"></button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="swaps.length && searchThreshold == false"></div>

    <!-- No Domains were found -->
    <div v-if="!swaps.length">
      <p v-if="loaded && swapContract">No swaps found for contract {{ swapContract }}</p>
    </div>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Config } from '../util/query';
import { Query as MarketplaceQuery } from '../util/marketplace';
import * as Paging from '../util/pagination';

import MarketplaceBanner from './children/MarketplaceBanner.vue';
import MarketplaceListEntry from './children/MarketplaceListEntry.vue';

const MARKETPLACE_CONTRACT = process.env.VUE_APP_MARKETPLACE_CONTRACT;

// XXX TODO: Fix pagination response
const LIMIT = 30;
const ALL_LISTINGS = 0;
const MY_LISTINGS = 1;

export default {
  name: 'Marketplace',
  components: { MarketplaceBanner, MarketplaceListEntry },
  data: () => ({
    cwClient: null,
    accounts: null,
    config: null,
    cw721: null,
    swaps: [],
    swapContract: MARKETPLACE_CONTRACT,
    filteredSwaps: [],
    search: null,
    searchThreshold: null,
    loaded: false,
    title: 'Marketplace',
    page: 0,
    pageSize: Paging.DEFAULT_PAGE_SIZE,
    pageSizes: Paging.ALL_PAGE_SIZES,
    pageSelect: false,
    listingTypes: [ALL_LISTINGS, MY_LISTINGS],
    context: ALL_LISTINGS,
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
          // Load swaps
          await this.swapIds();
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
    swapIds: async function () {
      if (typeof this.page !== 'number') return;

      let swapsQuery = await MarketplaceQuery.List(null, LIMIT, this.cwClient);
      if (swapsQuery['swaps']) this.swaps = swapsQuery.swaps;
      console.log('swapsQuery', this.swaps);

      // XXX TODO: Fix pagination response
      // let finished = false, i = 0;
      // do {
      //   let start = (i > 0) ? this.swaps[this.swaps.length - 1] : null;
      //   let query = await MarketplaceQuery.List(start, LIMIT, this.cwClient);
      //   console.log('Swaps query', {
      //     query: query, 
      //     start: start,
      //     limit: LIMIT,
      //     i: i,
      //     swaps: this.swaps
      //   });
      //   i++;
      //   if (!Array.isArray(query['swaps'])) return;
      //   else if (!query.swaps.length) {
      //     return finished = true;
      //   } else this.swaps = [...this.swaps, ...query.swaps];
      // } while (!finished);
    },

    // Filter
    filter: function (filters) {
      if (!this.swaps.length) return;
      this.searchThreshold = null;
      this._collapseListItems();
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
        if (this.search) this.search = null;
      }
    },
    listingType: function (type) {
      if (this.listingTypes.indexOf(type) == -1) return;
      else if (type == this.context) return;
      else if (type == MY_LISTINGS && !this.accounts) return;
      else if (type == MY_LISTINGS && !this.accounts.length) return;
      this.page = 0;
      this.context = type;
      this._addressSearch(this.accounts[0].address);
    },
    _domainSearch: async function (filters) {
      this.page = 0;
      console.log('_domainSearch', filters);
    },
    _addressSearch: async function (filters) {
      this.page = 0;
      console.log('_addressSearch', filters);
    },

    // Handlers
    pageHandler: async function (page) {
      if (typeof page !== 'number') return;
      this._collapseListItems();
      this.page = page;
      await this.swapIds();
    },
    _collapseListItems: function () {
      if (!document) return;
      let htmlCollection = document.getElementsByClassName("caret active");
      if (!htmlCollection.length) return;
      for (let i = 0; i < htmlCollection.length; i++) {
        htmlCollection[0].click();
      }
    },
    // Refresh list of swaps after swapping, or cancelling a swap
    dataResolution: async function () {
      this._collapseListItems();
      await this.swapIds();
    },
    async onChange(event) {
      if (!this.filteredSwaps || !this.search) return;
      this._collapseListItems();
      this.page = parseInt(event.target.value);
    },
  },
  computed: {
    totalPages: function () {
      // Searching
      if (this.search && !this.filteredTokens) return 0;
      else if (this.search && this.filteredTokens) return Math.ceil((this.filteredTokens.length / this.pageSize));
      // Not searching / Default display
      else if (!this.swaps.length) return 0;
      else return Math.ceil((this.swaps.length / this.pageSize));
    },
    swapsList: function () {
      // Searching
      if (this.filteredSwaps && this.search) {
        let start = (this.page == 0) ? 0 : this.page * this.pageSize;
        let end = start + this.pageSize;
        return this.filteredSwaps.slice(start, end);
      }
      // Not searching / Default display
      else {
        // XXX TODO: Fix pagination response in contract
        // return this.swaps;
        let start = (this.page == 0) ? 0 : this.page * this.pageSize;
        let end = start + this.pageSize;
        return this.swaps.slice(start, end);
      }
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