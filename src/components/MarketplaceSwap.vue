<template>
    <div class="page">
    <div class="domain-banner" v-if="domain && cw721">
      <DomainBanner
        v-bind:domain="domain"
        v-bind:cw721="cw721"
        v-bind:cwClient="cwClient"
        :key="renderBanner"
      >
      </DomainBanner>
    </div>

    <div class="swap-data" v-if="domain && swap">
      <ul>
        <li>
          <MarketplaceListEntry
            v-bind:domain="domain"
            v-bind:parentDetails="swap"
            v-bind:accounts="accounts"
            v-bind:cw721="cw721"
            v-bind:cwClient="cwClient"
            v-bind:collapsible="false"
            @dataResolution="dataResolution"
            :key="domain"
          >
          </MarketplaceListEntry>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { Config } from '../util/query';
import { Query as MarketplaceQuery } from '../util/marketplace';

import DomainBanner from './children/DomainBanner.vue';
import MarketplaceListEntry from './children/MarketplaceListEntry.vue';

export default {
  name: 'Swap',
  components: { DomainBanner, MarketplaceListEntry },
  data: () => ({
    cwClient: null,
    accounts: null,
    config: null,
    cw721: null,
    domain: null,
    swap: null,
    renderBanner: 0,
  }),
  mounted: async function () {
    if (window) this.resumeConnectedState();
    this.domain = this.$route.params.id;
    await this.swapData();
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
          // Load swap data
          await this.setTokenContract();
        }, 100);
      } catch (e) {
        await this.resumeConnectedState((attempts + 1));
      }
    },
    dataResolution: async function () {
      this.renderBanner += 1;
    },

    // Query
    setTokenContract: async function () {
      this.config = await Config(this.cwClient);
      this.cw721 = this.config.cw721;
      return;
    },
    swapData: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      this.swap = await MarketplaceQuery.Details(this.domain, this.cwClient);
      // if (!this.swap['error']) console.log('Details query (swap)', this.swap);
    },
  },
}
</script>

<style scoped>
div.domain-banner {
  border: 1px solid #F2EFED;
  border-radius: 8px;
  margin-bottom: 1.75em;
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
</style>