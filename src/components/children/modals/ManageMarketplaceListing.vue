<template>
  <transition name="modal">
    <div v-if="showModal" class="modal-wrapper">
      <div class="modalt" v-if="loaded">
        <div class="modal-header manage-listing">
          <div class="left">
            <p class="modal-manage-listing-title">Manage Listing</p>
            <p class="modal-manage-listing-subtitle" v-if="domain">{{domain}}</p>
          </div>
          <div class="right">
            <span class="close-x manage-listing" @click="emitClose();">&times;</span>
          </div>
        </div>
        <div class="modal-body manage-listing">
          <!-- Listing Amount -->
          <label class="list label" for="list">Listing Amount</label>
          <div class="list-input">
            <input 
              type="number"
              step="any"
              min="0" 
              class="list-price form-control"
              name="price"
              v-model="updates.price"
            />
            <div class="denom list-denom">
              <span class="icon icon-denom-alt"></span>&nbsp;<span class="denom denom-text">ARCH</span>
            </div>
          </div>
          <!-- Listing Expiry -->
          <label class="list label" for="list">Listing End Date</label>
          <!-- Readonly for now... -->
          <!-- XXX TODO: Add datepicker library -->
          <input 
              type="text"
              class="list-expiry form-control"
              name="expiration"
              v-model="updates.expiry"
              readonly
            />
        </div>
        <div class="modal-footer manage-listing">
          <!-- Exit -->
          <button class="btn btn-inverse" @click="emitClose();">Cancel</button>
          
          <!-- Cancel Swap -->
          <button 
            class="btn btn-inverse btn-cancel-swap"
            @click="executeCancelSwap();"
          >Remove Listing</button>
          <!-- Update Swap -->
          <button 
            class="btn btn-primary btn-update-swap"
            @click="executeUpdateSwap();"
            :disabled="!updates.price && !updates.expiry"
          >Update</button>
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
    key="modal-sub-n-2"
  >
  </Notification>
</template>

<script>
import { Accounts } from '../../../util/client';
import { ApprovalsCw721, ApproveCw721 } from '../../../util/approvals';
import { Query as MarketplaceQuery, Execute as MarketplaceExecute } from '../../../util/marketplace';
import { DateFormat, NanoToSeconds } from '../../../util/datetime';
import { FromAtto, ToAtto } from '../../../util/denom';

import Notification from '../Notification.vue';

const MARKETPLACE_CONTRACT = process.env.VUE_APP_MARKETPLACE_CONTRACT;
const DEFAULT_TOKEN_IMG = "token.svg";

