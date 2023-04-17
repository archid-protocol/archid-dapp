<template>
    <div class="notification" v-if="msg && type">
        <div class="img" v-if="img" :style="'background-image: url(/img/' + img + ');'"></div>
        <div :class="type">
            <h3 class="title">{{title}}</h3>
            <p class="body" v-html="msg" v-if="type !== types[0]"></p>
            <p class="body" v-if="type == types[0]">{{errorFormat(msg)}}</p>
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
</style>