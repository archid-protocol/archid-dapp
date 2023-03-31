<template>
  <div class="welcome" v-if="account">
    <div class="details" v-if="!search.result">
      <div class="title">
        <div class="ln-1">Hello <span class="your-name">{{ account.slice(0,11) }}</span>,</div>
        <div class="ln-2">This is who you are</div>
        <div class="ln-3">in Archway</div>
      </div>
      <div class="subtitle">
        <p>A social social security number is how official sources identify you, but not how you introduce yourself. You do it with your name. Start using your ArchID instead of an unmemorable string to idenify yourself in Archway.</p>
      </div>
    </div>
    <div class="search" v-if="cwClient">
      <input 
        type="text" 
        placeholder="Your name"
        class="domain form-control"
        name="domain"
        @keyup="searchHandler"
        v-model="search.input"
      />
      <span class="domain-suffix">.arch</span>
    </div>
    <div class="connect" v-if="!cwClient">
      <button class="btn btn-primary btn-connect" @click="connectHandler();">Connect & Register domain</button>
    </div>
  </div>
  <div class="search-result outer" v-if="search.result">
    <div class="search-result inner">
      <div class="result left" v-html="search.result"></div>
      <div class="result right" v-if="config.base_cost">
        <div class="cost" v-if="!registration.taken">{{ formatFromMicro(config.base_cost) }}<span class="arch-logo">arch</span> / year</div>
        <!-- 
        XXX TODO: Implement USD price when price feeds become available
        <div class="cost-usd"></div> 
        -->
      </div>
    </div>
    <hr />
    <div class="explainer" v-if="!registration.taken">
      <p class="focus">This domain is who you are in Archway.</p>
      <p class="descr">.arch domains can be registered for 1, 2 or 3 years.</p>
      <p class="descr">Unlimited subdomains can be created for your applications and addresses.</p>
      <p class="descr">You can add and verify the ownership of applications as well as social profiles to this domain.</p>
    </div>
    <div class="taken-domain-data" v-if="registration.taken">
      <div class="left">
        <p>Registration Date</p>
        <p v-if="registration.taken.extension.created">{{ niceDate(registration.taken.extension.created) }}</p>
      </div>
      <div class="right">
        <p>Expiration Date</p>
        <p v-if="registration.taken.extension.expiry">{{ niceDate(registration.taken.extension.expiry) }}</p>
      </div>
      <div class="read-more">
        <router-link class="domain-link" :to="'/domains/' + registration.taken.extension.domain">More info</router-link>
      </div>
    </div>
    <div class="mintable" v-if="!registration.taken">
      <hr />
      <div class="register-ctrl">
        <div class="button-group select-expiry">
          <a :class="{'active': registration.expiry == 1, 'btn-1year': true}" @click="registration.expiry = 1;">1 year</a>
          <a :class="{'active': registration.expiry == 2, 'btn-2year': true}" @click="registration.expiry = 2;">2 years</a>
          <a :class="{'active': registration.expiry == 3, 'btn-3year': true}" @click="registration.expiry = 3;">3 years</a>
        </div>
        <div class="submit register">
          <div class="cost">{{ formatFromMicro((config.base_cost * registration.expiry)) }}<span class="arch-logo">arch</span></div>
          <button class="btn btn-register" @click="registrationHandler();">Register</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Config } from '../../util/query';
import { Token, Tokens } from '../../util/token';
import { FromMicro } from '../../util/denom';

export default {
  props: {
    account: String,
    cwClient: Object,
  },
  emits: ['registration'],
  data: () => ({
    config: null,
    cw721: null,
    tokens: null,
    search: {
      input: null,
      result: null
    },
    registration: {
      domain: null,
      expiry: 1,
      taken: false,
    },
    formatFromMicro: FromMicro,
  }),
  mounted: async function () {
    if (this.$root.connected) await this.tokenIds();
  },
  methods: {
    connectHandler: function () {
      const connectEl = document.getElementById('connect_modal');
      console.log(connectEl);
      connectEl.click();
    },
    setTokenContract: async function () {
      this.config = await Config(this.cwClient);
      this.cw721 = this.config.cw721;
      return;
    },
    tokenIds: async function () {
      if (!this.cw721) await this.setTokenContract();
      let query = await Tokens(this.cw721, this.cwClient);
      this.tokens = (query['tokens']) ? query.tokens : [];
      console.log('Tokens query', this.tokens);
    },
    tokenData: async function (id = null) {
      if (!id || typeof id !== 'string') return;
      if (!this.cw721) await this.setTokenContract();
      let token = await Token(id, this.cw721, this.cwClient);
      return token;
      // console.log('Token query', this.token);
    },
    searchWorker: function (text = null) {
      this.registration.taken = false;
      if (!this.tokens) return '';
      if (!this.tokens.length) return '';
      if (!text) return '';
      if (typeof text !== 'string') return '';
      let rawText = text.replace(/[^a-z0-9-]/g,'');
      let searchText = rawText + '.arch';
      if (this.tokens.indexOf(searchText) >= 0) {
        this.updateSelectedDomain(this.tokens[this.tokens.indexOf(searchText)]);
        return '<span class="search-target">' + searchText + '</span> is not available';
      } else {
        this.registration.domain = rawText;
        return '<span class="search-target">' + searchText + '</span> is available';
      }
    },
    searchHandler: function () {
      this.search.result = null;
      if (!this.search.input || typeof this.search.input !== 'string') return;
      if (this.search.input.length < 3) return;
      this.search.result = this.searchWorker(this.search.input);
    },
    updateSelectedDomain: async function (id = null) {
      if (typeof id !== 'string') return;
      this.registration.taken = await this.tokenData(id);
      console.log('taken', this.registration.taken);
    },
    registrationHandler: function () {
      let registration = {
        name: this.registration.domain,
        expiry: this.registration.expiry,
        base_cost: this.config.base_cost,
      };
      this.$emit('registration', registration);
    },
    niceDate: function(seconds) {
      let date = new Date((seconds * 1000));
      return date.toLocaleDateString(
          'en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}
      ) + ' at ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    },
  },
}
</script>

<style scoped>
.welcome {
  padding: 4em;
  background: #FF4D00;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 1em;
}
.title, .title div {
  text-transform: uppercase;
}
span.domain-suffix {
  margin-left: -54px;
  color: #666666;
}
.search-result.outer {
  border: 1px solid #F2EFED;
  padding: 32px;
  gap: 32px;
  margin-bottom: 1em;
}
.search-result.inner, .register-ctrl {
  clear: both;
}
.search-result .result {
  font-weight: 500;
  font-size: 32px;
  line-height: 130%;
  display: inline-block;
  width: 50%;
}
.search-result .result.right {
  float: right;
  text-align: right;
}
hr {
  margin-top: 2em;
  margin-bottom: 2em;
  clear: both;
}
.button-group {
  border-radius: 4px;
  padding: 1em;
  border: 1px solid #F2EFED;
  display: inline-block;
}
.button-group a {
  padding: 0.75em;
  margin-right: 1em;
  cursor: pointer;
}
.button-group a.active {
  color: #FF4D00;
}
.submit.register {
  float: right;
}
.submit.register, .submit.register div {
  display: inline-block;
}
.submit.register div {
  margin-right: 1em;
}
.taken-domain-data .right, .taken-domain-data .left {
  width: 50%;
  display: inline-block;
}
input.domain {
  display: inline-block;
}
</style>
<style>
.search-target {
  color: #FF4D00;
}
</style>