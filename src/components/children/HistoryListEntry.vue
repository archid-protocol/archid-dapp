<template>
  <div class="history history-item row" v-if="events.length">
    <div class="col type">
      <p v-if="history.type"><span :class="{'icon': true, 'icon-domain-history-plus': (history.type == 'mint' || history.type == 'mint_subdomain' || history.type == 'renew_domain'), 'icon-domain-history-metadata': history.type == 'update_metadata', 'icon-domain-history-minus': history.type == 'remove_subdomain'}"></span>{{ formatTypeLabel(history.type) }}</p>
    </div>
    <div class="col height">
      <p v-if="history.block">
        <a :href="heightExplorerPrefix + history.block" target="_blank">{{history.block}}</a>
      </p>
    </div>
    <div class="col view-explorer">
      <p v-if="history.tx">
        <a class="explorer-link" :href="txExplorerPrefix + history.tx" target="_blank">View on explorer</a>
      </p>
    </div>
  </div>
</template>

<script>
import { IsTestnet } from '../../util/cosmwasm';

const TYPE_LABELS = {
  mint: "Domain registered.",
  mint_subdomain: "Subdomain registered.",
  burn: "Subdomain removed.",
  remove_subdomain: "Subdomain removed.",
  update_metadata: "Metadata updated.",
  renew_domain: "Registration renewed"
};

const TX_EXPLORER_PREFIX = (IsTestnet) ? "https://testnet.mintscan.io/archway-testnet/txs/" : "https://mintscan.io/archway/txs/";
const HEIGHT_EXPLORER_PREFIX = (IsTestnet) ? "https://testnet.mintscan.io/archway-testnet/blocks/" : "https://mintscan.io/archway/blocks/";

export default {
  props: {
    domain: String,
    historyItem: Object,
  },
  data: () => ({
    events: [],
    txExplorerPrefix: TX_EXPLORER_PREFIX,
    heightExplorerPrefix: HEIGHT_EXPLORER_PREFIX,
  }),
  mounted: async function () {
    if (this.historyItem['events']) this.events = this.historyItem.events;
  },
  methods: {
    formatTypeLabel: function (type = null) {
      if (!type) return '';
      else if (!TYPE_LABELS[type]) return '';
      else return TYPE_LABELS[type];
    }
  },
  computed: {
    history: function () {
      if (!this.historyItem) return {};
      else if (!this.historyItem['height'] || !this.historyItem['hash']) return {};
      if (!Array.isArray(this.events)) return {};
      else if (!this.events.length) return {};

      let historyEntry = {
        type: null,
        block: this.historyItem.height,
        tx: this.historyItem.hash
      };
      let types = [], ids = [], wasmEvents = [];
      for (let n = 0; n < this.events.length; n++) {
        let evt = this.events[n];
        if (evt['type'] && evt['attributes']) {
          if (evt.type === 'wasm') wasmEvents.push(evt.attributes);

          if (n === (this.events.length - 1)) {
            for (let i = 0; i < wasmEvents.length; i++) {

              for (let j = 0; j < wasmEvents[i].length; j++) {
                if (wasmEvents[i][j].key === 'action') types.push(wasmEvents[i][j].value);
                if (wasmEvents[i][j].key === 'token_id') ids.push(wasmEvents[i][j].value);
              }

              if (i == (wasmEvents.length - 1)) {
                // Metadata update
                if (types.indexOf('upgrade') !== -1) {
                  if (types.indexOf('mint') == -1 && types.indexOf('burn') == -1) historyEntry.type = "update_metadata";
                }
                if (types.indexOf('update_metadata') !== -1) {
                  if (types.indexOf('mint') == -1 && types.indexOf('burn') == -1) historyEntry.type = "update_metadata";
                }
                
                // Mint (domain or subdomain)
                if (types.indexOf('mint') !== -1) {
                  if (ids.length > 1) historyEntry.type = "mint_subdomain";
                  else historyEntry.type = "mint";
                }

                // Remove subdomain
                if (types.indexOf('burn') !== -1 && ids.length > 1) {
                  let isSubdomain = false;
                  for (let k = 0; k < ids.length; k++) {
                    if ((ids[k].split(".").length-1) > 1) isSubdomain = true;
                    if (k == ids.length - 1) historyEntry.type = (isSubdomain) ? "remove_subdomain" : "renew_domain";
                  }
                }

                // XXX: Extensions are logged as metadata update events
                // Extend domain registration
                // else if () historyEntry.type = "extend";
              }
            }
          }
        }
      }
      return historyEntry;
    }
  },
}
</script>

<style scoped>
.col.height, .col.view-explorer {
  text-align: right;
  color: #FF4D00;
  max-width: 150px;
}
a.explorer-link {
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  letter-spacing: -0.01em;
}
</style>