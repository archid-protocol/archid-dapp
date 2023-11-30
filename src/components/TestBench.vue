<template>
  <div class="page">
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

          <!-- RegisterSubdomain (domain, subdomain, new_resolver, mint, expiration, client = null) -->
          <li>
            <button 
              class="btn-tx btn-register-tx" 
              @click="executeRegisterSubdomain();"
              :disabled="(!params.execute.RegisterSubdomain.domain || !params.execute.RegisterSubdomain.domain || !params.execute.RegisterSubdomain.new_resolver || !params.execute.RegisterSubdomain.new_owner || !params.execute.RegisterSubdomain.expiration)"
            >ExecuteMsg::RegisterSubdomain</button>
            <ol>
              <li>
                <input 
                  type="text" 
                  class="domain-name" 
                  v-model="params.execute.RegisterSubdomain.domain" 
                  placeholder="Top level domain name to be updated" 
                />
              </li>
              <li>
                <input 
                  type="text" 
                  class="subdomain-name" 
                  v-model="params.execute.RegisterSubdomain.subdomain" 
                  placeholder="Subdomain name to be created" 
                />
              </li>
              <li>
                <input 
                  type="text" 
                  class="new-resolver" 
                  v-model="params.execute.RegisterSubdomain.new_resolver"
                  placeholder="Archway address of new_resolver" 
                />
              </li>
              <li>
                <input 
                  type="text" 
                  class="new-resolver" 
                  v-model="params.execute.RegisterSubdomain.new_owner"
                  placeholder="Archway address of new_owner" 
                />
              </li>
              <li>
                <select v-model="params.execute.RegisterSubdomain.mint">
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
                  v-model="params.execute.RegisterSubdomain.expiration"
                  placeholder="1234567"
                />
              </li>
            </ol>
          </li>

          <!-- UpdateUserDomainData (name, metadata_update, client = null) -->
          <li>
            <button 
              class="btn-tx btn-update_user_domain_data-tx" 
              @click="executeUpdateUserDomainData();"
              :disabled="(!params.execute.UpdateUserDomainData.name)"
            >ExecuteMsg::UpdateUserDomainData</button>
            <input 
              type="text" 
              class="domain-name" 
              v-model="params.execute.UpdateUserDomainData.name" 
              placeholder="Domain name to be updated" 
            />
            <br />
            <label>metadata_update:</label>
            <!-- Add / Remove Accounts & Websites -->
            <ol>
              <li>
                <button 
                  @click="params.execute.UpdateUserDomainData.metadata_update.accounts.push({username: null, profile: null, account_type: null, verification_hash: null})"
                >Add Account</button>
                <button 
                  @click="params.execute.UpdateUserDomainData.metadata_update.accounts = [];"
                >Remove Accounts</button>
              </li>
              <li>
                <button 
                  @click="params.execute.UpdateUserDomainData.metadata_update.websites.push({url: null, domain: null, verification_hash: null})"
                >Add Website</button>
                <button 
                  @click="params.execute.UpdateUserDomainData.metadata_update.websites = [];"
                >Remove Websites</button>
              </li>
            </ol>
            <ol>
              <li>
                <input 
                  type="text" 
                  class="metadata-description" 
                  v-model="params.execute.UpdateUserDomainData.metadata_update.description" 
                  placeholder="NFT metadata description" 
                />  
              </li>
              <li>
                <input 
                  type="text" 
                  class="metadata-image" 
                  v-model="params.execute.UpdateUserDomainData.metadata_update.image" 
                  placeholder="NFT metadata image URL" 
                />
              </li>
              <li v-for="(account, i) in params.execute.UpdateUserDomainData.metadata_update.accounts" :key="i">
                <ol v-if="params.execute.UpdateUserDomainData.metadata_update.accounts[i]">
                  <li>
                    <label :for="'username_'+i">Account username:</label>
                    <input 
                      type="text" 
                      class="metadata-account-username" 
                      :name="'username_'+i"
                      v-model="params.execute.UpdateUserDomainData.metadata_update.accounts[i].username" 
                      placeholder="@chainofinsight" 
                    />
                  </li>
                  <li>
                    <label :for="'profile_'+i">Account profile link:</label>
                    <input 
                      type="text" 
                      class="metadata-account-profile" 
                      :name="'profile_'+i"
                      v-model="params.execute.UpdateUserDomainData.metadata_update.accounts[i].profile" 
                      placeholder="twitter.com/chainofinsight" 
                    />
                  </li>
                  <li>
                    <label :for="'account_type_'+i">Account type:</label>
                    <input 
                      type="text" 
                      class="metadata-account-account_type" 
                      :name="'account_type_'+i"
                      v-model="params.execute.UpdateUserDomainData.metadata_update.accounts[i].account_type" 
                      placeholder="e.g. 'twitter', 'github', 'email', etc." 
                    />
                  </li>
                  <li>
                    <label :for="'verification_hash_'+i">Account verification_hash:</label>
                    <input 
                      type="text" 
                      class="metadata-account-verification_hash" 
                      :name="'verification_hash_'+i"
                      v-model="params.execute.UpdateUserDomainData.metadata_update.accounts[i].verification_hash" 
                      disabled
                    />
                  </li>
                </ol>
              </li>

              <li v-for="(site, i) in params.execute.UpdateUserDomainData.metadata_update.websites" :key="i">
                <ol v-if="params.execute.UpdateUserDomainData.metadata_update.websites[i]">
                  <li>
                    <label :for="'url_'+i">Website URL:</label>
                    <input 
                      type="text" 
                      class="metadata-website-url" 
                      :name="'url_'+i"
                      v-model="params.execute.UpdateUserDomainData.metadata_update.websites[i].url" 
                      placeholder="chainofinsight.com" 
                    />
                  </li>
                  <li>
                    <label :for="'domain_'+i">Archway domain for this website:</label>
                    <input 
                      type="text" 
                      class="metadata-website-domain" 
                      :name="'domain_'+i"
                      v-model="params.execute.UpdateUserDomainData.metadata_update.websites[i].domain" 
                      placeholder="chainofinsight.arch" 
                    />
                  </li>
                  <li>
                    <label :for="'site_verification_hash_'+i">Website verification_hash:</label>
                    <input 
                      type="text" 
                      class="metadata-website-verification_hash" 
                      :name="'site_verification_hash_'+i"
                      v-model="params.execute.UpdateUserDomainData.metadata_update.websites[i].verification_hash" 
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

          <!-- RemoveSubdomain (domain, subdomain, client = null) -->
          <li>
            <button 
              class="btn-tx btn-withdraw-tx" 
              @click="executeRemoveSubdomain();"
              :disabled="(!params.execute.RemoveSubdomain.domain || !params.execute.RemoveSubdomain.subdomain)"
            >ExecuteMsg::RemoveSubdomain</button>
            <input 
              type="text" 
              class="domain-name" 
              v-model="params.execute.RemoveSubdomain.domain" 
              placeholder="Top level domain name to be updated" 
            />
            <input 
              type="text" 
              class="subdomain-name" 
              v-model="params.execute.RemoveSubdomain.subdomain" 
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
import { ToAtto } from '../util/denom';

