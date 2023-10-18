<template>
  <div class="marketplace-banner">
    <div class="title marketplace" v-if="title">
      <h3>{{title}}</h3>
    </div>
    <div class="search row">
      <div class="type-filter left col">
        <div class="button-group select-type" v-if="accounts">
          <a :class="{'active': market.type == contexts.all, 'btn-all-listings': true}" @click="listTypeHandler(contexts.all);">All</a>
          <a :class="{'active': market.type == contexts.user, 'btn-my-listings': true}" @click="listTypeHandler(contexts.user);">My Listings</a>
        </div>
      </div>
      <div class="adv-filter middle col">
        <!-- Denom Filters -->
        <div :class="{'denom-filter': true, 'active': contexts.filters == filterContext.contexts[1]}">
          <div class="col">{{ filters.denom.labels[filters.denom.selectedFilter] }}</div>
          <div 
            :class="{'caret': true, 'col': true, 'active': contexts.filters == filterContext.contexts[1]}" 
            @click="contexts.filters = (contexts.filters == filterContext.contexts[1]) ? filterContext.contexts[0] : filterContext.contexts[1]"
          >&caron;</div>
        </div>
        <div class="denom-select" v-if="contexts.filters == filterContext.contexts[1]">
          <ul class="tip row">
            <li>
              <input class="form-check-input" type="radio" value="0" v-model="filters.denom.selectedFilter">
              <label>All</label>
            </li>
            <li>
              <input class="form-check-input" type="radio" value="1" v-model="filters.denom.selectedFilter">
              <label>Native</label>
              <p class="descr">ARCH</p>
            </li>
            <li>
              <input class="form-check-input" type="radio" value="2" v-model="filters.denom.selectedFilter">
              <label>CW20</label>
              <p class="descr">ARCH Based Derivatives</p>
            </li>
          </ul>
        </div>
        <!-- Price Range Filters -->
        <div :class="{'price-filter': true, 'active': contexts.filters == filterContext.contexts[2]}">
          <div class="col">
            <div v-if="!filters.price.min || !filters.price.max">Price</div>
            <div v-else>{{ filters.price.min }}-{{ filters.price.max }} ARCH</div>
          </div>
          <div 
            :class="{'caret': true, 'col': true, 'active': contexts.filters == filterContext.contexts[2]}"
            @click="contexts.filters = (contexts.filters == filterContext.contexts[2]) ? filterContext.contexts[0] : filterContext.contexts[2]"
          >&caron;</div>
        </div>
        <div class="price-select" v-if="contexts.filters == filterContext.contexts[2]">
          <div class="row">
            <div class="col from">
              <label>From</label>
              <input 
                class="form-control" 
                type="number" 
                min="0"
                placeholder="0" 
                @change="priceFilterHandler()" 
                v-model="filters.price.min"
              >
            </div>
            <div class="col to">
              <label>To</label>
              <input 
                class="form-control" 
                type="number" 
                :min="maxPriceMinimum"
                placeholder="0" 
                @change="priceFilterHandler()" 
                v-model="filters.price.max"
              >
            </div>
          </div>
        </div>
      </div>
      <div class="text-filter right col">
        <input 
          id="search_marketplace"
          type="text" 
          placeholder="Search domain name, Archway address"
          class="domain form-control"
          name="domain"
          @keyup="textSearchHandler"
          v-model="search.text"
        />
      </div>
    </div>
  </div>
</template>

<script>
const ALL_LISTINGS = 0;
const MY_LISTINGS = 1;

const NO_FILTER = 0;
const DENOM_FILTER = 1;
const PRICE_RANGE_FILTER = 2;
const DENOM_FILTERS = ["ARCH", "cw20", "sARCH", "xARCH", "ampARCH"];
const DENOM_LABELS = ["All Tokens", "ARCH", "CW20 Tokens", ...DENOM_FILTERS.slice(2)];

