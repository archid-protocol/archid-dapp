<template>
  <div :class="{'welcome': true, 'banner': true, 'sm': search.result}" v-if="account" :style="'background-image: url(' + computedBanner + ');'">
    <div class="details" v-if="!search.result">
      <div class="title">
        <div class="ln-1">Hello, <span class="your-name">{{ account.slice(0,12) }}</span></div>
        <div class="ln-2">This is who you are</div>
        <div class="ln-3">in Archway</div>
      </div>
      <div class="subtitle">
        <p>A social security number is how official sources identify you, but not how you introduce yourself. You do that with your name. Start using your ArchID instead of an unmemorable string to identify yourself in Archway.</p>
      </div>
    </div>
    <div class="search" v-if="!isReadOnlyClient(cwClient)">
      <input 
        id="domain"
        type="text" 
        placeholder="Your name"
        class="domain form-control"
        name="domain"
        @keyup="searchHandler"
        v-model="search.input"
      />
      <span class="domain-suffix">.arch</span>
    </div>
    <div class="connect" v-if="isReadOnlyClient(cwClient)">
      <button class="btn btn-inverse btn-connect" @click="connectHandler();">Connect & Register domain</button>
    </div>
  </div>
  <div class="search-result outer" v-if="search.result">
    <div class="search-result inner">
      <div class="result left" v-html="search.result"></div>
      <div class="result right" v-if="config.base_cost">
        <div class="cost" v-if="!registration.taken">{{ formatFromAtto(config.base_cost) }}<span class="icon icon-denom-alt"></span> / year</div>
        <!-- 
        XXX TODO: Implement USD price when price feeds become available
        <div class="cost-usd"></div> 
        -->
      </div>
    </div>
    <hr />
    <div class="explainer" v-if="!registration.taken && !registration.expired">
      <p class="focus">This domain is who you are in Archway.</p>
      <p class="descr">.arch domains can be registered for 1, 2 or 3 years.</p>
      <p class="descr">Unlimited subdomains can be created for your applications and addresses.</p>
      <p class="descr">You can add and verify the ownership of applications as well as add your social profiles to this domain.</p>
    </div>
    <div class="taken-domain-data" v-if="registration.taken">
      <div class="left">
        <p>Registration Date</p>
        <p v-if="registration.taken.extension.created">{{ niceDate(registration.taken.extension.created, true) }}</p>
      </div>
      <div class="right">
        <p>Expiration Date</p>
        <p v-if="registration.taken.extension.expiry">{{ niceDate(registration.taken.extension.expiry) }}</p>
      </div>
      <div class="read-more">
        <router-link class="domain-link" :to="'/domains/' + registration.taken.extension.domain">More info</router-link>
      </div>
    </div>
    <div class="taken-domain-data" v-if="!registration.taken && registration.expired">
      <p class="focus">The domain record for {{registration.expired.extension.domain}} is expired.</p>
      <div class="left">
        <p>Registration Date</p>
        <p v-if="registration.expired.extension.created">{{ niceDate(registration.expired.extension.created) }}</p>
      </div>
      <div class="right">
        <p>Expired On</p>
        <p v-if="registration.expired.extension.expiry">{{ niceDate(registration.expired.extension.expiry) }}</p>
      </div>
      <div class="read-more">
        <router-link class="domain-link" :to="'/domains/' + registration.expired.extension.domain">More info</router-link>
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
          <div class="cost">{{ formatFromAtto((config.base_cost * registration.expiry)) }}<span class="icon icon-denom-alt"></span></div>
          <button class="btn btn-primary btn-register" @click="registrationHandler();">Register</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Config } from '../../util/query';
import { Token } from '../../util/token';
import { DateFormat, IsExpired } from '../../util/datetime';
import { FromAtto } from '../../util/denom';

