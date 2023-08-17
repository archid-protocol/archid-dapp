<template>
  <div :class="{'market-item': true, 'domain-item': true, 'collapsible': true, 'expanded': !closed || !collapsible}">
    <div class="head">
      <div class="left">
        <router-link class="domain-name header" v-if="domain" :to="'/domains/' + domain">{{domain}}</router-link>
      </div>
      <div class="right">
        <div :class="{'caret': true, 'active': !closed}" @click="swapDetails();" v-if="collapsible">&caron;</div>
      </div>
    </div>
    <div class="body" v-if="!closed || !collapsible">
      <div class="container-c" v-if="token && swap">
        <div class="domain-data top row">
          
          <!-- Col 1; Domain Expiration -->
          <div class="col domain-expiry">
            <!-- Expiration -->
            <div class="expiry" v-if="domainRecord">
              <p class="descr">Domain expires on</p>
              <p class="value" v-if="domainRecord.expiration">{{ niceDate(domainRecord.expiration) }}</p>
            </div>
          </div>

          <!-- Col 2; Listing Expiry -->
          <div class="col listing-expiry">
            <!-- Expiration -->
            <div class="expiry" v-if="swap.expires">
              <p class="descr">Listing expires on</p>
              <p class="value" v-if="swap.expires.at_time">{{ niceDateFromNano(swap.expires.at_time) }}</p>
            </div>
          </div>

          <!-- Col 3; Finalize Swap -->
          <div class="col finalize-swap">
            <!-- Price -->
            <div class="price" v-if="swap.price">
              <p class="value swap-price">{{ formatFromAtto(swap.price) }}<span class="icon icon-denom"></span></p>
            </div>
            <div class="purchase">
              <button 
                class="btn btn-inverse" 
                @click="executeFinishNative();" 
                v-if="account && account !== swap.creator"
              >Buy Domain</button>
              <button 
                class="btn btn-primary" 
                @click="executeCancelSwap();" 
                v-if="account == swap.creator"
              >Cancel Listing</button>
            </div>
          </div>
        </div>

      </div>

      <!-- Loading -->
      <div class="loading default" v-if="!swap"></div>
    </div>
  </div>

  <!-- Tx. Notifications -->
  <Notification
    v-bind:type="notify.type"
    v-bind:title="notify.title"
    v-bind:msg="notify.msg"
    v-bind:img="notify.img"
    v-if="notify.type"
    @closeNotification="closeNotification"
  >
  </Notification>
</template>

<script>
import { ResolveRecord } from '../../util/query';
import { DateFormat, NanoToSeconds } from '../../util/datetime';
import { FromAtto, ToAtto } from '../../util/denom';
import { Token } from '../../util/token';
import { Query as MarketplaceQuery, Execute as MarketplaceExecute } from '../../util/marketplace';

import Notification from './Notification.vue';

const DEFAULT_TOKEN_IMG = "token.svg";

const IPFS_GATEWAY_PREFIX = 'https://ipfs.io/ipfs/';
const IPFS_CID_PREFIX = 'ipfs://';

export default {
  props: {
    domain: String,
    accounts: Object,
    cw721: String,
    cwClient: Object,
    collapsible: Boolean,
  },
  emits: ['dataResolution'],
  components: { Notification },
  data: () => ({
    token: null,
    swap: null,
    account: null,
    isExpired: null,
    domainRecord: null,
    executeResult: null,
    modals: {
      enlargeTokenImg: false,
    },
    notify: {
      type: null,
      title: null,
      msg: null,
      img: null,
    },
    closed: true,
    defaultTokenImg: '/img/' + DEFAULT_TOKEN_IMG,
    niceDate: DateFormat,
    formatFromAtto: FromAtto,
    formatToAtto: ToAtto,
  }),
  mounted: async function () {
    if (!this.collapsible) await this.swapDetails();
    if (Array.isArray(this.accounts)) {
      if (this.accounts.length) this.account = this.accounts[0].address;
    }
  },
  methods: {
    swapDetails: async function () {
      if (!this.swap) await this.dataResolutionHandler();
      this.closed = !this.closed;
    },
    dataResolutionHandler: async function (force = false) {
      if (this.swap && !force) return;
      // Resolve data
      await this.tokenData();
      await this.swapData();
      await this.resolveDomainRecord();
      if (force) {
        this.$emit('dataResolution', true);
        this.$root.resolveUpdates();
      }
    },
    tokenData: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      this.token = await Token(this.domain, this.cw721, this.cwClient);
      // console.log('Token query', this.token);
    },
    swapData: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      this.swap = await MarketplaceQuery.Details(this.domain, this.cwClient);
      if (!this.swap['error']) console.log('Details query (swap)', this.swap);
    },
    resolveDomainRecord: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      this.domainRecord = await ResolveRecord(
        this.domain,
        this.cwClient
      );
      if (!this.domainRecord.address) this.isExpired = true;
      else this.isExpired = false;
      // console.log('ResolveRecord query', this.domainRecord);
    },
    viewImgHandler: function () {
      if (!this.token.extension) return;
      else if (!this.token.extension['image']) return;
      this.modals.enlargeTokenImg = !this.modals.enlargeTokenImg;
    },
    closeNotification: function () {
      this.notify = {
        type: null,
        title: null,
        msg: null,
        img: null,
      };
    },

    // Txs
    executeFinishNative: async function () {
      // Waiting notification
      this.notify = {
        type: "loading",
        title: "Getting your domain ready",
        msg: "Preparing to give " + this.domain + " a new home",
        img: null,
      };

      this.executeResult = await MarketplaceExecute.FinishNative(
        this.domain,  // Domain
        this.swap,    // Swap
        this.cwClient
      );
      console.log('Swap purchase', this.executeResult);

      if (!this.executeResult['error']) {
        this.notify = {
          type: "success",
          title: "Your new domain is almost ready",
          msg: "Now that " + this.domain + " is yours, don't forget to update the domain record to your own address",
          img: DEFAULT_TOKEN_IMG,
        };
        // Resolve token data and status updates
        await this.dataResolutionHandler(true);
        this.$emit('dataResolution', true);
      } else {
        // Error notification
        this.notify = {
          type: "error",
          title: "Something went wrong",
          msg: this.executeResult.error,
          img: null,
        };
      }
    },
    executeCancelSwap: async function () {
      if (typeof this.domain !== 'string') return;

      // Waiting notification
      this.notify = {
        type: "loading",
        title: "Cancelling your swap",
        msg: "Preparing to remove " + this.domain + " from the marketplace",
        img: null,
      };

      this.executeResult = await MarketplaceExecute.Cancel(
        this.domain,
        this.cwClient
      );

      if (!this.executeResult['error']) {
        this.notify = {
          type: "success",
          title: "Listing removed",
          msg: this.domain + " has been successfully removed from the marketplace",
          img: DEFAULT_TOKEN_IMG,
        };
        // Resolve token data and status updates
        await this.dataResolutionHandler(true);
        this.$emit('dataResolution', true);
      } else {
        // Error notification
        this.notify = {
          type: "error",
          title: "Something went wrong",
          msg: this.executeResult.error,
          img: null,
        };
      }
    },

    // Util
    niceDateFromNano: function (ns) {
      if (typeof ns !== 'string' && typeof ns !== 'number') return '';
      ns = Number(ns);
      let seconds = NanoToSeconds(ns);
      return this.niceDate(seconds);
    },
  },
  computed: {
    tokenImg: function () {
      if (typeof this.token !== 'object') return this.defaultTokenImg;
      else if (!this.token['extension']) return this.defaultTokenImg;
      else if (!this.token.extension['image']) return this.defaultTokenImg;
      let img = (this.token.extension.image.substr(0,7) == IPFS_CID_PREFIX) ? this.token.extension.image.replace(IPFS_CID_PREFIX, IPFS_GATEWAY_PREFIX) : this.token.extension.image;
      return img;
    },
  }
}
</script>