export default {
  props: {
    domain: String,
    swapDetails: Object,
    cw721: String,
    cwClient: Object,
    showModal: Boolean,
  },
  emits: ['dataResolution', 'close'],
  components: { Notification },
  data: () => ({
    account: null,
    executeResult: null,
    swap: null,
    loaded: false,
    updates: {
        price: null,
        expiry: null,
    },
    notify: {
      type: null,
      title: null,
      msg: null,
      img: null,
    },
    niceDate: DateFormat,
    formatFromAtto: FromAtto,
  }),
  mounted: async function () {
    if (this.swapDetails) this.swap = this.swapDetails;
    else this.swap = await this.getSwapDetails();
    this.account = await this.getAccount();
    let dateAsSeconds = NanoToSeconds(Number(this.swap.expires.at_time));
    this.updates.price = FromAtto(this.swap.price);
    this.updates.expiry = DateFormat(dateAsSeconds);
    this.loaded = true;
  },
  methods: {
    // Queries
    getSwapDetails: async function () {
      if (!this.domain || !this.cwClient) return;
      let swapQuery = await MarketplaceQuery.Details(this.domain, this.cwClient);
      return swapQuery;
    },
    // Txs
    executeCancelSwap: async function () {
      if (typeof this.domain !== 'string' && typeof this.swap['id'] !== 'string') return;

      // Waiting notification
      this.notify = {
        type: "loading",
        title: "Cancelling your swap",
        msg: "Preparing to remove " + this.domain + " from the marketplace",
        img: null,
      };

      this.emitClose();

      let swapId = (this.swap['id']) ? this.swap.id : this.domain;
      this.executeResult = await MarketplaceExecute.Cancel(
        swapId,
        this.cwClient
      );

      if (!this.executeResult['error']) {
        // Success notification
        this.notify = {
          type: "success",
          title: "Listing removed",
          msg: this.domain + " has been successfully removed from the marketplace",
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

    // Marketplace needs approval to transfer the user's cw721 to the buyer
    executeApproveSpendCw721: async function () {
      if (typeof this.domain !== 'string') return;

      this.emitClose();

      // Waiting notification
      this.notify = {
        type: "loading",
        title: "Marketplace needs approval",
        msg: "Approve marketplace to transfer " + this.domain + " to a buyer",
        img: null,
      };

      this.executeResult = await ApproveCw721(
        this.domain,
        this.cwClient
      );
      // console.log('cw721 approval', this.executeResult);

      let approved;
      if (!this.executeResult['error']) {
        approved = false;
      } else {
        // Error notification
        this.notify = {
          type: "error",
          title: "Something went wrong",
          msg: this.executeResult.error,
          img: null,
        };
        approved = true;
      }
      return approved;
    },

    executeUpdateSwap: async function () {
      if (!this.updates.price && !this.updates.expiry) return;
      let price = (this.updates.price) ? ToAtto(this.updates.price, true) : this.swap.price;
      let expiry = (this.updates.expiry) ? new Date(this.updates.expiry.replace(" at ", ",")).getTime() : Number(this.swap.expires);

      // Check if token already approved for listing
      let approved;
      let query = await ApprovalsCw721(this.domain, false, this.cwClient);
      if (!query['approvals']) approved = false;
      else if (!Array.isArray(query.approvals)) approved = false;
      else if (!query.approvals.length) approved = false;
      else {
        query.approvals.forEach((approval) => {
          if (approval['spender']) {
            if (approval.spender == MARKETPLACE_CONTRACT) approved = true;
          }
        });
      }

      // Request approval for marketplace to spend cw721 (if required)
      let approvalUpdate;
      if (!approved) approvalUpdate = await this.executeApproveSpendCw721();
      // console.log('Approvals updated?', approvalUpdate);

      // Waiting notification
      this.notify = {
        type: "loading",
        title: "Updating your swap",
        msg: "Preparing to update marketplace listing for " + this.domain,
        img: null,
      };

      if (!approvalUpdate) this.emitClose();

      let swapId = (this.swap['id']) ? this.swap.id : this.domain;
      this.executeResult = await MarketplaceExecute.Update(
        swapId,
        expiry,
        price,
        this.cwClient
      );

      if (!this.executeResult['error']) {
        // Success notification
        this.notify = {
          type: "success",
          title: "Listing updated",
          msg: this.domain + " has been successfully updated in the marketplace",
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
    closeNotification: function () {
      this.notify = {
        type: null,
        title: null,
        msg: null,
        img: null,
      };
    },
    emitClose: function () {
      this.$emit('close', this.showModal);
    },
  }
}
</script>

<style>
.modal-manage-listing-title {
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
.list-price.form-control,
.list-expiry.form-control {
  background: #F2EFED;
  border-radius: 8px;
  height: 56px;
  border: none;
}
input.list-price {
  text-align: right;
  padding-top: 2em;
  padding-bottom: 2em;
}
div.denom.list-denom {
  position: relative;
  top: -52px;
  margin-left: 20px;
  display: inline-block;
}
span.denom-text {
  position: relative;
  top: -7px;
  color: #666666;
  font-weight: 400;
  font-size: 14px;
  line-height: 16.8px;
}
</style>