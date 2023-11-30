<template>
  <transition name="modal">
    <div v-if="showModal" class="modal-wrapper">
      <div class="modalt" v-if="loaded">
        <div class="modal-header resolver-mismatch">
          <div class="left">
            <p class="modal-resolver-mismatch-title">Domain owner and record differ</p>
          </div>
          <div class="right">
            <span class="close-x resolver-mismatch" @click="emitClose();">&times;</span>
          </div>
        </div>
        <div class="modal-body resolver-mismatch">
          <div class="resolver">
            <p class="descr">Domain Owner</p>
            <div class="domain-owner value" v-if="owner">
              <span>{{owner.owner}}</span>
            </div>
            <p class="descr">Domain Record</p>
            <div class="domain-resolver value configurable pointer"
              @click="editingResolverHandler"
              v-if="!editingResolver"
            >
              <span>{{(domainRecord.address) ? domainRecord.address : 'Expired'}}</span>
            </div>
            <div class="input-group domain-record value" v-if="editingResolver">
              <input 
                type="text" 
                class="metadata-token-description form-control" 
                name="token_description"
                v-model="newResolver"
                placeholder="Archway address for this domain"
              />
              <span class="input-group-text pointer" @click="newResolver = account">Resolve to me</span>
              <span class="input-group-text pointer exit edit-descr" @click="editDomainRecordHandler();">&times;</span>
            </div>
            <p class="descr" v-if="!editingResolver && !isSubdomain">Click the domain record to update it.</p>
          </div>          
        </div>
        <div class="modal-footer resolver-mismatch">
          <button class="btn btn-inverse" @click="emitClose();">Cancel</button>
          <button 
            class="btn btn-primary btn-update-resolver"
            @click="executeUpdateResolver();"
            v-if="!isSubdomain"
            :disabled="!newResolver || newResolver.length < 46"
          >Update Record</button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Tx. Notifications -->
  <Notification
    v-bind:type="notify.type"
    v-bind:title="notify.title"
    v-bind:msg="notify.msg"
    v-bind:img="notify.img"
    v-if="notify.type"
    @closeNotification="closeNotification"
    key="modal-sub-n-1"
  >
  </Notification>
</template>

<script>
import { Accounts } from '../../../util/client';
import { OwnerOf } from '../../../util/token';
import { ResolveRecord } from '../../../util/query';
import { UpdateResolver } from '../../../util/execute';

import Notification from '../Notification.vue';

const DEFAULT_TOKEN_IMG = "token.svg";

export default {
  props: {
    domain: String,
    cw721: String,
    cwClient: Object,
    showModal: Boolean,
  },
  emits: ['dataResolution', 'close'],
  components: { Notification },
  data: () => ({
    account: null,
    newResolver: null,
    domainRecord: null,
    isExpired: null,
    owner: null,
    editingResolver: false,
    executeResult: null,
    loaded: false,
    notify: {
      type: null,
      title: null,
      msg: null,
      img: null,
    },
  }),
  mounted: async function () {
    this.account = await this.getAccount();
    await this.ownerData();
    await this.resolveDomainRecord();
    this.loaded = true;
  },
  watch: {
    async showModal() {
      await this.ownerData();
    },
  },
  methods: {
    // Queries
    ownerData: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      this.owner = await OwnerOf(this.domain, this.cw721, this.cwClient);
      // console.log('Token owner query', this.owner);
    },
    resolveDomainRecord: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      this.domainRecord = await ResolveRecord(
        this.domain,
        this.cwClient
      );
      if (!this.domainRecord.address) this.isExpired = true;
      else this.isExpired = false;
      // console.log('ResolveRecord query', this.domainRecord);
    },

    // Txs
    executeUpdateResolver: async function () {
      if (!this.newResolver || !this.domain) return;

      // Waiting notification
      this.notify = {
        type: "loading",
        title: "Getting your domain record ready",
        msg: "Updating the record for " + this.domain,
        img: null,
      };

      this.emitClose();

      let domain = this.domain.slice(0,-5);
      this.executeResult = await UpdateResolver(
        domain,
        this.newResolver,
        this.cwClient
      );
      // console.log('UpdateResolver tx', this.executeResult);

      if (!this.executeResult['error']) {
        // Success notification
        this.notify = {
          type: "success",
          title: "Update complete",
          msg: "The domain record for " + this.domain + " has been updated",
          img: DEFAULT_TOKEN_IMG,
        };
        // Refresh domain
        this.$emit('dataResolution', this.domain);
      } else {
        // Error notification
        this.notify = {
          type: "error",
          title: "Something went wrong",
          msg: this.executeResult.error,
          img: null,
        };
      }
    },

    // Util
    getAccount: async function () {
      if (!this.cwClient) return null;
      let accounts = await Accounts(this.cwClient);
      if (!accounts.length) return null;
      return accounts[0].address;
    },
    editDomainRecordHandler: function () {
      this.newResolver = null;
      this.editingResolver = false;
    },
    editingResolverHandler: function () {
      if (typeof this.domain !== 'string') return;
      if (this.isNotSubdomain(this.domain)) this.editingResolver = !this.editingResolver
    },
    closeNotification: function () {
      this.notify = {
        type: null,
        title: null,
        msg: null,
        img: null,
      };
    },
    isNotSubdomain: function (domain) {
      if (typeof domain !== 'string') return null;
      else if (domain.slice(0,-5).indexOf(".") < 0) return true;
      else return false;
    },
    emitClose: function () {
      this.$emit('close', this.showModal);
    },
  },
  computed: {
    isSubdomain: function () {
      if (typeof this.domain !== 'string') return null;
      else if (this.domain.slice(0,-5).indexOf(".") < 0) return false;
      else return true;
    }
  }
}
</script>

<style>
.modal-resolver-mismatch-title {
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 150%;
  letter-spacing: -0.03em;
  color: #000000;
}
div.value {
  margin-bottom: 1.25em;
}
</style>