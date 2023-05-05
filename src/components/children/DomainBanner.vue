<template>
  <div class="wrapper">
    <!-- <div :class="{'domain-banner': true, 'bg-img': (tokenImg) ? true : false}" v-if="domain" :style="'background-image: url(' + tokenImg + ');'"></div> -->
    <div class="domain-banner-i"></div>
    <h3>{{ domainDisplayFormat(domain) }}</h3>
  </div>
</template>

<script>
import { Token } from '../../util/token';

const IPFS_GATEWAY_PREFIX = 'https://ipfs.io/ipfs/';
const IPFS_CID_PREFIX = 'ipfs://';

export default {
  props: {
    domain: String,
    cwClient: Object,
    cw721: String,
  },
  data: () => ({
    token: null,
  }),
  mounted: async function () {
    // if (this.cwClient && this.cw721) await this.tokenData();
  },
  methods: {
    tokenData: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      this.token = await Token(this.domain, this.cw721, this.cwClient);
      console.log('Token query', this.token);
    },

    // Util
    domainDisplayFormat: function (domain = null) {
      if (!domain) return "";
      let ucfirst = domain.substr(0,1).toUpperCase();
      return ucfirst + domain.slice(1);
    }
  },
  computed: {
    tokenImg: function () {
      if (!this.token) return '';
      if (!this.token['extension']) return '';
      if (!this.token.extension.image) return '';
      let img = (this.token.extension.image.substr(0,7) == IPFS_CID_PREFIX) ? this.token.extension.image.replace(IPFS_CID_PREFIX, IPFS_GATEWAY_PREFIX) : this.token.extension.image;
      return img;
    },
  },
}
</script>

<style scoped>
.domain-banner-i {
  padding: 1.25em;
  background: #FF4D00;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 1em;
  height: 325px;
}
/*.wrapper {
  max-height: 325px;
  border-radius: 8px;
  overflow: hidden;
}
div.domain-banner {
  padding: 1.25em;
  background-color: rgba(255,77,0,0.9);
  color: #fff;
  border-radius: 8px;
  height: 325px;
}
div.domain-banner div.bg-img {
  background-repeat: no-repeat;
  background-position: right;
  background-size: contain;
  
  background-position: center;
  background-size: cover;
  filter: blur(24px);
  -webkit-filter: blur(24px);
} */
h3 {
  font-style: normal;
  font-weight: 600;
  font-size: 64px;
  line-height: 120%;
  letter-spacing: -0.05em;
  color: #FFFFFF;
  position: relative;
  margin-top: -110px;
  left: 25px;
}
</style>