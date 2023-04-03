<template>
  <div class="domain-item collapsible">
    <div class="left">
      <router-link class="domain-name header" v-if="domain" :to="'/domains/' + domain">{{domain}}</router-link>
    </div>
    <div class="right">
      <div :class="{'caret': true, 'active': !closed}" @click="domainDetails();">&caron;</div>
    </div>
    <div class="body" v-if="!closed">
      <div class="container" v-if="token">
        <!-- Description -->
        <div class="description row" v-if="token.extension">
          <p class="descr">Description</p>
          <p class="value token-description">{{token.extension.description}}</p>
        </div>
        <!-- Domain Record -->
        <div class="domain-record row" v-if="domainRecord">
          <div class="col resolver">
            <p class="descr">Domain Record</p>
            <div class="domain-resolver value">{{domainRecord.address}}</div>
          </div>
          <div class="col expiry">
            <p class="descr">Expiration date</p>
            <p class="value">{{ niceDate(domainRecord.expiration) }}</p>
          </div>
          <div class="col ctrl">
            <!-- XXX TODO: Update domain metadata -->
            <button class="btn btn-inverse" v-if="!isReadOnly || (owner.owner == viewer && owner)" @click="executeUpdateMetadata();" :disabled="!editing">Update</button>
            <button class="btn btn-inverse" @click="modals.renew = !modals.renew" v-if="!isSubdomain">Extend</button>
          </div>
        </div>
        <!-- Identities -->
        <div class="row id-row" v-if="!isSubdomain">
          <!-- Accounts -->
          <div class="col accounts clear">
            <div class="title accounts-title">
              <span class="icon icon-accounts"></span>
              <h5>Accounts</h5>
              <div class="float-right add account" v-if="!isReadOnly || (owner.owner == viewer && owner)" @click="creating.account = !creating.account;">
                <span v-if="!creating.account">+</span>
                <span v-if="creating.account">&times;</span>
              </div>
              <div class="accounts-list">
                <!-- Current Accounts -->
                <div class="account-item item" v-for="(account, i) in token.extension.accounts" :key="i+'-accounts'">
                  <a :href="account.profile" target="_blank">{{account.account_type}}</a>
                </div>
                <!-- Accounts to be added -->
                <div class="account-item item" v-for="(account, i) in newDomainItems.accounts" :key="i+'-new-accounts'">
                  <a :href="account.profile" target="_blank">{{account.account_type}}</a>
                </div>
                <!-- Add an Account form -->
                <div class="new-account-item creating" v-if="creating.account">
                  <!-- Add Account Titlebar -->
                  <div class="new-account-title">
                    <div class="left">
                      <h5>New Account</h5>
                    </div>
                    <div class="right">
                      <span class="close-x" @click="creating.account = !creating.account;">&times;</span>
                    </div>
                    <hr class="title-hr" />
                  </div>
                  <!-- Account Type -->
                  <select class="metadata-account-type form-control" v-model="newAccountModel.account_type">
                    <option :value="null" disabled>Select account type</option>
                    <option :value="accountLabels.twitter">Twitter</option>
                    <option :value="accountLabels.github">GitHub</option>
                    <option :value="accountLabels.email">E-mail Adress</option>
                  </select>
                  <!-- Account Username -->
                  <label class="account-label" for="account_username" v-if="newAccountModel.account_type">User</label>
                  <input 
                    type="text" 
                    class="metadata-account-username form-control" 
                    name="account_username"
                    v-model="newAccountModel.username" 
                    placeholder="@archid"
                    v-if="newAccountModel.account_type == accountLabels.twitter"
                  />
                  <input 
                    type="text" 
                    class="metadata-account-username form-control" 
                    name="account_username"
                    v-model="newAccountModel.username" 
                    placeholder="archid"
                    v-if="newAccountModel.account_type == accountLabels.github"
                  />
                  <input 
                    type="text" 
                    class="metadata-account-username form-control" 
                    name="account_username"
                    v-model="newAccountModel.username" 
                    placeholder="hello@archid.app"
                    v-if="newAccountModel.account_type == accountLabels.email"
                  />
                  <!-- Account Profile -->
                  <label class="account-label" for="account_profile" v-if="newAccountModel.account_type && newAccountModel.account_type !== accountLabels.email">Profile Link</label>
                  <input 
                    type="text" 
                    class="metadata-account-profile form-control" 
                    :name="'account_profile'"
                    v-model="newAccountModel.profile" 
                    placeholder="https://twitter.com/archid"
                    v-if="newAccountModel.account_type == accountLabels.twitter"
                  />
                  <input 
                    type="text" 
                    class="metadata-account-profile form-control" 
                    :name="'account_profile'"
                    v-model="newAccountModel.profile" 
                    placeholder="https://github.com/archid"
                    v-if="newAccountModel.account_type == accountLabels.github"
                  />
                  <!-- Add Account Button -->
                  <button 
                    class="btn btn-primary full-width" 
                    @click="addAccount();" 
                    :disabled="!newAccountModel.account_type || !newAccountModel.username || (!newAccountModel.profile && newAccountModel.account_type !== accountLabels.email)"
                  >Create</button>
                </div>
              </div>
            </div>
          </div>
          <!-- Websites & Apps -->
          <div class="col websites clear">
            <div class="title websites-title">
              <span class="icon icon-websites"></span>
              <h5>Websites & Apps</h5>
              <div class="float-right add website" v-if="!isReadOnly || (owner.owner == viewer && owner)">
                <span>+</span>
              </div>
              <div class="websites-list">
                <div class="website-item item" v-for="(website, i) in token.extension.websites" :key="i+'-websites'">
                  <a :href="website.url" target="_blank">{{website.url}}</a>
                </div>
              </div>
            </div>
          </div>
          <!-- Subdomains -->
          <div class="col subdomains clear">
            <div class="title subdomains-title">
              <span class="icon icon-subdomains"></span>
              <h5>Subdomains</h5>
              <div class="float-right add subdomain" v-if="!isReadOnly || (owner.owner == viewer && owner)">
                <span>+</span>
              </div>
              <div class="subdomains-list">
                <div class="subdomain-item item" v-for="(subdomain, i) in token.extension.subdomains" :key="i+'-subdomains'">
                  <router-link :to="'/domains/' + subdomain.name + '.' + domain">{{subdomain.name + '.' + domain}}</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="loading" v-if="!token">
        <p>Loading domain data...</p>
      </div>
    </div>
  </div>

  <transition name="modal">
    <div v-if="modals.renew" class="modal-wrapper">
      <div class="modalt">
        <div class="modal-header">
          <div class="left">
            <p>Extend <span class="modal-title modal-domain-title" v-if="domain">{{domain}}</span></p>
            <p class="modal-descr">How long would you like to extend the domain life time?</p>
          </div>
          <div class="right">
            <span class="close-x" @click="modals.renew = !modals.renew;">&times;</span>
          </div>
        </div>
        <div class="modal-body">
          <div class="left">
            <div class="button-group select-expiry">
              <a :class="{'active': updates.expiry == 1, 'btn-1year': true}" @click="updates.expiry = 1;">1 year</a>
              <a :class="{'active': updates.expiry == 2, 'btn-2year': true}" @click="updates.expiry = 2;">2 years</a>
              <a :class="{'active': updates.expiry == 3, 'btn-3year': true}" @click="updates.expiry = 3;">3 years</a>
            </div>
          </div>
          <div class="right">
            <span class="cost" v-if="baseCost && updates.expiry">{{ formatFromMicro((baseCost * updates.expiry)) }}</span>
            <span class="arch-logo">arch</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-inverse" @click="modals.renew = !modals.renew;">Cancel</button>
          <button class="btn btn-primary" @click="executeRenewRegistration();">Continue</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { Accounts } from '../../util/client';
