<template>
    <div class="notification" v-if="msg && type">
        <div class="info-alert" v-if="type == types[0]">
          <span class="icon icon-warning"></span>
        </div>
        <div class="rm-img" v-if="img == images.mint || img == images.burn">
          <div class="img" :style="'background-image: url(/img/' + img + ');'"></div>
        </div>
        <div class="img" v-if="img && img !== images.mint && img !== images.burn" :style="'background-image: url(/img/' + img + ');'"></div>
        <div :class="type">
            <h3 class="title">{{title}}</h3>
            <p class="body" v-html="msg" v-if="type !== types[0]"></p>
            <p class="body" v-if="type == types[0]" :title="msg" :alt="msg" v-html="errorFormat(msg)"></p>
            <div v-if="type == types[2]" class="loading default"></div>
        </div>
        <div class="dismiss cancel">
          <p class="cancel" @click="dismiss()">Dismiss</p>
        </div>
    </div>
</template>

<script>
const TYPES = ["error", "success", "loading"];
const ERROR = TYPES[0];
const SUCCESS = TYPES[1];
const LOADING = TYPES[2];

const MINT_IMG = 'token.svg';
const BURN_IMG = 'token-burned.svg';

export default {
  props: {
    type: String,
    title: String,
    msg: String,
    img: String,
  },
  emits: ['closeNotification'],
  data: () => ({
    types: TYPES,
    images: { 
      mint: MINT_IMG,
      burn: BURN_IMG,
    }
  }),
  mounted: async function () {
    if (this.type !== ERROR && this.type !== SUCCESS && this.type !== LOADING) console.warn("Problem loading notification", this);
  },
  methods: {
    dismiss: function () {
        this.$emit('closeNotification', true);
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
div.img {
  height: 141px;
  margin-bottom: 1em;
  background-size: contain;
  background-repeat: no-repeat;
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
.cancel p.cancel {
  padding-top: 1em;
  cursor: pointer;
  text-align: center;
  color: #FF4D00;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
}
.info-alert {
  margin-bottom: 1em;
}
</style>