<template>
  <div class="page">
    <p>
      <router-link to="/">Home</router-link>
    </p>
    <h3>archid - test bench</h3>
    <div class="test-bed">
      <div class="query">
        <h4>Queries:</h4>
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
        
          <!-- Config (client = null) -->
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
        <h4>Transactions:</h4>
        <ul>
          
          <!-- Register (name, years = 1, client = null) -->
          <li>
            <button 
              class="btn-tx btn-register-tx" 
              @click="executeRegister();"
              :disabled="(!params.execute.Register.name || typeof params.execute.Register.name !== 'string')"
            >ExecuteMsg::Register</button>
            <input 
              type="text" 
              class="domain-name" 
              v-model="params.execute.Register.name" 
              placeholder="Domain name to be registered" 
            />
            <br />
            <label for="years">Years to be registered (1-3):</label>
            <input 
              name="years" 
              type="number" 
              class="number" 
              min="1" 
              max="3" 
              v-model="params.execute.Register.years"
            />
          </li>
          
          <!-- RenewRegistration (name, years = 1, client = null) -->
          <li>
            <button 
              class="btn-tx btn-renew_registration-tx" 
              @click="executeRenewRegistration();"
              :disabled="(!params.execute.RenewRegistration.name || typeof params.execute.RenewRegistration.name !== 'string')"
            >ExecuteMsg::RenewRegistration</button>
            <input 
              type="text" 
              class="domain-name" 
              v-model="params.execute.RenewRegistration.name" 
              placeholder="Domain name to be renewed" 
            />
            <br />
            <label for="years">Years to be renewed for (1-3):</label>
            <input 
              name="years" 
              type="number" 
              class="number" 
              min="1" 
              max="3" 
              v-model="params.execute.RenewRegistration.years"
            />
          </li>

          <!-- UpdateResolver (name, new_resolver, client = null) -->
          <li>
            <button 
              class="btn-tx btn-update_resolver-tx" 
              @click="executeUpdateResolver();"
              :disabled="(!params.execute.UpdateResolver.name || !params.execute.UpdateResolver.new_resolver)"
            >ExecuteMsg::UpdateResolver</button>
            <input 
              type="text" 
              class="domain-name" 
              v-model="params.execute.UpdateResolver.name" 
              placeholder="Domain name to be updated" 
            />
            <input 
              type="text" 
              class="new-resolver" 
              v-model="params.execute.UpdateResolver.new_resolver" 
              placeholder="Archway address of new_resolver" 
            />
          </li>

          <!-- RegisterSubDomain (domain, subdomain, new_resolver, mint, expiration, client = null) -->
          <li>
            <button 
              class="btn-tx btn-register-tx" 
              @click="executeRegisterSubDomain();"
              :disabled="(!params.execute.RegisterSubDomain.domain || !params.execute.RegisterSubDomain.domain || !params.execute.RegisterSubDomain.new_resolver || !params.execute.RegisterSubDomain.expiration)"
            >ExecuteMsg::RegisterSubDomain</button>
            <ol>
              <li>
                <input 
                  type="text" 
                  class="domain-name" 
                  v-model="params.execute.RegisterSubDomain.domain" 
                  placeholder="Top level domain name to be updated" 
                />
              </li>
              <li>
                <input 
                  type="text" 
                  class="subdomain-name" 
                  v-model="params.execute.RegisterSubDomain.subdomain" 
                  placeholder="Subdomain name to be created" 
                />
              </li>
              <li>
                <input 
                  type="text" 
                  class="new-resolver" 
                  v-model="params.execute.RegisterSubDomain.new_resolver"
                  placeholder="Archway address of new_resolver" 
                /><!-- XXX [drew]: why we need new_resolver here? -->
              </li>
              <li>
                <select v-model="params.execute.RegisterSubDomain.mint">
                  <option value="true">Mint subdomain NFT</option>
                  <option value="false">Do not mint subdomain NFT</option>
                </select>
              </li>
              <li>
                <label for="expiration">Subdomain expiration:</label>
                <input 
                  name="expiration" 
                  type="number" 
                  class="expiration-number" 
                  v-model="params.execute.RegisterSubDomain.expiration"
                  placeholder="1234567"
                />
              </li>
            </ol>
          </li>

          <!-- UpdataUserDomainData (name, metadata_update, client = null) -->
          <li>
            <button 
              class="btn-tx btn-updata_user_domain_data-tx" 
              @click="executeUpdataUserDomainData();"
              :disabled="(!params.execute.UpdataUserDomainData.name)"
            >ExecuteMsg::UpdataUserDomainData</button>
            <input 
              type="text" 
              class="domain-name" 
              v-model="params.execute.UpdataUserDomainData.name" 
              placeholder="Domain name to be updated" 
            />
            <br />
            <label>metadata_update:</label>
            <!-- Add / Remove Accounts & Websites -->
            <ol>
              <li>
                <button 
                  @click="params.execute.UpdataUserDomainData.metadata_update.accounts.push({username: null, profile: null, account_type: null, verification_hash: null})"
                >Add Account</button>
                <button 
                  @click="params.execute.UpdataUserDomainData.metadata_update.accounts = [];"
                >Remove Accounts</button>
              </li>
              <li>
                <button 
                  @click="params.execute.UpdataUserDomainData.metadata_update.websites.push({url: null, domain: null, verification_hash: null})"
                >Add Website</button>
                <button 
                  @click="params.execute.UpdataUserDomainData.metadata_update.websites = [];"
                >Remove Websites</button>
              </li>
            </ol>
            <ol>
              <li>
                <input 
                  type="text" 
                  class="metadata-description" 
                  v-model="params.execute.UpdataUserDomainData.metadata_update.description" 
                  placeholder="NFT metadata description" 
                />  
              </li>
              <li>
                <input 
                  type="text" 
                  class="metadata-image" 
                  v-model="params.execute.UpdataUserDomainData.metadata_update.image" 
                  placeholder="NFT metadata image URL" 
                />
              </li>
              <li v-for="(account, i) in params.execute.UpdataUserDomainData.metadata_update.accounts" :key="i">
                <ol>
                  <li>
                    <label :for="'username_'+i">Account username:</label>
                    <input 
                      type="text" 
                      class="metadata-account-username" 
                      :name="'username_'+i"
                      v-model="params.execute.UpdataUserDomainData.metadata_update.accounts[i].username" 
                      placeholder="@chainofinsight" 
                    />
                  </li>
                  <li>
                    <label :for="'profile_'+i">Account profile link:</label>
                    <input 
                      type="text" 
                      class="metadata-account-profile" 
                      :name="'profile_'+i"
                      v-model="params.execute.UpdataUserDomainData.metadata_update.accounts[i].profile" 
                      placeholder="twitter.com/chainofinsight" 
                    />
                  </li>
                  <li>
                    <label :for="'account_type_'+i">Account type:</label>
                    <input 
                      type="text" 
                      class="metadata-account-account_type" 
                      :name="'account_type_'+i"
                      v-model="params.execute.UpdataUserDomainData.metadata_update.accounts[i].account_type" 
                      placeholder="e.g. 'twitter', 'github', 'email', etc." 
                    />
                  </li>
                  <li>
                    <label :for="'verification_hash_'+i">Account verification_hash:</label>
                    <input 
                      type="text" 
                      class="metadata-account-verification_hash" 
                      :name="'verification_hash_'+i"
                      v-model="params.execute.UpdataUserDomainData.metadata_update.accounts[i].verification_hash" 
                      disabled
                    />
                  </li>
                </ol>
              </li>

              <li v-for="(site, i) in params.execute.UpdataUserDomainData.metadata_update.websites" :key="i">
                <ol>
                  <li>
                    <label :for="'url_'+i">Website URL:</label>
                    <input 
                      type="text" 
                      class="metadata-website-url" 
                      :name="'url_'+i"
                      v-model="params.execute.UpdataUserDomainData.metadata_update.websites[i].url" 
                      placeholder="chainofinsight.com" 
                    />
                  </li>
                  <li>
                    <label :for="'domain_'+i">Archway domain for this website:</label>
                    <input 
                      type="text" 
                      class="metadata-website-domain" 
                      :name="'domain_'+i"
                      v-model="params.execute.UpdataUserDomainData.metadata_update.websites[i].domain" 
                      placeholder="chainofinsight.arch" 
                    />
                  </li>
                  <li>
                    <label :for="'site_verification_hash_'+i">Website verification_hash:</label>
                    <input 
                      type="text" 
                      class="metadata-website-verification_hash" 
                      :name="'site_verification_hash_'+i"
                      v-model="params.execute.UpdataUserDomainData.metadata_update.accounts[i].verification_hash" 
                      disabled
                    />
                  </li>
                </ol>
              </li>
            </ol>
          </li>

          <!-- UpdateConfig (update_config, client = null) -->
          <li>
            <button 
              class="btn-tx btn-update-config-tx" 
              @click="executeUpdateConfig();"
            >ExecuteMsg::UpdateConfig</button>
            
            <ol>
              <li>
                <label for="config_admin">Admin: </label>
                <input 
                  type="text"
                  name="config_admin" 
                  class="config_admin" 
                  v-model="params.execute.UpdateConfig.admin" 
                  placeholder="New contract admin address" 
                />
              </li>
              <li>
                <label for="config_wallet">Wallet: </label>
                <input 
                  type="text" 
                  name="config_wallet"
                  class="config_wallet"
                  v-model="params.execute.UpdateConfig.wallet" 
                  placeholder="New contract wallet address" 
                />
              </li>
              <li>
                <label for="config_cw721">cw721: </label>
                <input 
                  type="text"
                  name="config_cw721"
                  class="config_cw721"
                  v-model="params.execute.UpdateConfig.cw721"
                  placeholder="New cw721 contract address"
                />
              </li>
              <li>
                <label for="config_base_cost">base_cost: </label>
                <input 
                  name="config_base_cost" 
                  type="number" 
                  class="config-number" 
                  v-model="params.execute.UpdateConfig.base_cost"
                />
              </li>
              <li>
                <label for="config_base_expiration">base_expiration: </label>
                <input 
                  name="config_base_expiration" 
                  type="number" 
                  class="config-number" 
                  v-model="params.execute.UpdateConfig.base_expiration"
                />
              </li>
            </ol>
          </li>

          <!-- Withdraw (amount, client = null) -->
          <li>
            <button 
              class="btn-tx btn-withdraw-tx" 
              @click="executeWithdraw();"
              :disabled="(!params.execute.Withdraw.amount)"
            >ExecuteMsg::Withdraw</button>
            <label class="withdraw-label" for="withdraw">Amount to withdraw:</label>
            <input 
              name="withdraw" 
              type="number" 
              class="number" 
              v-model="params.execute.Withdraw.amount"
            />
          </li>

          <!-- RemoveSubDomain (domain, subdomain, client = null) -->
          <li>
            <button 
              class="btn-tx btn-withdraw-tx" 
              @click="executeRemoveSubDomain();"
              :disabled="(!params.execute.RemoveSubDomain.domain || !params.execute.RemoveSubDomain.subdomain)"
            >ExecuteMsg::RemoveSubDomain</button>
            <input 
              type="text" 
              class="domain-name" 
              v-model="params.execute.RemoveSubDomain.domain" 
              placeholder="Top level domain name to be updated" 
            />
            <input 
              type="text" 
              class="subdomain-name" 
              v-model="params.execute.RemoveSubDomain.subdomain" 
              placeholder="Subdomain to be removed" 
            />
          </li>

        </ul>
        <div v-if="result.execute">
          <p>Execute Result:</p>
          <pre v-html="executeResult"></pre>
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
  RecordExpiration,
} from '../util/query';

