<template>
  <div class="domain-banner">
    <div class="title" v-if="title">
      <h3>{{title}}</h3>
    </div>
    <div class="search">
      <div class="type-filter left" v-if="context == contexts.user">
        <div class="button-group select-expiry">
          <a :class="{'active': search.type == 0, 'btn-all-domains': true}" @click="typeSearchHandler(0);">All</a>
          <a :class="{'active': search.type == 1, 'btn-active-domains': true}" @click="typeSearchHandler(1);">Active</a>
          <a :class="{'active': search.type == 2, 'btn-expired-domains': true}" @click="typeSearchHandler(2);">Expired</a>
        </div>
      </div>
      <div class="token-info left" v-if="context == contexts.all">
        <p v-if="!search.text"><strong>Total domains:</strong><br/>{{ totalDomains }}</p>
      </div>
      <div class="text-filter right">
        <input 
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
const ALL_DOMAINS_CONTEXT = 0;
const MY_DOMAINS_CONTEXT = 1;

export default {
  props: {
    title: String,
    context: Number,
    collectionSize: Number,
  },
  emits: ['filter'],
  data: () => ({
    search: {
      text: null,
      type: 0,
    },
    contexts: {
      all: ALL_DOMAINS_CONTEXT,
      user: MY_DOMAINS_CONTEXT,
    },
  }),
  mounted: async function () {},
  methods: {
    typeSearchHandler: function (type) {
      if (typeof this.search.type !== 'number') return;
      this.search.type = type;
      this.$emit('filter', this.search);
    },
    textSearchHandler: function () {
      this.$emit('filter', this.search);
    },
  },
  computed: {
    totalDomains: function () {
      if (typeof this.collectionSize !== 'number') return '';
      else return this.collectionSize.toLocaleString();
    }
  }
}
</script>

<style scoped>
.domain-banner {
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