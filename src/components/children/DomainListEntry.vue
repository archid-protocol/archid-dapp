<template>
  <div class="domain-item collapsible">
    <div class="left">
      <router-link class="domain-name header" v-if="domain" :to="'/domains/' + domain">{{domain}}</router-link>
    </div>
    <div class="right">
      <div class="caret closed" @click="domainDetails();" v-if="closed">&caron;</div>
      <div class="caret open" @click="domainDetails();" v-if="!closed">&#94;</div>
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
            <!-- <button class="btn btn-inverse">Update</button> -->
            <button class="btn btn-inverse" @click="modals.renew = !modals.renew" v-if="!isSubdomain">Extend</button>
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
import { ResolveRecord } from '../../util/query';
import { Token, OwnerOf } from '../../util/token';
import {
  RenewRegistration,
//   UpdateResolver,
//   RegisterSubDomain,
//   UpdataUserDomainData,
//   RemoveSubDomain
} from '../../util/execute';

import { DateFormat } from '../../util/datetime';
import { FromMicro } from '../../util/denom';

export default {
  props: {
    domain: String,
    cw721: String,
    cwClient: Object,
    isSubdomain: Boolean,
    baseCost: Number,
  },
  data: () => ({
    token: null,
    owner: null,
    domainRecord: null,
    executeResult: null,
    domainItems: {
      accounts: null,
      subdomains: null,
      websites: null,
    },
    updates: {
      metadata: {},
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
      if (this.token && this.owner && this.domainRecord) return;
      await this.tokenData();
      await this.ownerData();
      await this.resolveDomainRecord();
    },
    tokenData: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      this.token = await Token(this.domain, this.cw721, this.cwClient);
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
      await this.resolveDomainRecord();
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
</style>