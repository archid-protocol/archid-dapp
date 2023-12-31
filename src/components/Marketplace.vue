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
            v-bind:domain="swap.token_id"
            v-bind:parentDetails="swap"
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
      <div class="paging row" v-if="filters.type !== 'Details'">
        <div class="paging-items row">
          <div class="col left">
            <button :class="{'chevron-left': true, 'pointer': page > 0, 'disabled': page <= 0}" @click="pageHandler((page - 1));" :disabled="page <= 0"></button>
          </div>
          <div class="col mid">
            <div class="paging-display">
              <div class="page-select-wrapper" v-if="filteredSwaps && search && totalPages">
                <select class="page-select"  @change="onChange($event)" v-model="page">
                  <option class="page-select-option form-control" v-for="(pageOption, i) in totalPages" :key="'page-option-'+i" :value="i">{{ String(i+1) }}</option>
                </select>
              </div>
              <div class="page-display-wrapper" v-else>
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
import { ToAtto } from '../util/denom';
import { Config } from '../util/query';
import { Query as MarketplaceQuery } from '../util/marketplace';
import * as Paging from '../util/pagination';

import MarketplaceBanner from './children/MarketplaceBanner.vue';
import MarketplaceListEntry from './children/MarketplaceListEntry.vue';

const MARKETPLACE_CONTRACT = process.env.VUE_APP_MARKETPLACE_CONTRACT;