<style scoped>
.domain-name.header {
  font-weight: 500;
  font-size: 32px;
  line-height: 130%;
  text-decoration: none;
}
.expanded div.head {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 1em;
  padding-bottom: 1.25em;
}
div.left, div.right {
  display: inline-block;
}
div.left {
  width: 70%;
}
div.right {
  width: 30%;
  text-align: right;
}
div.right .caret,
div.expiry {
  display: inline-block;
}
div.expiry .descr {
  gap: 4px;
  margin-bottom: 0.25rem;
}
div.expiry .value {
  gap: 4px;
  font-weight: 400;
  font-size: 16px;
  line-height: 16.8px;
  letter-spacing: -1%;
}
div.right .caret {
  position: relative;
  top: 12px;
}
div.right .caret.active {
  top: -12px;
}
label {
  margin-bottom: 0.25em;
}

.modal-title {
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 150%;
  letter-spacing: -0.03em;
  color: #000000;
}
.modal-domain-title {
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 150%;
  letter-spacing: -0.03em;
  color: #FF4D00;
  text-transform: capitalize;
}
span.cost {
  font-style: normal;
  font-weight: 500;
  font-size: 32px;
  line-height: 130%;
  letter-spacing: -0.02em;
  color: #000000;
}
.icon-denom {
  margin-left: 8px;
  width: 32px;
  height: 32px;
  top: -7px;
  position: relative;
}
.col.img-t {
  max-width: 280px;
}
.token-img.wrapper {
  padding: 16px;
  gap: 16px;
  width: 233px;
  height: 228px;
  background: #F2EFED;
  border-radius: 16px;
}
.img.token-img {
  width: auto;
  height: 190px;
  background-size: contain;
  background-repeat: no-repeat;
  top: 9px;
  position: relative;
}
.close-btn-right {
  width: 100%;
}
.btn-close-alt {
  font-size: 21px;
  font-weight: 300;
  left: 95%;
  position: relative;
}
.domain-img-lg {
  margin-top: 4em;
  padding: 0px;
  gap: 16px;
  border-radius: 8px;
}
p.swap-price .icon-denom {
  position: relative;
  top: 5px;
}
span.denom-text {
  position: relative;
  top: -7px;
  color: #666666;
  font-weight: 400;
  font-size: 14px;
  line-height: 16.8px;
}
.col.finalize-swap {
  text-align: right;
}
.col.finalize-swap, .col.finalize-swap div {
  display: inline-block;
}
.value.swap-price {
  font-weight: 500;
  font-size: 32px;
  line-height: 41.6px;
  letter-spacing: -2%;
}
.purchase button {
  top: -7px;
  position: relative;
  margin-left: 0.75em;
}
/* 
.modal-header.subdomain-remove, 
.modal-footer.subdomain {
  border: none;
}
.modal-footer.subdomain {
  justify-content: space-between;
} 
.list-domain.form-control {
  background: #F2EFED;
  border-radius: 8px;
  height: 56px;
  border: none;
}
label.list {
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  letter-spacing: -0.01em;
  color: #666666;
  margin-bottom: 0.5em;
}
input.list-domain {
  text-align: right;
  padding-top: 2em;
  padding-bottom: 2em;
}
*/
</style>