export default {
  props: {
    title: String,
    accounts: Object,
  },
  emits: ['filter','listingType'],
  data: () => ({
    search: {
      text: null,
    },
    market: {
      type: ALL_LISTINGS,
    },
    contexts: {
      all: ALL_LISTINGS,
      user: MY_LISTINGS,
      filters: NO_FILTER,
    },
    filters: {
      denom: {
        arch: DENOM_FILTERS[0],
        cw20: DENOM_FILTERS[1],
        cw20s: DENOM_FILTERS.slice(2),
        filters: DENOM_FILTERS,
        labels: DENOM_LABELS,
        selectedFilter: NO_FILTER,
      },
      price: {
        min: null,
        max: null,
      }
    },
    filterContext: {
      denom: NO_FILTER,
      price: NO_FILTER,
      contexts: [NO_FILTER, DENOM_FILTER, PRICE_RANGE_FILTER],
    }
  }),
  watch: {
    denomFilter() {
      this.market.type = ALL_LISTINGS;
      this.filters.price = { min: null, max: null };
      this.filterContext.price = NO_FILTER;
      this.filterContext.denom = DENOM_FILTER;

      // console.log(this.filters.denom.labels[this.denomFilter]);
      let denomFilter = {
        denom: this.denomFilter
      };
      this.$emit('filter', denomFilter);
    },
  },
  mounted: async function () {},
  methods: {
    listTypeHandler: function (type) {
      if (type !== 0 && type !== 1) type = 0;
      this.market.type = type;
      this.filters.denom.selectedFilter = NO_FILTER;
      this.filters.price = { min: null, max: null };
      this.filterContext.denom = NO_FILTER;
      this.filterContext.price = NO_FILTER;
      this.$emit('listingType', type);
    },
    textSearchHandler: function () {
      this.market.type = ALL_LISTINGS;
      this.filters.denom.selectedFilter = NO_FILTER;
      this.filters.price = { min: null, max: null };
      this.filterContext.denom = NO_FILTER;
      this.filterContext.price = NO_FILTER;
      this.$emit('filter', this.search);
    },
    priceFilterHandler: function () {
      if (!this.filters.price.min || !this.filters.price.max) return;
      this.market.type = ALL_LISTINGS;
      this.filters.denom.selectedFilter = NO_FILTER;
      this.filterContext.denom = NO_FILTER;
      this.filterContext.price = PRICE_RANGE_FILTER;
      let min = (this.filters.price.min > this.filters.price.max) ? this.filters.price.max : this.filters.price.min;
      let max = (this.filters.price.max < this.filters.price.min) ? this.filters.price.min : this.filters.price.max;
      let filter = {price: {min, max}};
      this.$emit('filter', filter);
    }
  },
  computed: {
    denomFilter() {
      return this.filters.denom.selectedFilter;
    },
    maxPriceMinimum() {
      let min = (this.filters.price.min) ? this.filters.price.min : 0;
      return (min + 1);
    }
  }
}
</script>

<style scoped>
.marketplace-banner {
  padding: 1.25em;
  background: #FF4D00;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 1em;
  height: 325px;
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
.type-filter.left,
.adv-filter {
  position: relative; 
  top: 10px;
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
.denom-filter, .price-filter {
  gap: 8px;
  display: inline-block;
  padding: 12px 16px;
  border-radius: 8px;
  color: #666666;
  box-sizing: border-box;
  border-radius: 8px;
  border: 1px solid #F2EFED;
  height: 56px;
  width: 45%;
  margin-right: 1em;
}
.denom-filter.active, .price-filter.active {
  border-color: #FF4D00;
}
.denom-filter .caret, .price-filter .caret {
  position: relative;
  top: -20px;
}
.denom-filter .caret.active, .price-filter .caret.active {
  top: -45px;
}
.denom-select, .price-select {
  position: absolute;
  box-sizing: border-box;
  padding-top: 8px;
  gap: 8px;
  color: #000000;
  border-radius: 8px;
  background: #ffffff;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
  display: flex;
  min-width: 252px;
  padding: 16px;
  flex-direction: column;
  align-items: flex-end;
  border: 1px solid #F2EFED;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
}
.price-select .row {
  margin-bottom: 1em;
}
.denom-select ul, .price-select ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
ul.tip li {
  display: flex;
  padding: 18px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
  border-radius: 8px;
}
ul.tip li:not(:last-of-type) {
  border-bottom: 1px solid #F2EFED;
}
ul.tip li p.descr {
  color: #666666;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 120%;
}
input.form-check-input {
  cursor: pointer;
  display: flex;
  width: 24px;
  height: 24px;
  padding: 8px;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
input.form-check-input:checked {
  background-image: none;
  background-color: #FF4D00;
  border-color: #666666;
}
input.form-check-input:focus {
  box-shadow: none;
}
.from input, .to input {
  margin-top: 12px;
}
.btn.search-price {
  right: 12px;
  position: relative;
}
</style>