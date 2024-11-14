<template>
  <div class="offer offer-item row" v-if="offerItem['price']">
    <div class="col from">
      <div>
        <a class="offer-link" :href="'/address/'+offerItem.creator">{{ accountDisplayFormat(offerItem.creator) }}</a>
      </div>
    </div>
    <div class="col for">
      <div>
        <span class="icon icon-denom-warch"></span>&nbsp;<span>{{fromAtto(offerItem.price)}} wARCH</span>
      </div>
    </div>
    <div class="col accept" v-if="!readOnly">
      <button 
        class="btn btn-primary btn-accept-offer"
        @click="acceptOffer();"
      >Accept Offer</button>
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
import { FromAtto } from '../../util/denom';
import { Query as MarketplaceQuery, Execute  as MarketplaceExecute } from '../../util/marketplace';

import Notification from './Notification.vue';

export default {
  props: {
    domain: String,
    offerItem: Object,
    cwClient: Object,
    readOnly: Boolean
  },
  components: { Notification },
  emits: ['dataResolution'],
  data: () => ({
    id: null,
    swap: null,
    notify: {
      type: null,
      title: null,
      msg: null,
      img: null,
    },
    executeResult: null,
    fromAtto: FromAtto
  }),
  mounted: async function () {
    this.id = this.domain + "-" + this.offerItem.creator + "-offer-" + this.offerItem.expires.at_time;
    this.swap = await MarketplaceQuery.Details(this.id, this.cwClient);
    // console.log(this.swap);
  },
  methods: {
    acceptOffer: async function () {
      if (!this.id || !this.swap) return;
      let price = this.fromAtto(this.offerItem.price);
      // Waiting notification
      this.notify = {
        type: "loading",
        title: "Accepting offer",
        msg: "Accepting offer to swap " + this.domain + " for " + price + " wrapped ARCH",
        img: null,
      };

      this.executeResult = await MarketplaceExecute.FinishCw20(
        this.id, 
        this.swap, 
        'wrapped ARCH',
        this.cwClient
      );

      if (!this.executeResult['error']) {
        this.notify = {
          type: "success",
          title: "Offer Accepted",
          msg: "You swapped " + this.domain + " for " + price + " wrapped ARCH",
          img: "transfer.svg",
        };
        // Resolve token data and status updates
        await this.dataResolutionHandler();
        this.$emit('accepted', this.domain);
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
    dataResolutionHandler: function () {
      this.$emit('dataResolution', this.domain);
      this.$root.resolveUpdates();
    },
    closeNotification: function () {
      this.notify = {
        type: null,
        title: null,
        msg: null,
        img: null,
      };
    },
    accountDisplayFormat: function (account = null) {
      if (!account) return "";
      return account.slice(0,12) + "..." + account.slice(-5);
    }
  },
  computed: {},
}
</script>

<style scoped>
a {
  color: #FF4D00;
}
.icon-denom-warch {
  width: 24px;
  height: 24px;
}
</style>