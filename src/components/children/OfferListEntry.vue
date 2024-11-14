<template>
  <div class="offer offer-item row" v-if="offerItem['price']">
    <div class="col title">
      <span>Offer Received</span>
    </div>
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

import Notification from './Notification.vue';

export default {
  props: {
    domain: String,
    offerItem: Object,
    readOnly: Boolean,
  },
  components: { Notification },
  data: () => ({
    notify: {
      type: null,
      title: null,
      msg: null,
      img: null,
    },
    fromAtto: FromAtto
  }),
  mounted: async function () {},
  methods: {
    acceptOffer: async function () {
      console.log("TODO");
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
.col.from {
  text-align: center;
  align-items: space-around;
}
.col.for, .col.accept {
  text-align: right;
  align-items: flex-end;
}
</style>