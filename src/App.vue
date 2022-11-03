<template>
  <div class="loggedout" v-if="!connected">
    <button id="connect" class="btn-connect" @click="connectWallet();">Connect Wallet</button>
  </div>
  <div class="loggedin" v-else>
    <router-view />
  </div>
</template>

<script>
import { Client, accountBalances } from './util/client';

export default {
  name: 'archid-dapp',
  components: {},
  data: () => ({
    cwClient: null,
    accounts: [],
    connected: false,
  }),
  mounted: async function () {
    if (window) {
      let connected = window.sessionStorage.getItem('connected');
      if (connected) this.connected = true;
    }
  },
  methods: {
    connectWallet: async function () {
      this.cwClient = await Client();
      this.accounts = await accountBalances();
      
      try {
        if (!this.accounts[0].address) return;
        this.connected = true;
        window.sessionStorage.setItem('connected', true);
      } catch(e) {
        console.error(e);
      }
      
      console.log({cwClient: this.cwClient, accounts: this.accounts});
    }
  }
}
</script>

<style scoped>
</style>