<template>
    <div class="notification" v-if="msg && type">
        <div class="dismiss close">
            <span class="close-x" @click="dismiss();">&times;</span>
        </div>
        <div class="img" v-if="img" :style="'background-image: url(/img/' + img + ');'"></div>
        <div :class="type">
            <h3 class="title">{{title}}</h3>
            <p class="body" v-html="msg"></p>
            <div v-if="type == types[2]" class="loading default"></div>
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
  },
}
</script>

<style scoped>
</style>