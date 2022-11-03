<template>
  <h3>archid - home</h3>
</template>

<script>
import { Client, Accounts } from '../util/client';

export default {
  name: 'Home',
  components: {},
  data: () => ({
    cwClient: null,
    accounts: null,
  }),
  mounted: function () {
    if (window) this.resumeConnectedState();
  },
  methods: {
    resumeConnectedState: async function (attempts = 0) {
      if (attempts >= 5) return;
      try {
        setTimeout(async () => { 
          this.cwClient = await Client();
          this.accounts = await Accounts(this.cwClient);
          console.log('Home', {cwClient: this.cwClient, accounts: this.accounts});
        }, 100);
      } catch (e) {
        await this.resumeConnectedState((attempts + 1));
      }
    }
  }
}
</script>

<style scoped>
</style>
