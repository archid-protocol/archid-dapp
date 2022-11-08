<template>
  <div class="page">
    <h3>archid - home</h3>
    <ul class="navigation">
      <li>
        <router-link to="/test">Test Bench</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';

export default {
  name: 'Home',
  components: {},
  data: () => ({}),
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
    },
  },
}
</script>

<style scoped>
.page {
  max-width: 90vw;
  padding: 3em;
}
ul, ul li {
  list-style: none;
}
ul li {
  padding: 1em;
}
input {
  width: 500px;
}
input, label.withdraw-label {
  margin-left: 5px;
}
input.number {
  width: 45px;
}
</style>