// XXX TODO: Fix pagination response
const LIMIT = 10;
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
    swapQuantity: null,
    swapContract: MARKETPLACE_CONTRACT,
    filters: {
      type: null,
      value: null
    },
    filteredSwaps: [],
    search: null,
    searchThreshold: null,
    loaded: false,
    title: 'Domains for Sale',
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
          await this.setTokenContract();
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

      // Enumerate swaps
      let total = await MarketplaceQuery.GetTotal('Sale', this.cwClient);
      if (!total) return;
      this.swapQuantity = parseInt(total);

      // Verify page needs loading
      if (this.swaps.length >= total) return;

      // Load swaps page
      if (this.page > (total / LIMIT)) this.page = Math.floor(total / LIMIT);
      let query = await MarketplaceQuery.GetListings(this.page, LIMIT, this.cwClient);
      
      if (!Array.isArray(query['swaps'])) return;
      else if (!query.swaps.length) return;
      this.swaps = [...this.swaps, ...query.swaps];
      // console.log('Swaps query', {
      //   query: query, 
      //   start: this.page,
      //   limit: LIMIT,
      //   swaps: this.swaps
      // });
    },

    // Filter
    filter: function (filters) {
      if (!this.swaps.length) return;
      this.page = 0;
      this.searchThreshold = null;
      this.filters = {type: null, value: null};
      this.filteredSwaps = [];
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
      } else if (filters.denom) {
        if (filters.denom == 0) return this.search = null;
        this._denomSearch(filters);
      } else if (filters.price) {
        this._priceSearch(filters);
      } else if (filters.reset) {
        this._searchReset();
      } else {
        if (this.search) this.search = null;
      }
    },
    listingType: async function (type) {
      if (this.listingTypes.indexOf(type) == -1) return;
      else if (type == this.context) return;
      else if (type == MY_LISTINGS && !this.accounts) return;
      else if (type == MY_LISTINGS && !this.accounts.length) return;
      this.page = 0;
      this.context = type;
      if (this.context == ALL_LISTINGS) {
        this.search = null;
        this.filters = {
          type: null,
          value: null
        };
        this.filteredSwaps = [];
        this.searchThreshold = null;
        await this.swapIds();
        return;
      }
      
      this._addressSearch(this.accounts[0].address);
    },
    _searchReset: async function () {
      this.filters.type = null;
      this.filters.value = null;
      this.filteredSwaps = [];
      this.search = null;
      this.searchThreshold = null;
    },
    _domainSearch: async function (filters) {
      let swapSearch = null;
      let textFilter = null;
      let domainSuffix = ".arch";
      this.page = 0;
      if (!this.cwClient || typeof filters !== 'object') return this.search = null;
      else if (!filters.text) return this.search = null;
      else if (filters.text.length < 5) textFilter = filters.text + domainSuffix;
      else if (filters.text.slice(-5) !== domainSuffix) textFilter = filters.text + domainSuffix;
      else textFilter = filters.text;
      try {
        swapSearch = await MarketplaceQuery.Details(textFilter, this.cwClient);
        if (swapSearch['error']) return this.filteredSwaps = [];
        else if (swapSearch['token_id']) this.filteredSwaps[this.page] = [swapSearch];
        else return this.filteredSwaps = [];
        this.search = true;
        this.filters.type = "Details";
        this.filters.value = textFilter;
        this.swapQuantity = (this.filteredSwaps[this.page]) ? this.filteredSwaps[this.page].length : 0;
      } catch(e) {
        console.error(`Swap search for ${filters.text} failed`, e);
        return;
      }
    },
    _addressSearch: async function (filters, page = 0) {
      let address = (typeof filters == 'string') ? filters : filters.text;
      this.page = page;
      // Load page
      let swapsQuery = await MarketplaceQuery.SwapsOf(address, "Sale", page, this.pageSize, this.cwClient);
      if (Array.isArray(swapsQuery.swaps)) {
        this.swapQuantity = parseInt(swapsQuery.total);
        this.filters.type = "SwapsOf";
        this.filters.value = address;
        this.filteredSwaps[page] = swapsQuery.swaps;
        this.search = true;
      }
    },
    _denomSearch: async function (filters, page = 0) {
      if (!filters.denom) return;
      let type;
      this.page = page;
      switch (parseInt(filters.denom)) {
        // ARCH
        case 1: {
          type = false;
          break;
        }
        // cw20
        case 2: {
          type = true;
          break;
        }
      }
      let swapsQuery = await MarketplaceQuery.SwapsByPaymentType(
        type, "Sale", 
        page, 
        this.pageSize, 
        this.cwClient
      );
      if (Array.isArray(swapsQuery.swaps)) {
        this.swapQuantity = parseInt(swapsQuery.total);
        this.filters.type = "SwapsByPaymentType"
        this.filters.value = filters.denom;
        this.filteredSwaps[page] = swapsQuery.swaps;
        this.search = true;
      }
    },
    _priceSearch: async function (filters, page = 0) {
      if (!filters.price) return;
      this.page = page;
      let min = ToAtto(filters.price.min, true);
      let max = ToAtto(filters.price.max, true);
      let swapsQuery = await MarketplaceQuery.SwapsByPrice(
        min,
        max,
        "Sale",
        page,
        this.pageSize,
        this.cwClient
      );
      if (Array.isArray(swapsQuery.swaps)) {
        this.swapQuantity = parseInt(swapsQuery.total);
        this.filters.type = "SwapsByPrice"
        this.filters.value = filters.price;
        this.filteredSwaps[page] = swapsQuery.swaps;
        this.search = true;
      }
    },

    // Handlers
    pageHandler: async function (page) {
      if (typeof page !== 'number') return;
      this._collapseListItems();
      this.page = page;
      if (this.search) await this.filterPageHandler();
      else await this.swapIds();
    },
    filterPageHandler: async function () {
      switch(this.filters.type) {
        case "SwapsOf": {
          await this._addressSearch(this.filters.value, this.page);
          break;
        }
        case "SwapsByPaymentType": {
          await this._denomSearch({ denom: this.filters.value }, this.page);
          break;
        }
        case "SwapsByPrice": {
          await this._priceSearch({ price: this.filters.value }, this.page);
          break;
        }
      }
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
    // and reset search and pagination arguments
    dataResolution: async function () {
      this._collapseListItems();
      let searchEl = document.getElementById('search_marketplace');
      if (searchEl) searchEl.value = null;
      this.search = null;
      this.swaps = [];
      this.filteredSwaps = [];
      this.page = 0;
      await this.swapIds();
    },
    async onChange(event) {
      if (!this.filteredSwaps || !this.search) return;
      let page = parseInt(event.target.value)
      this.pageHandler(page);
    },
  },
  computed: {
    totalPages: function () {
      // Searching
      if (this.search && !this.filteredSwaps) return 0;
      // Not searching / Default display
      else if (!this.swapQuantity) return 0;
      else return Math.ceil((this.swapQuantity / this.pageSize));
    },
    swapsList: function () {
      let swaps, start, end;
      if (this.search) {
        swaps = (this.filteredSwaps) ? this.filteredSwaps[this.page] : [];
        return swaps;
      }
      swaps = this.swaps;
      if (this.page == 0) {
        start = 0;
        end = this.pageSize;
      } else {
        start = (this.page * this.pageSize);
        end = (this.page * this.pageSize) + this.pageSize;
      }
      return swaps.slice(start, end);
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