import { 
  Config, 
  ResolveRecord, 
  RecordExpiration,
} from '../util/query';

import {
  Register,
  RenewRegistration,
  UpdateResolver,
  RegisterSubdomain,
  UpdateUserDomainData,
  UpdateConfig,
  Withdraw,
  RemoveSubdomain
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
        RegisterSubdomain: {
          domain: null,
          subdomain: null,
          new_resolver: null,
          new_owner: null,
          mint: "true",
          expiration: null,
        },
        UpdateUserDomainData: {
          name: null,
          metadata_update: {
            description: null,
            image: null,
            accounts: [],
            websites: [],
          }
        },
        UpdateConfig: {
          admin: null,
          wallet: null,
          cw721: null,
          base_cost: null,
          base_expiration: null
        },
        Withdraw: {
          amount: null,
        },
        RemoveSubdomain: {
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
          let walletType = sessionStorage.getItem("connected");
          this.cwClient = await Client(walletType);
          this.accounts = await Accounts(this.cwClient);
          if (this.accounts.length) this.params.execute.RegisterSubdomain.new_owner = this.accounts[0].address;
          console.log('Test Bench', {cwClient: this.cwClient, accounts: this.accounts, walletType: walletType});
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
      
      // First load
      if (this.result.query['base_cost'] && !this.params.execute.UpdateConfig.base_cost) {
        this.params.execute.UpdateConfig.admin = this.result.query.admin;
        this.params.execute.UpdateConfig.wallet = this.result.query.wallet;
        this.params.execute.UpdateConfig.cw721 = this.result.query.cw721;
        this.params.execute.UpdateConfig.base_cost = this.result.query.base_cost;
        this.params.execute.UpdateConfig.base_expiration = this.result.query.base_expiration;
      }
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
    executeRegisterSubdomain: async function () {
      let mint = true;
      if (this.params.execute.RegisterSubdomain.mint == "false") mint = false;

      this.result.execute = await RegisterSubdomain(
        this.params.execute.RegisterSubdomain.domain,
        this.params.execute.RegisterSubdomain.subdomain,
        this.params.execute.RegisterSubdomain.new_resolver,
        this.params.execute.RegisterSubdomain.new_owner,
        mint,
        this.params.execute.RegisterSubdomain.expiration,
        this.cwClient
      );
      console.log('RegisterSubdomain tx', this.result.execute);
    },
    executeUpdateUserDomainData: async function () {
      if (!this.params.execute.UpdateUserDomainData.name) return;

      let metadata_update = {
        description: this.params.execute.UpdateUserDomainData.metadata_update.description,
        image: this.params.execute.UpdateUserDomainData.metadata_update.image,
      };

      if (this.params.execute.UpdateUserDomainData.metadata_update.accounts.length) metadata_update.accounts = this.params.execute.UpdateUserDomainData.metadata_update.accounts;
      if (this.params.execute.UpdateUserDomainData.metadata_update.websites.length) metadata_update.websites = this.params.execute.UpdateUserDomainData.metadata_update.websites;

      this.result.execute = await UpdateUserDomainData(
        this.params.execute.UpdateUserDomainData.name,
        metadata_update,
        this.cwClient
      );
      console.log('UpdateUserDomainData tx', this.result.execute);
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
      let withdrawAmount = ToAtto(Number(this.params.execute.Withdraw.amount), true);
      this.result.execute = await Withdraw(
        withdrawAmount,
        this.cwClient
      );
      console.log('Withdraw tx', this.result.execute);
    },
    executeRemoveSubdomain: async function () {
      if (!this.params.execute.RemoveSubdomain.domain || !this.params.execute.RemoveSubdomain.subdomain) return;
      this.result.execute = await RemoveSubdomain(
        this.params.execute.RemoveSubdomain.domain,
        this.params.execute.RemoveSubdomain.subdomain,
        this.cwClient
      );
      console.log('RemoveSubdomain tx', this.result.execute);
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
  background-color: #FF4D00;
  padding-top: 8em;
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
