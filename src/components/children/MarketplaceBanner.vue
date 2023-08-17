<template>
  <div class="marketplace-banner">
    <div class="title marketplace" v-if="title">
      <h3>{{title}}</h3>
    </div>
    <div class="search">
      <div class="type-filter left">
        <div class="button-group select-type" v-if="accounts">
          <a :class="{'active': market.type == contexts.all, 'btn-all-listings': true}" @click="listTypeHandler(contexts.all);">All</a>
          <a :class="{'active': market.type == contexts.user, 'btn-my-listings': true}" @click="listTypeHandler(contexts.user);">My Listings</a>
        </div>
      </div>
      <div class="text-filter right">
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
    },
  }),
  mounted: async function () {},
  methods: {
    listTypeHandler: function (type) {
      if (type !== 0 && type !== 1) type = 0;
      this.market.type = type;
      this.$emit('listingType', type);
    },
    textSearchHandler: function () {
      this.market.type = ALL_LISTINGS; 
      this.$emit('filter', this.search);
    },
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