import { ResolveRecord } from '../../util/query';
import { Token, OwnerOf } from '../../util/token';
import {
  RenewRegistration,
//   UpdateResolver,
//   RegisterSubDomain,
  UpdataUserDomainData,
//   RemoveSubDomain
} from '../../util/execute';

import { DateFormat } from '../../util/datetime';
import { FromMicro } from '../../util/denom';

const ACCOUNT_TYPES = ['twitter', 'github', 'email'];
const TWITTER = ACCOUNT_TYPES[0];
const GITHUB = ACCOUNT_TYPES[1];
const EMAIL = ACCOUNT_TYPES[2];

export default {
  props: {
    domain: String,
    cw721: String,
    cwClient: Object,
    isSubdomain: Boolean,
    isReadOnly: Boolean,
    baseCost: Number,
  },
  data: () => ({
    token: null,
    owner: null,
    viewer: null,
    editing: false,
    domainRecord: null,
    executeResult: null,
    creating: {
      account: false,
      subdomain: false,
      website: false,
    },
    accountTypes: ACCOUNT_TYPES,
    accountLabels: {
      twitter: TWITTER,
      github: GITHUB,
      email: EMAIL,
    },
    newAccountModel: {
      account_type: null,
      profile: null,
      username: null,
      verfication_hash: null,
    },
    newDomainItems: {
      accounts: [],
      subdomains: [],
      websites: [],
    },
    updates: {
      metadata: null,
      expiry: 1,
      resolver: null
    },
    modals: {
      renew: false,
    },
    closed: true,
    niceDate: DateFormat,
    formatFromMicro: FromMicro,
  }),
  mounted: async function () {},
  methods: {
    domainDetails: async function () {
      if (!this.token || !this.owner || !this.domainRecord) {
        await this.dataResolutionHandler();
      }
      this.closed = !this.closed;
    },
    dataResolutionHandler: async function () {
      if (this.token && this.owner && this.domainRecord && this.viewer) return;
      let viewer;
      await this.tokenData();
      await this.ownerData();
      await this.resolveDomainRecord();
      if (this.cwClient) viewer = await Accounts(this.cwClient);
      if (viewer.length) this.viewer = viewer[0].address;
    },
    tokenData: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      this.token = await Token(this.domain, this.cw721, this.cwClient);
      if (this.token['extension']) this.updates.metadata = this.token.extension;
      console.log('Token query', this.token);
    },
    ownerData: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      this.owner = await OwnerOf(this.domain, this.cw721, this.cwClient);
      console.log('Token owner query', this.owner);
    },
    resolveDomainRecord: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      this.domainRecord = await ResolveRecord(
        this.domain,
        this.cwClient
      );
      console.log('ResolveRecord query', this.domainRecord);
    },
    addAccount: function () {
      if (!this.newAccountModel.account_type || !this.newAccountModel.profile || !this.newAccountModel.username) return;
      // Decouple account to be added, from tmp account model
      let account = JSON.parse(JSON.stringify(this.newAccountModel));
      if (account.account_type == TWITTER) {
        if (account.username.slice(0,1) !== "@") {
          account.username = "@" + account.username;
        }
      } else if (account.account_type == EMAIL) {
        if (!this.validEmailChars(account.username)) {
          console.error("Invalid email address");
          return;
        } else {
          account.profile = null;
        }
      }
      if (account.profile) {
        if (account.profile.slice(0,8) !== "https://" && account.profile.slice(0,7) !== "http://") {
          console.error("Invalid website address");
          return;
        }
      }
      this.newDomainItems.accounts.push(account);
      // Reset account model
      this.newAccountModel = {
        account_type: null,
        profile: null,
        username: null,
        verfication_hash: null,
      };
      console.log("Account to be added", account);
      this.creating.account = false;
      this.editing = true;
    },
    removeAccount: function (index) {
      if (!index || typeof index !== 'number') return;
      if (index < 0 || index > (this.updates.metadata.accounts.length - 1)) return;
      this.updates.metadata.accounts.splice(index, 1);
      this.editing = true;
    },
    removeNewAccount: function (index) {
      if (!index || typeof index !== 'number') return;
      if (index < 0 || index > (this.newDomainItems.accounts - 1)) return;
      this.newDomainItems.accounts.splice(index, 1);
    },
    addWebsite: function () {
      console.log('TODO');
    },
    addSubdomain: function () {
      console.log('TODO');
    },
    executeRenewRegistration: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      if (!this.updates.expiry || typeof this.updates.expiry !== 'number') return;
      if (!this.baseCost || typeof this.baseCost !== 'number') return;
      let cost = this.baseCost * this.updates.expiry;
      let domain = this.domain.slice(0,-5);
      console.log("Renew Registration Params", {
        domain: domain,
        expiry: this.updates.expiry,
        cost: cost,
        client: this.cwClient
      });
      this.executeResult = await RenewRegistration(
        domain,
        this.updates.expiry,
        cost,
        this.cwClient
      );
      this.modals.renew = false;
      console.log('RenewRegistration tx', this.executeResult);
      // Resolve new expiration in UI
      await this.dataResolutionHandler();
    },
    executeUpdateMetadata: async function () {
      if (!this.updates.metadata) return;
      this.updates.metadata.accounts = [...this.newDomainItems.accounts, ...this.updates.metadata.accounts];
      this.updates.metadata.websites = [...this.newDomainItems.websites, ...this.updates.metadata.websites];
      let domain = this.domain.slice(0,-5);
      this.executeResult = await UpdataUserDomainData(
        domain,
        this.updates.metadata,
        this.cwClient
      );
      console.log('UpdataUserDomainData tx', this.executeResult);
      // Reset forms and data
      this.editing = false;
      this.newDomainItems.accounts = [];
      this.newDomainItems.websites = [];
    },

    // Util
    validEmailChars: function (email) {
      let re = /\S+@\S+\.\S+/;
      return re.test(email);
    },
  },
}
</script>

