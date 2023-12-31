<template>
  <div :class="'notification ' + type" v-if="msg && type">
    <div class="info-alert" v-if="type == types[0]">
      <span class="icon icon-warning"></span>
    </div>
    <div :class="{'rm-img': true, 'update': img == images.update}" v-if="img == images.mint || img == images.burn || img == images.update">
      <div class="img" :style="'background-image: url(/img/' + img + ');'"></div>
    </div>
    <div :class="{'img': true, 'transfer': img == images.transfer}" v-if="img && img !== images.mint && img !== images.burn && img !== images.update" :style="'background-image: url(/img/' + img + ');'"></div>
    <div :class="type">
        <h3 class="title">{{title}}</h3>
        <p class="body" v-html="msg" v-if="type !== types[0]"></p>
        <p class="body" v-if="type == types[0]" :title="msg" :alt="msg">We're not able to fulfill your request at this time</p>
        <div class="clipboard" v-if="type == types[0]">
            <p @click="copy(msg)">Copy Error Details</p>
        </div>
        <div v-if="type == types[2]" class="loading default"></div>
    </div>
    <div class="dismiss cancel" v-if="type !== types[3]">
      <p class="cancel" @click="dismiss()">Dismiss</p>
    </div>
    <div class="ctrl listing-sold" v-if="type == types[3]">
      <div class="col left">
        <p class="cancel" @click="dismiss()">Dismiss</p>
      </div>
      <div class="col right">
        <span class="update">
          <button class="btn btn-primary" @click="updateResolverModal()">Update Resolver</button>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
const TYPES = ["error", "success", "loading", "sold"];
const ERROR = TYPES[0];
const SUCCESS = TYPES[1];
const LOADING = TYPES[2];
const SOLD = TYPES[3];

const MINT_IMG = "token.svg";
const BURN_IMG = "token-burned.svg";
const METADATA_IMG = "token-update.svg";
const TRANSFER_IMG = "transfer.svg";

export default {
  props: {
    type: String,
    title: String,
    msg: String,
    img: String,
  },
  emits: ['closeNotification', 'resolverModal'],
  data: () => ({
    types: TYPES,
    images: { 
      mint: MINT_IMG,
      burn: BURN_IMG,
      update: METADATA_IMG,
      transfer: TRANSFER_IMG
    },
    modals: {
      resolverMismatch: false // type == sold
    }
  }),
  mounted: async function () {
    if (this.type !== ERROR 
      && this.type !== SUCCESS 
      && this.type !== LOADING 
      && this.type !== SOLD
    ) console.warn("Problem loading notification", this);
  },
  methods: {
    dismiss: function () {
      if (this.type == SOLD) this.$emit('closeNotification', 'sold');
      else this.$emit('closeNotification', true);
    },
    updateResolverModal: function () {
      this.$emit('resolverModal', true);
    },
    copy: function (msg = null) {
      if (!msg || !window) return;
      if (!window.navigator) return;
      window.navigator.clipboard.writeText(msg);
    },
    errorFormat(errorMsg = null) {
      if (!errorMsg) return '';
      let msg = errorMsg.replace('Error: ', '');
      msg = msg.replace('error: ', '');
      if (msg.length >= 180) msg = msg.slice(0,180) + '...';
      return msg;
    },
  },
}
</script>

<style scoped>
div.notification {
  position: fixed;
  bottom: 3em;
  right: 22px;
  padding: 32px;
  gap: 32px;
  background: #FFFFFF;
  box-shadow: -8px 0px 124px rgba(0, 0, 0, 0.16);
  border-radius: 16px;
  width: 327px;
  height: 452px;
  z-index: 400;
}
div.notification.sold {
  height: 470px;
}
div.rm-img {
  background: #F2EFED;
  border-radius: 8px;
  position: relative;
  height: 141px;
  top: -15px;
}
div.rm-img .img {
  display: block;
  width: 167.16px;
  height: 158.98px;
  margin: auto;
  position: relative;
  top: -33px;
}
div.rm-img.update .img {
  width: 212px;
  height: 175px;
  top: -42px;
}
div.img {
  height: 141px;
  margin-bottom: 1em;
  background-size: contain;
  background-repeat: no-repeat;
}
div.img.transfer {
  position: relative;
  width: 130%;
  left: -11%;
}
h3.title {
  font-style: normal;
  font-weight: 500;
  font-size: 32px;
  line-height: 130%;
}
p.body {
  margin-top: 20px;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  letter-spacing: -0.01em;
  word-wrap: break-word;
  color: #666666;
}
.loading.default {
  position: relative;
  top: 2em;
}
.dismiss.cancel {
  position: absolute;
  bottom: 2em;
  width: 260px;
}
.cancel p.cancel,
.col p.cancel {
  padding-top: 1em;
  cursor: pointer;
  text-align: center;
  color: #FF4D00;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
}
.left p.cancel {
  text-align: left;
}
.col p.cancel,
.col.left,
.col.right {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}
.listing-sold,
.listing-sold .col {
  display: flex;
  justify-content: space-around;
}
span.update button {
  width: 155px;
}
.info-alert {
  margin-bottom: 1em;
}
div.clipboard p {
  color: #FF4D00;
  cursor: pointer;
}
</style>