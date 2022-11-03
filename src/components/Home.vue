<template>
  <div class="page">
    <h3>archid - home</h3>
    <div class="test-bed">
      <div class="query">
        <ul>
          <!-- ResolveRecord (name, client = null) -->
          <li>
            <button 
              class="btn-query btn-resolve-record-query" 
              @click="queryResolveRecord();" 
              :disabled="(!params.query.ResolveRecord.name || typeof params.query.ResolveRecord.name !== 'string')"
            >QueryMsg::ResolveRecord</button>
            <input 
              type="text" 
              class="domain-name" 
              v-model="params.query.ResolveRecord.name" 
              placeholder="Type a valid domain name to be resolved" 
            />
          </li>
          
          <!-- RecordExpiration (name, client = null) -->
          <li>
            <button 
              class="btn-query btn-record-expiration-query" 
              @click="queryRecordExpiration();" 
              :disabled="(!params.query.RecordExpiration.name || typeof params.query.RecordExpiration.name !== 'string')"
            >QueryMsg::RecordExpiration</button>
            <input 
              type="text" 
              class="domain-name" 
              v-model="params.query.RecordExpiration.name" 
              placeholder="Type a valid domain name to resolve its expiry" 
            />
          </li>
        
          <!-- Config(client = null) -->
          <li>
            <button class="btn-query btn-config-query" @click="queryConfig();">QueryMsg::Config</button>
          </li>
        </ul>

        <div v-if="result.query">
          <p>Query Result:</p>
          <pre v-html="queryResult"></pre>
        </div>
      </div>
      <div class="execute">
        <!-- Register(name, years = 1, client = null) -->
        <!-- RenewRegistration(name, years = 1, client = null) -->
        <!-- UpdateResolver(name, new_resolver, client = null) -->
        <!-- RegisterSubDomain(domain, subdomain, new_resolver, mint, expiration, client = null) -->
        <!-- UpdataUserDomainData(name, metadata_update, client = null) -->
        <!-- UpdateConfig(update_config, client = null) -->
        <!-- Withdraw(amount, client = null) -->
        <!-- RemoveSubDomain(domain, subdomain, client = null) -->
        <div v-if="result.execute">
          <p>Execute Result:</p>
          <pre></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Client, Accounts } from '../util/client';
import { 
  Config, 
  ResolveRecord, 
  RecordExpiration 
} from '../util/query';

export default {
  name: 'Home',
  components: {},
  data: () => ({
    cwClient: null,
    accounts: null,
    params: {
      query: {
        ResolveRecord: {
          name: null,
        },
        RecordExpiration: {
          name: null,
        },
      },
      execute: {},
    },
    result: {
      query: null,
      execute: null
    }
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
    },
    queryResolveRecord: async function () {
      if (!this.params.query.ResolveRecord.name) return;
      this.result.query = await ResolveRecord(
        this.params.query.ResolveRecord.name, 
        this.cwClient
      );
      if (typeof this.result.query == 'undefined') this.result.query = {error: "Error reading from Registry"};
      console.log('ResolveRecord query', this.result.query);
    },
    queryRecordExpiration: async function () {
      if (!this.params.query.RecordExpiration.name) return;
      this.result.query = await RecordExpiration(
        this.params.query.RecordExpiration.name, 
        this.cwClient
      );
      if (typeof this.result.query == 'undefined') this.result.query = {error: "Error reading from Registry"};
      console.log('ResolveRecord query', this.result.query);
    },
    queryConfig: async function () {
      this.result.query = await Config(this.cwClient);
      console.log('Config query', this.result.query);
    },
  },
  computed: {
    queryResult: function () {
      if (!this.result.query) return '';
      return JSON.stringify(this.result.query);
    },
  }
}
</script>

<style scoped>
.page {
  max-width: 90vw;
  padding: 3em;
}
ul, li {
  list-style: none;
}
li {
  padding: 1em;
}
input {
  margin-left: 5px;
  width: 500px;
}
</style>
