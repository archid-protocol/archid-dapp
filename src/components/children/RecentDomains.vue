<template>
  <div class="recent-domains" v-if="loaded">
    <div class="recent-domain" v-for="(domain, i) in recentDomains" :key="i">
      <router-link class="badge-link home-badge btn" :to="'/domains/' + domain.extension.domain" v-if="domain.extension">
        <span class="badge-label domain" v-if="domain.extension.domain">{{ domain.extension.domain }}</span>&nbsp;
        <span class="badge-label time" v-if="domain.extension.created">{{ niceTime(domain.extension.created) }}</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { Config } from '../../util/query';
import { Token, Tokens, NumTokens, RecentDomains } from '../../util/token';

const LIMIT = 100;
const MS_DAY = 86_400_000;
const MS_HOUR = 3_600_000;
const MS_MINUTE = 60_000;
const MS_MONTH = MS_DAY * 30;
const MS_YEAR = MS_DAY * 365;

export default {
  props: {
    cwClient: Object,
    size: Number,
  },
  data: () => ({
    cw721: null,
    tokens: [],
    domains: [],
    loaded: false,
  }),
  mounted: async function () {
    await this.mintHistory();
    await this.domainData();
    // console.log('Domains list', this.domains);
  },
  methods: {
    setTokenContract: async function () {
      let cw721Query = await Config(this.cwClient);
      this.cw721 = cw721Query.cw721;
      return;
    },
    mintHistory: async function () {
      if (!this.cw721) await this.setTokenContract();
      let historyItems = await RecentDomains(this.cw721, this.cwClient);
      // Order by most recent minted
      historyItems.reverse();

      // Parse minting history
      let recentMints = [];
      let size = (historyItems.length > this.size) ? this.size : historyItems.length;
      for (let i = 0; i < size; i++) {
        if (!historyItems[i]['events']) continue;
        let events = historyItems[i].events;
        for (let j = 0; j < events.length; j++) {
          let event = events[j];
          if (!event['type']) continue;
          else if (event.type !== 'wasm') continue;
          else if (!Array.isArray(event['attributes'])) continue;
          for (let k = 0; k < event.attributes.length; k++) {
            let attribute = event.attributes[k];
            if (!attribute['key'] || !attribute['value']) continue;
            if (attribute.key == 'token_id') {
              if (recentMints.indexOf(attribute.value) == -1) recentMints.push(attribute.value);
            }
          }
        }
        if (i == (size - 1)) this.tokens = recentMints;
      }
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
          let query = await Tokens(this.cw721, this.cwClient, LIMIT, start);
          if (query['tokens']) this.tokens = [...this.tokens, ...query.tokens];
        }
      } else {
        let query = await Tokens(this.cw721, this.cwClient);
        this.tokens = (query['tokens']) ? query.tokens : [];
      }
      // console.log('Tokens query', this.tokens);
    },
    tokenData: async function (id = null) {
      if (!id || typeof id !== 'string') return;
      if (!this.cw721) await this.setTokenContract();
      let token = await Token(id, this.cw721, this.cwClient);
      return token;
      // console.log('Token query', this.token);
    },
    domainData: async function () { // XXX TODO: Replace this with an API and remove frontend data parsing
      if (!this.tokens) return;
      if (!Array.isArray(this.tokens)) return;
      if (this.domains.length) this.domains = [];
      this.tokens.forEach(async (tokenId, i) => {
        let domainRecord = await this.tokenData(tokenId);
        this.domains.push(domainRecord);
        if ((i+1) == this.tokens.length) this.loaded = true;
      });
    },
    niceTime: function (time = null) {
      if (!time || typeof time !== 'number') return '';
      const timeObj = new Date((time * 1000));
      const differenceMs = Math.abs(new Date() - timeObj);
      let val, ret;
      if (differenceMs >= MS_YEAR) {
        val = Math.floor(differenceMs / MS_YEAR);
        ret = (val > 1) ? String(val) + ' year ago' : String(val) + ' years ago';
      } else if (differenceMs >= MS_MONTH) {
        val = Math.floor(differenceMs / MS_MONTH);
        ret = (val > 1) ? String(val) + ' month ago' : String(val) + ' months ago';
      } else if (differenceMs >= MS_DAY) {
        val = Math.floor(differenceMs / MS_DAY);
        ret = (val > 1) ? String(val) + ' days ago' : String(val) + ' day ago';
      } else if (differenceMs >= MS_HOUR) {
        val = Math.floor(differenceMs / MS_HOUR);
        ret = (val > 1) ? String(val) + ' hours ago' : String(val) + ' hour ago';
      } else {
        val = Math.floor(differenceMs / MS_MINUTE);
        if (val < 1) {
          ret = '1 minute ago';
        } else {
          ret = (val > 1) ? String(val) + ' minutes ago' : String(val) + ' minute ago';
        }
      }
      return ret;
    }
  },
  computed: {
    recentDomains: function () {
      if (!this.domains || !this.size) return [];
      if (!Array.isArray(this.domains)) return [];
      let sortedDomains = this.domains.slice(0).sort((a,b) => {
        if (!a['extension'] || !b['extension']) return false;
        else return b.extension.created - a.extension.created;
      });
      return sortedDomains.slice(0, this.size);
    },
  }
}
</script>

<style scoped>
.recent-domains, .recent-domain, .badge {
  display: inline-block;
}
.home-badge {
  margin-right: 1em;
  margin-top: 1em;
  border-radius: 8px;
  align-items: center;
  padding: 16px;
  gap: 10px;
  min-width: 218px;
  height: 56px;
  background: #FFFFFF;
}
.badge-label.domain {
  color: #666666;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  letter-spacing: -0.01em;
}
.badge-label.time {
  font-size: 12px;
  color: #777777;
  font-style: normal;
  font-weight: 400;
  line-height: 120%;
}
.badge-link {
  color: inherit;
  text-decoration: inherit;
}
</style>