export default {
  props: {
    account: String,
    cwClient: Object,
  },
  emits: ['registration'],
  data: () => ({
    config: null,
    cw721: null,
    tokens: [],
    search: {
      input: null,
      result: null
    },
    registration: {
      domain: null,
      expiry: 1,
      taken: false,
      expired: false
    },
    niceDate: DateFormat,
    formatFromAtto: FromAtto,
    welcomeBannerBg: '/img/homebanner.svg',
  }),
  mounted: async function () {},
  methods: {
    connectHandler: function () {
      const connectEl = document.getElementById('connect_modal');
      connectEl.click();
    },
    setTokenContract: async function () {
      this.config = await Config(this.cwClient);
      this.cw721 = this.config.cw721;
      return;
    },
    tokenData: async function (id = null) {
      if (!id || typeof id !== 'string') return;
      if (!this.cw721) await this.setTokenContract();
      let token = await Token(id, this.cw721, this.cwClient);
      return token;
      // console.log('Token query', this.token);
    },
    searchWorker: async function (text = null) {
      this.registration.taken = false;
      if (!this.tokens) return '';
      if (!text) return '';
      if (typeof text !== 'string') return '';
      let rawText = text.toLowerCase().replace(/[^a-z0-9-]/g,'');
      let searchText = rawText + '.arch';
      let tokenSearch = null;
      let isTaken = null;

      try {
        if (!this.cw721) await this.setTokenContract();
        tokenSearch = await Token(searchText, this.cw721, this.cwClient);
        isTaken = (tokenSearch['extension']) ? true : false;
        // console.log('tokenSearch?', tokenSearch, isTaken);
      } catch(e) {
        console.error(`Token search for ${searchText} failed`, e);
        return;
      }

      if (isTaken) {
        // Check validity of expiration
        let token = tokenSearch;
        // Expired domain available
        if (IsExpired(token.extension.expiry)) {
          this.registration.domain = rawText;
          this.registration.expired = token;
          return '<span class="icon icon-available"></span><span class="search-target">' + searchText + '</span> is available';
        }
        // Domain unavailable
        this.registration.taken = token;
        return '<span class="icon icon-not-available"></span><span class="search-target">' + searchText + '</span> is not available';
      } else {
        // Domain available
        this.registration.domain = rawText;
        return '<span class="icon icon-available"></span><span class="search-target">' + searchText + '</span> is available';
      }
    },
    searchHandler: async function () {
      this.search.result = null;
      if (!this.search.input || typeof this.search.input !== 'string') return;
      if (this.search.input.length < 3) return;
      this.search.result = await this.searchWorker(this.search.input);
    },
    updateSelectedDomain: async function (id = null) {
      if (typeof id !== 'string') return;
      let token = await this.tokenData(id);
      // console.log('updateSelectedDomain', token);
      return token;
    },
    registrationHandler: function () {
      let registration = {
        name: this.registration.domain,
        expiry: this.registration.expiry,
        base_cost: Number(this.config.base_cost),
      };
      this.$emit('registration', registration);
    },
    isReadOnlyClient(client) {
      if (!client) return true;
      if (client['readOnly']) return true;
      else return false;
    },
  },
  computed: {
    computedBanner: function () {
      let banner = (!this.search.result) ? this.welcomeBannerBg : 'none';
      return banner;
    },
  },
}
</script>

<style scoped>
.welcome {
  padding: 4em;
  padding-bottom: 1.5em;
  background: #FF4D00;
  background-repeat: no-repeat;
  background-size: 450px;
  background-position: right 37px;
  color: #fff;
  border-radius: 8px;
}
.welcome .details {
  margin-top: 175px;
}
.welcome:not(.sm) .search {
  position: relative;
  top: 3em;
}
.welcome.sm .search {
  margin-top: 1em;
}
.title div, span.your-name {
  font-style: normal;
  font-weight: 600;
  font-size: 76px;
  line-height: 100%;
}
span.your-name {
  background-image: linear-gradient(90deg,#fff 0%,rgba(0,0,0,0));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  display: inline-block;
  opacity: 0.7;
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

.submit .cost, .search-result .result {
  font-weight: 500;
  font-size: 32px;
  line-height: 130%;
  display: inline-block;
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
.submit.register {
  float: right;
  min-width: 230px;
  text-align: right;
}
.submit.register, .submit.register div {
  display: inline-block;
}
.submit.register div {
  margin-right: 5px;
  position: relative;
}
.taken-domain-data .right, .taken-domain-data .left {
  width: 50%;
  display: inline-block;
}
input.domain {
  display: inline-block;
  padding: 16px;
  height: 65px;
}
div.subtitle {
  max-width: 655px;
  margin-right: auto;
  margin-top: 1em;
  margin-bottom: 1em;
}
div.subtitle p {
  font-weight: 400;
  /* font-size: 16px; */
  font-size: 18px;
  line-height: 150%;
  align-items: center;
  letter-spacing: -0.01em;
}
.icon-denom-alt {
  margin-left: 9px;
}
.btn-register {
  top: -5px;
  position: relative;
}
</style>