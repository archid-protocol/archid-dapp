<template>
    <div class="welcome">
        <div class="title">
            <div class="ln-1">Hello <span class="your-name">{{ account.slice(0,11) }}</span>,</div>
            <div class="ln-2">This is who you are</div>
            <div class="ln-3">in Archway</div>
        </div>
        <div class="subtitle">
            <p>A social social security number is how official sources identify you, but not how you introduce yourself. You do it with your name. Start using your ArchID instead of an unmemorable string to idenify yourself in Archway.</p>
        </div>
        <div class="search">
            <input 
                type="text" 
                placeholder="Your name"
                class="domain"
                name="domain"
                @keyup="searchHandler"
                v-model="search.input"
            />
            <input 
                type="text"
                value=".arch"
                class="domain-suffix"
                readonly
            />
            <div class="search-result" v-if="search.result">
                <p>{{ search.result }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { Config } from '../../util/query';
import { Tokens } from '../../util/token';

export default {
  props: {
    account: String,
    cwClient: Object,
  },
  data: () => ({
    cw721: null,
    tokens: null,
    search: {
        input: null,
        result: null
    },
  }),
  mounted: async function () {
    await this.tokenIds();
  },
  methods: {
    setTokenContract: async function () {
      let cw721Query = await Config(this.cwClient);
      this.cw721 = cw721Query.cw721;
      return;
    },
    tokenIds: async function () {
      if (!this.cw721) await this.setTokenContract();
      let query = await Tokens(this.cw721, this.cwClient);
      this.tokens = (query['tokens']) ? query.tokens : [];
      console.log('Tokens query', this.tokens);
    },
    searchWorker: function (text = null) {
        if (!this.tokens) return '';
        if (!this.tokens.length) return '';
        if (!text) return '';
        if (typeof text !== 'string') return '';
        let searchText = text.replace(/[^a-z0-9-]/g,'') + '.arch';
        if (this.tokens.indexOf(searchText) >= 0) {
            return searchText + ' is taken';
        } else {
            return searchText + ' is available';
        }
    },
    searchHandler: function () {
        this.search.result = null;
        if (!this.search.input || typeof this.search.input !== 'string') return;
        if (this.search.input.length < 3) return;
        this.search.result = this.searchWorker(this.search.input);
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
input.domain-suffix, input.domain-suffix:focus, input.domain-suffix:active {
    background: transparent;
    color: inherit;
    border: none;
}
</style>