<style scoped>
.domain-name.header {
  font-weight: 500;
  font-size: 32px;
  line-height: 130%;
  text-decoration: none;
}
div.left, div.right {
  display: inline-block;
}
div.left {
  width: 70%;
}
div.right {
  width: 30%;
  text-align: right;
}
.modal-wrapper {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0,0,0);
  background-color: rgba(0,0,0,0.4);
}
.modalt {
  clear: both;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 595px;
  background: #ffffff;
  border-radius: 4px;
}
div.caret {
  text-align: right;
  font-size: 2em;
  display: block;
  text-align: right;
  cursor: pointer;
}
div.caret.active {
  transform: scaley(-1);
}
.ctrl button {
  float: right;
}
.ctrl, .row {
  clear: both;
}
div.domain-resolver.value {
  padding: 16px;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  background: #F2EFED;
  border-radius: 8px;
}
.descr {
  color: #666666;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
}
div.id-row {
  margin-top: 2em;
}
.id-row .col {
  padding: 16px;
  gap: 16px;
  background: #F2EFED;
  border-radius: 8px;
  margin-right: 1em;
  justify-content: space-between;
}
.col h5 {
  width: 80%;
  display: inline-block;
}
div.add {
  color: #FF4D00;
  display: inline-block;
  padding: 1em;
  background-color: #fff;
  max-width: 48px;
  max-height: 48px;
  border-radius: 8px;
  cursor: pointer;
}
.add span {
  position: relative;
  top: -4px;
}
div.item {
  background-color: #fff;
  padding: 16px;
  gap: 16px;
  border-radius: 8px;
  margin-top: 2em;
}
div.new-account-item select, div.new-account-item input {
  margin-bottom: 1.25em;
}
div.creating {
  margin-top: 1em;
  padding: 16px;
  gap: 16px;
  background: #FFFFFF;
  box-shadow: 0px 15px 54px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
}
</style>