import {
  Register,
  RenewRegistration,
  UpdateResolver,
  RegisterSubDomain,
  UpdataUserDomainData,
  UpdateConfig,
  Withdraw,
  RemoveSubDomain
} from '../util/execute';

export default {
  name: 'Test Bench',
  components: {},
  data: () => ({
    cwClient: null,
    accounts: null,
    baseCost: null,
    params: {
      query: {
        ResolveRecord: {
          name: null,
        },
        RecordExpiration: {
          name: null,
        },
      },
      execute: {
        Register: {
          name: null,
          years: 1,
        },
        RenewRegistration: {
          name: null,
          years: 1,
        },
        UpdateResolver: {
          name: null,
          new_resolver: null,
        },
        RegisterSubDomain: {
          domain: null, 
          subdomain: null, 
          new_resolver: null, 
          mint: "true", 
          expiration: null,
        },
        UpdataUserDomainData: {
          name: null,
          metadata_update: {
            description: null,
            image: null,
            accounts: [],
            websites: [],
          }
        },
        // Defaulting to current settings (11/3/2022)
        UpdateConfig: {
          admin: "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
          wallet: "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
          cw721: "archway16v2d8hp7udzkxruznwvdlzt2pmuqhpatpszgqhhuf9ehlu4wgmaqtwj9fc",
          base_cost: "1",
          base_expiration: 10000000
        },
        Withdraw: {
          amount: null,
        },
        RemoveSubDomain: {
          domain: null,
          subdomain: null,
        },
      },
    },
    result: {
      query: null,
      execute: null,
    },
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
          console.log('Test Bench', {cwClient: this.cwClient, accounts: this.accounts});
        }, 100);
      } catch (e) {
        await this.resumeConnectedState((attempts + 1));
      }
    },

    // Queries
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

      if (this.result.query['base_cost']) this.baseCost = Number(this.result.query.base_cost);
    },

    // Transactions
    executeRegister: async function () {
      if (!this.params.execute.Register.name) return;
      if (!this.baseCost)
        await this.queryConfig();
      this.result.execute = await Register(
        this.params.execute.Register.name,
        this.params.execute.Register.years,
        this.baseCost,
        this.cwClient
      );
      if (typeof this.result.execute == 'undefined') this.result.query = {error: "Error calling entry point in Registry"};
      console.log('Register tx', this.result.execute);
    },
    executeRenewRegistration: async function () {
      if (!this.params.execute.RenewRegistration.name) return;
      if (!this.baseCost)
        await this.queryConfig();
      this.result.execute = await RenewRegistration(
        this.params.execute.RenewRegistration.name,
        this.params.execute.RenewRegistration.years,
        this.baseCost,
        this.cwClient
      );
      if (typeof this.result.execute == 'undefined') this.result.query = {error: "Error calling entry point in Registry"};
      console.log('RenewRegistration tx', this.result.execute);
    },
    executeUpdateResolver: async function () {
      if (!this.params.execute.UpdateResolver.name || !this.params.execute.UpdateResolver.new_resolver) return;
      this.result.execute = await UpdateResolver(
        this.params.execute.UpdateResolver.name,
        this.params.execute.UpdateResolver.new_resolver,
        this.cwClient
      );
      if (typeof this.result.execute == 'undefined') this.result.query = {error: "Error calling entry point in Registry"};
      console.log('UpdateResolver tx', this.result.execute);
    },
    executeRegisterSubDomain: async function () {
      let mint = true;
      if (this.params.execute.RegisterSubDomain.mint == "false") mint = false;

      this.result.execute = await RegisterSubDomain(
        this.params.execute.RegisterSubDomain.domain,
        this.params.execute.RegisterSubDomain.subdomain,
        this.params.execute.RegisterSubDomain.new_resolver,
        mint,
        this.params.execute.RegisterSubDomain.expiration,
        this.cwClient
      );
      console.log('RegisterSubDomain tx', this.result.execute);
    },
    executeUpdataUserDomainData: async function () {
      if (!this.params.execute.UpdataUserDomainData.name) return;

      let metadata_update = {
        description: this.params.execute.UpdataUserDomainData.metadata_update.description,
        image: this.params.execute.UpdataUserDomainData.metadata_update.image,
      };

      if (this.params.execute.UpdataUserDomainData.metadata_update.accounts.length) metadata_update.accounts = this.params.execute.UpdataUserDomainData.metadata_update.accounts;
      if (this.params.execute.UpdataUserDomainData.metadata_update.websites.length) metadata_update.websites = this.params.execute.UpdataUserDomainData.metadata_update.websites;

      this.result.execute = await UpdataUserDomainData(
        this.params.execute.UpdataUserDomainData.name,
        metadata_update,
        this.cwClient
      );
      console.log('UpdataUserDomainData tx', this.result.execute);
    },
    executeUpdateConfig: async function () {
      let update_config = {
        admin: this.params.execute.UpdateConfig.admin,
        wallet: this.params.execute.UpdateConfig.wallet,
        cw721: this.params.execute.UpdateConfig.cw721,
        base_cost: String(this.params.execute.UpdateConfig.base_cost),
        base_expiration: this.params.execute.UpdateConfig.base_expiration,
      };

      this.result.execute = await UpdateConfig(
        update_config,
        this.cwClient
      );
      console.log('UpdateConfig tx', this.result.execute);
    },
    executeWithdraw: async function () {
      if (!this.params.execute.Withdraw.amount) return;
      this.result.execute = await Withdraw(
        Number(this.params.execute.Withdraw.amount),
        this.cwClient
      );
    },
    executeRemoveSubDomain: async function () {
      if (!this.params.execute.RemoveSubDomain.domain || !this.params.execute.RemoveSubDomain.subdomain) return;
      this.result.execute = await RemoveSubDomain(
        this.params.execute.RemoveSubDomain.domain,
        this.params.execute.RemoveSubDomain.subdomain,
        this.cwClient
      );
      console.log('RemoveSubDomain tx', this.result.execute);
    }
  },
  computed: {
    queryResult: function () {
      if (!this.result.query) return '';
      return JSON.stringify(this.result.query);
    },
    executeResult: function () {
      if (!this.result.execute) return '';
      return JSON.stringify(this.result.execute, null, 2);
    },
  }
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
