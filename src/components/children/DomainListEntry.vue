<template>
  <div :class="{'domain-item': true, 'collapsible': true, 'expanded': !closed || !collapsible}">
    <div class="head">
      <div class="left">
        <router-link class="domain-name header" v-if="domain" :to="'/domains/' + domain">{{domain}}</router-link>
        <span class="badge badge-warning badge-unsaved-changes" v-if="editing || editingDescr || updatingImg">Unsaved Changes</span>
      </div>
      <div class="right">
        <div :class="{'caret': true, 'active': !closed}" @click="domainDetails();" v-if="collapsible">&caron;</div>
      </div>
    </div>
    <div class="body" v-if="!closed || !collapsible">
      <div class="container-c" v-if="token && owner">
        <div class="domain-data top row">
          <!-- Col 1; Image -->
          <div class="col img-t">
            <div class="token-img wrapper">
              <div class="img token-img" :style="'background-image: url(' + tokenImg + ');'">
                <div class="upload btn-upload pointer" v-if="!isReadOnly || (owner.owner == viewer)" @click="modals.editingImg = !editingImg;">
                  <span class="icon icon-upload"></span>
                </div>
              </div>
            </div>

            <!-- Update Image Modal -->
            <transition name="modal">
              <div v-if="modals.editingImg" class="modal-wrapper">
                <div class="modalt">
                  <div class="modal-header img-edit">
                    <div class="left">
                      <p class="modal-img-edit-title">Edit Image</p>
                    </div>
                    <div class="right">
                      <span class="close-x img-edit" @click="modals.editingImg = !modals.editingImg;">&times;</span>
                    </div>
                  </div>
                  <div class="modal-body img-edit">
                    <div class="img-type">
                      <div class="button-group select-img-type">
                        <a :class="{'active': newImgModel.type == 'ipfs', 'btn-img-ipfs': true}" @click="newImgModel.type = 'ipfs'">IPFS</a>
                        <a :class="{'active': newImgModel.type == 'url', 'btn-img-url': true}" @click="newImgModel.type = 'url'">Web URL</a>
                      </div>
                    </div>
                    <div class="ipfs-images" v-if="newImgModel.type == 'ipfs'">
                      <label class="img-edit" for="token_img">IPFS Content Identifier (CID)</label>
                      <input 
                        type="text" 
                        class="metadata-token-img form-control" 
                        name="token_img"
                        v-model="newImgModel.value"
                        placeholder="QmYnh4B8Fp93Ax2taHJDx6XJuxJsvB4nFEDR8XxkDJekHq"
                        @keyup="editImgHandler();"
                      />
                    </div>
                    <div class="web2-images" v-if="newImgModel.type == 'url'">
                      <label class="img-edit" for="token_img">Image URL</label>
                      <input 
                        type="text" 
                        class="metadata-token-img form-control" 
                        name="token_img"
                        v-model="newImgModel.value"
                        placeholder="https://archid.app/img/brand/token.png"
                        @keyup="editImgHandler();"
                      />
                    </div>
                  </div>
                  <div class="modal-footer subdomain">
                    <div class="img-update btn-wrapper full-width" v-if="newImgModel.value">
                      <button 
                        class="btn btn-inverse btn-update-img float-left"
                        @click="cancelEditImgHandler();"
                      >Cancel</button>
                      <button 
                        class="btn btn-primary btn-update-img float-right"
                        @click="createImgUpdate();"
                        :disabled="newImgModel.value.length < 7"
                      >Update</button>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
          <!-- Col 2; Description, Expiry, Extend -->
          <div class="col">
            <!-- Description -->
            <div class="description" v-if="token.extension && owner">
              <p class="descr">Description</p>
              <p :class="{'value': true, 'token-description': true, 'configurable': owner.owner == viewer}" @click="editDescriptionHandler();" v-if="!editingText || (owner.owner !== viewer && owner)">{{token.extension.description}}</p>
              <div class="input-group metadata-token-description" v-if="editingText && owner.owner == viewer">
                <input 
                  type="text" 
                  class="metadata-token-description form-control" 
                  name="token_description"
                  v-model="updates.metadata.description"
                  placeholder="Describe your ArchID domain"
                  @keyup="editingDescr = true;"
                />
                <span class="input-group-text pointer exit edit-descr" @click="editDescriptionHandler();">&times;</span>
              </div>
            </div>
            <!-- Expiration -->
            <div class="expiry" v-if="domainRecord">
              <p class="descr">Expiration date</p>
              <p class="value" v-if="domainRecord.expiration">{{ niceDate(domainRecord.expiration) }}</p>
            </div>
            <!-- Btn. Extend -->
            <div class="ctrl" v-if="!isSubdomain && owner">
              <button class="btn btn-inverse" @click="modals.renew = !modals.renew" v-if="owner.owner == viewer">Extend</button>
            </div>
          </div>
          <!-- Col 3; Owner, Domain Record -->
          <div class="col">
            <!-- Owner -->
            <div class="domain-owner-record">
              <div class="owner" v-if="owner">
                <p class="descr">Owner</p>
                <div class="domain-owner value">{{ owner.owner }}</div>
              </div>
            </div>
            <!-- Domain Record -->
            <div class="domain-record" v-if="domainRecord && owner">
              <div class="resolver">
                <p class="descr">Domain Record</p>
                <div 
                  :class="{'domain-resolver': true, 'value': true, 'configurable': owner.owner == viewer}"
                  @click="editDomainRecordHandler();"
                  v-if="!editingResolver || (owner.owner !== viewer)"
                >{{domainRecord.address}}</div>
                <div class="input-group domain-record" v-if="editingResolver && owner.owner == viewer">
                  <input 
                    type="text" 
                    class="metadata-token-description form-control" 
                    name="token_description"
                    v-model="updates.resolver"
                    placeholder="Archway address for this domain"
                  />
                  <span class="input-group-text pointer exit edit-descr" @click="editDomainRecordHandler();">&times;</span>
                </div>
                <button 
                  class="btn btn-primary btn-update-resolver"
                  v-if="editingResolver && owner.owner == viewer"
                  @click="executeUpdateResolver();"
                  :disabled="!updates.resolver || updates.resolver.length < 46"
                >Update Record</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Identities -->
        <div class="row id-row" v-if="!isSubdomain && owner">
          <!-- Accounts -->
          <div class="col accounts clear" v-if="viewer == owner.owner || token.extension.accounts.length">
            <div class="title accounts-title row">
              <span class="icon icon-accounts"></span>
              <h5>Accounts</h5>
              <div class="add account" v-if="!isReadOnly || (owner.owner == viewer)" @click="creating.account = !creating.account;">
                <span v-if="!creating.account">+</span>
                <span v-if="creating.account">&times;</span>
              </div>
            </div>
            <div class="accounts-list">
              <!-- Current Accounts -->
              <div class="account-item item" v-for="(account, i) in token.extension.accounts" :key="i+'-accounts'">
                <div class="left">
                  <a :href="account.profile" target="_blank" v-if="account.account_type == accountLabels.github"><span class="icon icon-github"></span>GitHub</a>
                  <a :href="account.profile" target="_blank" v-if="account.account_type == accountLabels.twitter"><span class="icon icon-twitter"></span>{{account.account_type}}</a>
                  <a :href="'mailto:'+account.username" v-if="account.account_type == accountLabels.email">{{account.account_type}}</a>
                </div>
                <div class="right" v-if="ui.accounts[i]">
                  <div :class="{'caret': true, 'active': ui.accounts[i].open}" @click="ui.accounts[i].open = !ui.accounts[i].open">&caron;</div>
                </div>
                <div class="account-item item-details" v-if="ui.accounts[i].open && owner">
                  <hr class="title-hr" />
                  <!-- Username -->
                  <label>
                    <span v-if="account.account_type !== accountLabels.email">Username</span>
                    <span v-if="account.account_type == accountLabels.email">E-mail</span>
                  </label>
                  <div class="account-user value">{{account.username}}</div>
                  <!-- Profile -->
                  <label v-if="account.profile">Profile</label>
                  <div class="account-profile value" v-if="account.profile">{{account.profile}}</div>
                  <hr class="footer-hr" v-if="!isReadOnly || (owner.owner == viewer)" />
                  <div class="account-item remove" v-if="!isReadOnly || (owner.owner == viewer)">
                    <p>
                      <span class="pointer" @click="removeAccount(i)">&times; Remove</span>
                    </p>
                  </div>
                </div>
              </div>
              <!-- Accounts to be added -->
              <div class="account-item item" v-for="(account, i) in newDomainItems.accounts" :key="i+'-new-accounts'">
                <div class="left">
                  <a :href="account.profile" target="_blank" v-if="account.account_type == accountLabels.github"><span class="icon icon-github"></span>GitHub</a>
                  <a :href="account.profile" target="_blank" v-if="account.account_type == accountLabels.twitter"><span class="icon icon-twitter"></span>Twitter</a>
                  <a :href="'mailto:'+account.username" v-if="account.account_type == accountLabels.email">{{account.account_type}}</a>
                </div>
                <div class="right">
                  <div :class="{'caret': true, 'active': ui.newAccounts[i].open}" v-if="ui.newAccounts[i]" @click="ui.newAccounts[i].open = !ui.newAccounts[i].open">&caron;</div>
                </div>
                <div class="account-item item-details" v-if="ui.newAccounts[i].open && owner">
                  <hr class="title-hr" />
                  <!-- Username -->
                  <label>
                    <span v-if="account.account_type !== accountLabels.email">Username</span>
                    <span v-if="account.account_type == accountLabels.email">E-mail</span>
                  </label>
                  <div class="account-user value">{{account.username}}</div>
                  <!-- Profile -->
                  <label v-if="account.profile">Profile</label>
                  <div class="account-profile value" v-if="account.profile">{{account.profile}}</div>
                  <hr class="footer-hr" v-if="!isReadOnly || (owner.owner == viewer)" />
                  <div class="account-item remove" v-if="!isReadOnly || (owner.owner == viewer)">
                    <p>
                      <span class="pointer" @click="removeNewAccount(i)">&times; Remove</span>
                    </p>
                  </div>
                </div>
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
                <label class="account-label" for="account_type">Type</label>
                <select class="metadata-account-type form-control" name="account_type" v-model="newAccountModel.account_type">
                  <option :value="null" disabled>Select account type</option>
                  <option :value="accountLabels.twitter">Twitter</option>
                  <option :value="accountLabels.github">GitHub</option>
                  <option :value="accountLabels.email">E-mail Address</option>
                </select>
                <!-- Account Username -->
                <label class="account-label" for="account_username" v-if="newAccountModel.account_type">
                  <span v-if="newAccountModel.account_type !== accountLabels.email">Username</span>
                  <span v-if="newAccountModel.account_type == accountLabels.email">E-mail</span>
                </label>
                <input 
                  type="text" 
                  class="metadata-account-username form-control" 
                  name="account_username"
                  v-model="newAccountModel.username" 
                  placeholder="@archidapp"
                  v-if="newAccountModel.account_type == accountLabels.twitter"
                />
                <input 
                  type="text" 
                  class="metadata-account-username form-control" 
                  name="account_username"
                  v-model="newAccountModel.username" 
                  placeholder="archid-protocol"
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
                  placeholder="https://twitter.com/archidapp"
                  v-if="newAccountModel.account_type == accountLabels.twitter"
                />
                <input 
                  type="text" 
                  class="metadata-account-profile form-control" 
                  :name="'account_profile'"
                  v-model="newAccountModel.profile" 
                  placeholder="https://github.com/archid-protocol"
                  v-if="newAccountModel.account_type == accountLabels.github"
                />
                <!-- Add Account Button -->
                <button 
                  class="btn btn-primary full-width" 
                  @click="addAccount();" 
                  :disabled="!newAccountModel.account_type || !newAccountModel.username || (!newAccountModel.profile && newAccountModel.account_type !== accountLabels.email) || (newAccountModel.profile.indexOf('github.com/') < 0 && newAccountModel.account_type == accountLabels.github) || (newAccountModel.profile.indexOf('twitter.com/') < 0 && newAccountModel.account_type == accountLabels.twitter) || (newAccountModel.account_type == accountLabels.twitter && newAccountModel.username.charAt(0) !== '@')"
                >Create</button>
              </div>
            </div>
          </div>
          <!-- Websites & Apps -->
          <div class="col websites clear" v-if="viewer == owner.owner || token.extension.websites.length">
            <div class="title websites-title row" v-if="owner">
              <span class="icon icon-websites"></span>
              <h5>Websites & Apps</h5>
              <div class="add website" v-if="!isReadOnly || (owner.owner == viewer)" @click="creating.website = !creating.website;">
                <span v-if="!creating.website">+</span>
                <span v-if="creating.website">&times;</span>
              </div>
            </div>
            <div class="websites-list">
              <!-- Current Websites -->
              <div class="website-item item" v-for="(website, i) in token.extension.websites" :key="i+'-websites'">
                <div class="left">
                  <a :href="website.url" target="_blank">{{website.url}}</a>
                </div>
                <div class="right">
                  <div :class="{'caret': true, 'active': ui.websites[i].open}" v-if="ui.websites[i]" @click="ui.websites[i].open = !ui.websites[i].open">&caron;</div>
                </div>
                <div class="website-item item-details" v-if="ui.websites[i].open && owner">
                  <hr class="title-hr" />
                  <!-- Website URL -->
                  <label v-if="website.url">
                    <span>Website</span>
                  </label>
                  <div class="website-url value" v-if="website.url">{{website.url}}</div>
                  <!-- Website Domain -->
                  <label v-if="website.domain">Domain</label>
                  <div class="website-domain value" v-if="website.domain">{{website.domain}}</div>
                  <hr class="footer-hr" v-if="!isReadOnly || (owner.owner == viewer)" />
                  <div class="account-item remove" v-if="!isReadOnly || (owner.owner == viewer)">
                    <p>
                      <span class="pointer" @click="removeWebsite(i)">&times; Remove</span>
                    </p>
                  </div>
                </div>
              </div>
              <!-- Websites to be added -->
              <div class="website-item item" v-for="(website, i) in newDomainItems.websites" :key="i+'-new-websites-add'">
                <div class="left">
                  <a :href="website.url" target="_blank">{{website.url}}</a>
                </div>
                <div class="right">
                  <div :class="{'caret': true, 'active': ui.newWebsites[i].open}" v-if="ui.newWebsites[i]" @click="ui.newWebsites[i].open = !ui.newWebsites[i].open">&caron;</div>
                </div>
                <div class="website-item item-details" v-if="ui.newWebsites[i].open && owner">
                  <hr class="title-hr" />
                  <!-- Website URL -->
                  <label v-if="website.url">
                    <span>Website</span>
                  </label>
                  <div class="website-user value">{{website.url}}</div>
                  <!-- Website Domain -->
                  <label v-if="website.profile">Domain</label>
                  <div class="website-profile value" v-if="website.profile">{{website.profile}}</div>
                  <hr class="footer-hr" v-if="!isReadOnly || (owner.owner == viewer)" />
                  <div class="website-item remove" v-if="!isReadOnly || (owner.owner == viewer)">
                    <p>
                      <span class="pointer" @click="removeNewWebsite(i)">&times; Remove</span>
                    </p>
                  </div>
                </div>
              </div>
              <!-- Add an Website form -->
              <div class="new-website-item creating" v-if="creating.website">
                <!-- Add Website Titlebar -->
                <div class="new-website-title">
                  <div class="left">
                    <h5>New Application</h5>
                  </div>
                  <div class="right">
                    <span class="close-x" @click="creating.website = !creating.website;">&times;</span>
                  </div>
                  <hr class="title-hr" />
                </div>
                <!-- Website URL -->
                <label class="website-label" for="website_url">
                  <span>Website</span>
                </label>
                <input 
                  type="text" 
                  class="metadata-website-url form-control" 
                  name="website_url"
                  v-model="newWebsiteModel.url" 
                  placeholder="https://archid.app"
                />
                <!-- Website Domain -->
                <select class="metadata-website-type form-control" v-model="newWebsiteModel.domain">
                  <option :value="null" disabled>Select a domain</option>
                  <option :value="domain">{{domain}}</option>
                  <option :value="subdomain.name + '.' + domain" v-for="(subdomain, i) in updates.metadata.subdomains" :key="'subdomain_val-'+i">{{String(subdomain.name + '.' + domain)}}</option>
                </select>
                <!-- Add Website Button -->
                <button 
                  class="btn btn-primary full-width" 
                  @click="addWebsite();" 
                  :disabled="!newWebsiteModel.url || !newWebsiteModel.domain"
                >Create</button>
              </div>
            </div>
          </div>
          <!-- Subdomains -->
          <div class="col subdomains clear" v-if="viewer == owner.owner || token.extension.subdomains.length">
            <div class="title subdomains-title row" v-if="owner">
              <span class="icon icon-subdomains"></span>
              <h5>Subdomains</h5>
              <div class="add subdomain" v-if="!isReadOnly || (owner.owner == viewer)" @click="creating.subdomain = !creating.subdomain;">
                <span v-if="!creating.subdomain">+</span>
                <span v-if="creating.subdomain">&times;</span>
              </div>
            </div>
            <div class="subdomains-list">
              <!-- Current Subdomains -->
              <div class="subdomain-item item" v-for="(subdomain, i) in token.extension.subdomains" :key="i+'-subdomains'">
                <div class="left">
                  <a :href="'/domains/' + subdomain.name + '.' + domain" target="_blank">{{subdomain.name + '.' + domain}}</a>
                </div>
                <div class="right">
                  <div :class="{'caret': true, 'active': ui.subdomains[i].open}" v-if="ui.subdomains[i]" @click="ui.subdomains[i].open = !ui.subdomains[i].open">&caron;</div>
                </div>
                <div class="subdomain-item item-details" v-if="ui.subdomains[i].open && owner">
                  <hr class="title-hr" />
                  <!-- Subdomain Record -->
                  <label v-if="subdomain.resolver">Subdomain Record</label>
                  <div class="subdomain-domain value" v-if="subdomain.resolver">{{subdomain.resolver}}</div>
                  <!-- Subdomain Expiration -->
                  <label class="subdomain-expiry" v-if="subdomain.expiry">Expiration date</label>
                  <div class="value subdomain-expiry" v-if="subdomain.expiry">{{ niceDate(subdomain.expiry) }}</div>
                  <hr class="footer-hr" v-if="!isReadOnly || (owner.owner == viewer && owner)" />
                  <div class="subdomain-item remove" v-if="!isReadOnly || (owner.owner == viewer)">
                    <p>
                      <span class="pointer" @click="modals.removeSubdomain = !modals.removeSubdomain;">&times; Remove</span>
                    </p>
                  </div>
                </div>
                <!-- Remove Subdomain Modal -->
                <transition name="modal">
                  <div v-if="modals.removeSubdomain" class="modal-wrapper">
                    <div class="modalt">
                      <div class="modal-header subdomain-remove">
                        <div class="left">
                          <p class="modal-subdomain-remove-title">Are you sure you want to remove <span class="modal-title modal-domain-title" v-if="subdomain">{{subdomain.name + '.' + domain}}</span>?</p>
                        </div>
                        <div class="right">
                          <span class="close-x subdomain-remove" @click="modals.removeSubdomain = !modals.removeSubdomain;">&times;</span>
                        </div>
                      </div>
                      <div class="modal-body remove-subdomain">
                        <p class="descr warn">This action cannot be undone.</p>
                        <p class="descr warn">Confirm the cancelation by entering the subdomain below.</p>
                        <div class="remove-subdomain-input">
                          <label class="remove-subdomain label" for="remove_subdomain">Subdomain to remove</label>
                          <input 
                            type="text" 
                            class="remove-subdomain form-control"
                            name="remove_subdomain"
                            v-model="burnConfirmation"
                            :placeholder="subdomain.name + '.' + domain"
                          />
                        </div>
                      </div>
                      <div class="modal-footer subdomain">
                        <button class="btn btn-inverse" @click="modals.removeSubdomain = !modals.removeSubdomain;">Cancel</button>
                        <button class="btn btn-primary" @click="removeSubdomainHandler(subdomain);" :disabled="burnConfirmation !== (subdomain.name + '.' + domain)">Continue</button>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
              <!-- Add a Subdomain form -->
              <div class="new-subdomain-item creating" v-if="creating.subdomain">
                <!-- Add Subdomain Titlebar -->
                <div class="new-subdomain-title">
                  <div class="left">
                    <h5>New Subdomain</h5>
                  </div>
                  <div class="right">
                    <span class="close-x" @click="creating.subdomain = !creating.subdomain;">&times;</span>
                  </div>
                  <hr class="title-hr" />
                </div>
                <!-- Subdomain Name -->
                <label class="subdomain-label" for="subdomain_name">
                  <span>Subdomain</span>
                </label>
                <div class="input-group">
                  <input 
                    type="text" 
                    class="metadata-subdomain-name form-control"
                    name="subdomain_name"
                    v-model="newSubdomainModel.subdomain"
                    placeholder="Prefix"
                  />
                  <span class="input-group-text">.{{domain}}</span>
                </div>
                <label class="subdomain-label" for="subdomain_record">
                  <span>Subdomain Record</span>
                </label>
                <div class="row">
                  <div class="input-group">
                    <input 
                      type="text" 
                      class="metadata-subdomain-record form-control"
                      name="subdomain_record"
                      v-model="newSubdomainModel.new_resolver"
                      placeholder="Archway address"
                    />
                    <span class="input-group-text pointer" @click="newSubdomainModel.new_resolver = owner.owner;">Resolve to me</span>
                  </div>
                </div>
                <!-- Subdomain Owner -->
                <label class="subdomain-label" for="subdomain_owner">
                  <span>Subdomain Owner</span>
                </label>
                <div class="row">
                  <div class="input-group">
                    <input 
                      type="text" 
                      class="metadata-subdomain-record form-control"
                      name="subdomain_owner"
                      v-model="newSubdomainModel.new_owner"
                      placeholder="Archway address"
                    />
                    <span class="input-group-text pointer" @click="newSubdomainModel.new_owner = owner.owner;">Mint to me</span>
                  </div>
                </div>
                <!-- Add Subdomain Button -->
                <button 
                  class="btn btn-primary full-width" 
                  @click="addSubdomain();"
                  :disabled="!newSubdomainModel.subdomain || !newSubdomainModel.new_resolver || !newSubdomainModel.new_owner"
                >Register</button>
              </div>
            </div>
          </div>
        </div>

        <div class="row edit-ctrl" v-if="editing || editingDescr || updatingImg">
          <div class="left">
            <h3 class="unsaved-changes">You have unsaved changes.</h3>
          </div>
          <div class="right">
            <button class="btn btn-inverse" v-if="!isReadOnly || (owner.owner == viewer)" @click="cancelUpdateHandler();">Revert Changes</button>
            <button class="btn btn-primary" v-if="!isReadOnly || (owner.owner == viewer)" @click="executeUpdateMetadata();">Save Changes</button>
          </div>
        </div>

      </div>
      <div class="loading default" v-if="!token"></div>
    </div>
  </div>

  <!-- Tx. Notifications -->
  <Notification
    v-bind:type="notify.type"
    v-bind:title="notify.title"
    v-bind:msg="notify.msg"
    v-bind:img="notify.img"
    v-if="notify.type"
    @closeNotification="closeNotification"
  >
  </Notification>

  <!-- Extend Domain Modal -->
  <transition name="modal">
    <div v-if="modals.renew" class="modal-wrapper">
      <div class="modalt">
        <div class="modal-header">
          <div class="left">
            <p class="modal-extend-title">Extend <span class="modal-title modal-domain-title" v-if="domain">{{domain}}</span></p>
            <p class="modal-descr">How long would you like to extend the domain life time?</p>
          </div>
          <div class="right">
            <span class="close-x extend" @click="modals.renew = !modals.renew;">&times;</span>
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
            <span class="icon icon-denom"></span>
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
  UpdateResolver,
  RegisterSubDomain,
  UpdataUserDomainData,
  RemoveSubDomain,
} from '../../util/execute';

import { DateFormat } from '../../util/datetime';
import { FromMicro } from '../../util/denom';

import Notification from './Notification.vue'

const ACCOUNT_TYPES = ['twitter', 'github', 'email'];
const TWITTER = ACCOUNT_TYPES[0];
const GITHUB = ACCOUNT_TYPES[1];
const EMAIL = ACCOUNT_TYPES[2];

const IPFS_GATEWAY_PREFIX = 'https://ipfs.io/ipfs/';
const IPFS_CID_PREFIX = 'ipfs://';
const URL_PREFIXES = ['http://', 'https://'];

const EXTEND_IMG = 'extend.svg';
const REMOVED_IMG = 'token-burned.svg';
const DEFAULT_TOKEN_IMG = 'token.svg';

export default {
  props: {
    domain: String,
    cw721: String,
    cwClient: Object,
    isSubdomain: Boolean,
    isReadOnly: Boolean,
    baseCost: Number,
    collapsible: Boolean,
  },
  emits: ['dataResolution'],
  components: { Notification },
  data: () => ({
    token: null,
    owner: null,
    viewer: null,
    editing: false,
    editingText: false,
    editingDescr: false,
    editingResolver: false,
    editingImg: false,
    updatingImg: false,
    registering: false,
    domainRecord: null,
    burnConfirmation: null,
    executeResult: null,
    ui: {
      accounts: [],
      newAccounts: [],
      websites: [],
      newWebsites: [],
      subdomains: [],
      newSubdomains: [],
    },
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
    newWebsiteModel: {
      url: null,
      domain: null,
      verfication_hash: null,
    },
    newSubdomainModel: {
      domain: null,
      subdomain: null,
      new_resolver: null,
      new_owner: null,
      mint: null,
      expiration: null,
    },
    newImgModel: {
      type: null,
      url: null,
      value: null,
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
      removeSubdomain: false,
      enlargeTokenImg: false,
      editingImg: false,
    },
    notify: {
      type: null,
      title: null,
      msg: null,
      img: null,
    },
    closed: true,
    niceDate: DateFormat,
    formatFromMicro: FromMicro,
  }),
  mounted: async function () {
    if (!this.collapsible) await this.domainDetails();
  },
  methods: {
    domainDetails: async function () {
      if (!this.token || !this.owner || !this.domainRecord) {
        await this.dataResolutionHandler();
      }
      this.closed = !this.closed;
    },
    dataResolutionHandler: async function (force = false) {
      let viewer = [];
      if (this.token && this.owner && this.domainRecord && this.viewer && !force) return;
      // Reset editing states
      this.editingDescr = false;
      this.editing = false;
      this.editingText = false;
      this.editingResolver = false;
      this.updatingImg = false;
      // Reset creation forms
      this.creating = { account: false, subdomain: false, website: false };
      this.newAccountModel = { account_type: null, profile: null, username: null, verfication_hash: null };
      this.newWebsiteModel = { url: null, domain: null, verfication_hash: null };
      this.newSubdomainModel = { domain: null, subdomain: null, new_resolver: null, new_owner: null, mint: null, expiration: null };
      this.newImgModel = { type: null, url: null, value: null };
      this.newDomainItems = { accounts: [], subdomains: [], websites: [] };
      // Resolve data
      await this.tokenData();
      await this.ownerData();
      await this.resolveDomainRecord();
      if (this.cwClient) viewer = await Accounts(this.cwClient);
      if (viewer.length) this.viewer = viewer[0].address;
      if (force) this.$emit('dataResolution', true);
    },
    tokenData: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      this.token = await Token(this.domain, this.cw721, this.cwClient);
      if (this.token['extension']) this.updates.metadata = this.token.extension;
      this.ui = {
        accounts: [],
        newAccounts: [],
        websites: [],
        newWebsites: [],
        subdomains: [],
        newSubdomains: [],
      };
      if (!this.isSubdomain) {
        for (let i = 0; i < this.token.extension.accounts.length; i++) {
          this.ui.accounts.push({open: false});
        }
        for (let i = 0; i < this.token.extension.websites.length; i++) {
          this.ui.websites.push({open: false});
        }
        for (let i = 0; i < this.token.extension.subdomains.length; i++) {
          this.ui.subdomains.push({open: false});
        }
      }
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
    editDescriptionHandler: function () {
      if (!this.owner || !this.viewer) return;
      if (this.owner.owner !== this.viewer) return;
      this.editingText = !this.editingText;
    },
    editDomainRecordHandler: function () {
      if (!this.owner || !this.viewer) return;
      if (this.owner.owner !== this.viewer) return;
      this.editingResolver = !this.editingResolver;
    },
    editImgHandler: function () {
      if (this.newImgModel.value !== this.updates.metadata.image) this.editingImg = true;
    },
    cancelEditImgHandler: function () {
      this.newImgModel = {
        type: null,
        url: null,
        value: null,
      };
      this.editingImg = false;
      this.modals.editingImg = false;
    },
    createImgUpdate: function () {
      if (!this.newImgModel.value || typeof this.newImgModel.value !== 'string') return;
      let imgUpdate;
      if (this.newImgModel.type == 'ipfs') {
        imgUpdate = IPFS_CID_PREFIX + this.newImgModel.value;
      } else {
        imgUpdate = (this.newImgModel.value.indexOf(URL_PREFIXES[0]) > -1 || this.newImgModel.value.indexOf(URL_PREFIXES[1]) > -1) ? this.newImgModel.value : URL_PREFIXES[1] + this.newImgModel.value;
      }
      this.updates.metadata.image = imgUpdate;
      this.editingImg = false;
      this.updatingImg = true;
      this.modals.editingImg = false;
    },
    addAccount: function () {
      if (
        !this.newAccountModel.account_type 
        || !this.newAccountModel.username
        || (!this.newAccountModel.profile && this.newAccountModel.account_type !== this.accountLabels.email) 
      ) return;
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
          console.error("Invalid website address, site URLs must begin with 'http://' or 'https://'");
          return;
        }
      }
      this.newDomainItems.accounts.push(account);
      this.ui.newAccounts.push({open: false});
      // Reset account model
      this.newAccountModel = {
        account_type: null,
        profile: null,
        username: null,
        verfication_hash: null,
      };
      this.creating.account = false;
      this.editing = true;
    },
    addWebsite: function () {
      if (!this.newWebsiteModel.url || !this.newWebsiteModel.domain) return;
      // Decouple account to be added, from tmp account model
      let website = JSON.parse(JSON.stringify(this.newWebsiteModel));
      this.newDomainItems.websites.push(website);
      this.ui.newWebsites.push({open: false});
      // Reset website model
      this.newWebsiteModel = {
        url: null,
        domain: null,
        verfication_hash: null,
      };
      this.creating.website = false;
      this.editing = true;
    },
    addSubdomain: async function () {
      if (!this.newSubdomainModel.subdomain || !this.newSubdomainModel.new_resolver || !this.newSubdomainModel.new_owner) return;
      // Decouple account to be added, from tmp account model
      let subdomain = JSON.parse(JSON.stringify(this.newSubdomainModel));
      subdomain.domain = this.domain.slice(0,-5);
      subdomain.mint = true;
      subdomain.expiration = this.updates.metadata.expiry;
      await this.executeRegisterSubdomain(subdomain);
    },
    removeAccount: function (index) {
      if (typeof index !== 'number') return;
      if (index < 0 || index > (this.updates.metadata.accounts.length - 1)) return;
      this.updates.metadata.accounts.splice(index, 1);
      this.ui.accounts.splice(index, 1);
      this.editing = true;
    },
    removeWebsite: function (index) {
      if (typeof index !== 'number') return;
      if (index < 0 || index > (this.updates.metadata.websites.length - 1)) return;
      this.updates.metadata.websites.splice(index, 1);
      this.ui.websites.splice(index, 1);
      this.editing = true;
    },
    removeNewAccount: function (index) {
      if (typeof index !== 'number') return;
      if (index < 0 || index > (this.newDomainItems.accounts - 1)) return;
      this.newDomainItems.accounts.splice(index, 1);
      this.ui.newAccounts.splice(index, 1);
    },
    removeNewWebsite: function (index) {
      if (typeof index !== 'number') return;
      if (index < 0 || index > (this.newDomainItems.websites - 1)) return;
      this.newDomainItems.websites.splice(index, 1);
      this.ui.newWebsites.splice(index, 1);
    },
    removeNewSubdomain: function (index) {
      if (typeof index !== 'number') return;
      if (index < 0 || index > (this.newDomainItems.subdomains - 1)) return;
      this.newDomainItems.subdomains.splice(index, 1);
      this.ui.newSubdomains.splice(index, 1);
    },
    removeSubdomainHandler: function (subdomain = null) {
      if (!subdomain) return;
      if (typeof subdomain !== 'object') return;
      this.modals.removeSubdomain = false;
      this.executeRemoveSubdomain(subdomain);
    },
    cancelUpdateHandler: async function () {
      await this.dataResolutionHandler(true);
    },
    closeNotification: function () {
      this.notify = {
        type: null,
        title: null,
        msg: null,
        img: null,
      };
    },
    executeRenewRegistration: async function () {
      if (!this.domain || typeof this.domain !== 'string') return;
      if (!this.updates.expiry || typeof this.updates.expiry !== 'number') return;
      if (!this.baseCost || typeof this.baseCost !== 'number') return;

      // Waiting notification
      this.notify = {
        type: "loading",
        title: "Getting your domain ready",
        msg: "Renewing registration for " + this.domain,
        img: null,
      };

      this.resetFormIters();
      let cost = this.baseCost * this.updates.expiry;
      let domain = this.domain.slice(0,-5);
      this.executeResult = await RenewRegistration(
        domain,
        this.updates.expiry,
        cost,
        this.cwClient
      );
      this.modals.renew = false;
      console.log('RenewRegistration tx', this.executeResult);

      if (!this.executeResult['error']) {
        this.notify = {
          type: "success",
          title: "Your domain was extended",
          msg: "Everyone will continue to reach your selected address through your Archway domain.",
          img: EXTEND_IMG,
        };
        // Resolve new expiration in UI
        await this.dataResolutionHandler(true);
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
    executeUpdateMetadata: async function () {
      if (!this.updates.metadata) return;
      if (!this.isSubdomain) {
        this.updates.metadata.accounts = [...this.updates.metadata.accounts, ...this.newDomainItems.accounts];
        this.updates.metadata.websites = [...this.updates.metadata.websites, ...this.newDomainItems.websites];
      }
      this.resetFormIters();

      // Waiting notification
      this.notify = {
        type: "loading",
        title: "Getting your domain ready",
        msg: "Updating " + this.domain,
        img: null,
      };

      // Do update metadata
      let domain = this.domain.slice(0,-5);
      this.executeResult = await UpdataUserDomainData(
        domain,
        this.updates.metadata,
        this.cwClient
      );
      console.log('UpdataUserDomainData tx', this.executeResult);

      if (!this.executeResult['error']) {
        // Success notification
        this.notify = {
          type: "success",
          title: "Update complete",
          msg: "Data for " + this.domain + " has been updated",
          img: DEFAULT_TOKEN_IMG,
        };
        // Refresh domain
        await this.dataResolutionHandler(true);
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
    executeUpdateResolver: async function () {
      if (!this.updates.resolver || !this.domain) return;
      this.resetFormIters();

      // Waiting notification
      this.notify = {
        type: "loading",
        title: "Getting your domain record ready",
        msg: "Updating the record for " + this.domain,
        img: null,
      };

      let domain = this.domain.slice(0,-5);
      this.executeResult = await UpdateResolver(
        domain,
        this.updates.resolver,
        this.cwClient
      );
      console.log('UpdateResolver tx', this.executeResult);

      if (!this.executeResult['error']) {
        // Success notification
        this.notify = {
          type: "success",
          title: "Update complete",
          msg: "The domain record for " + this.domain + " has been updated",
          img: DEFAULT_TOKEN_IMG,
        };
        // Refresh domain
        await this.dataResolutionHandler(true);
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
    executeRegisterSubdomain: async function (subdomain) {
      if (typeof subdomain !== 'object') return;
      if (!subdomain.domain || !subdomain.subdomain || !subdomain.new_resolver || !subdomain.new_owner || !subdomain.expiration) return;
      this.resetFormIters();

      // Waiting notification
      this.notify = {
        type: "loading",
        title: "Creating your new subdomain",
        msg: "Registering subdomain " + subdomain.subdomain + "." + this.domain,
        img: null,
      };

      this.executeResult = await RegisterSubDomain(
        subdomain.domain,
        subdomain.subdomain,
        subdomain.new_resolver,
        subdomain.new_owner,
        true,
        subdomain.expiration,
        this.cwClient
      );
      console.log('RegisterSubDomain tx', this.executeResult);

      if (!this.executeResult['error']) {
        // Success notification
        this.notify = {
          type: "success",
          title: "Subdomain registeration complete",
          msg: "You registered " + subdomain.subdomain + "." + this.domain,
          img: DEFAULT_TOKEN_IMG,
        };
        // Refresh domain
        await this.dataResolutionHandler(true);
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
    executeRemoveSubdomain: async function (subdomain) {
      if (typeof subdomain !== 'object') return;
      if (!this.domain || !subdomain['name']) return;
      this.resetFormIters();

      // Waiting notification
      this.notify = {
        type: "loading",
        title: "Burning your subdomain forever",
        msg: "Removing subdomain " + subdomain.name + "." + this.domain,
        img: null,
      };

      let domain = this.domain.slice(0,-5);
      this.executeResult = await RemoveSubDomain(
        domain,
        subdomain.name,
        this.cwClient
      );
      console.log('RemoveSubDomain tx', this.executeResult);

      if (!this.executeResult['error']) {
        // Success notification
        this.notify = {
          type: "success",
          title: "Your subdomain was removed",
          msg: "You removed " + subdomain.name + "." + this.domain,
          img: REMOVED_IMG,
        };
        // Refresh domain
        await this.dataResolutionHandler(true);
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
    validEmailChars: function (email) {
      let re = /\S+@\S+\.\S+/;
      return re.test(email);
    },
    resetFormIters: function () {
      if (!this.isSubdomain) {
        // Reset forms and data
        this.newDomainItems.accounts = [];
        this.newDomainItems.websites = [];
        this.newImgModel = {
          type: null,
          url: null,
          value: null,
        };
        this.ui.accounts = [];
        this.ui.websites = [];
        for (let i = 0; i < this.updates.metadata.accounts.length; i++) {
          this.ui.accounts.push({open: false});
        }
        for (let i = 0; i < this.updates.metadata.websites.length; i++) {
          this.ui.websites.push({open: false});
        }
      }
    }
  },
  computed: {
    tokenImg: function () {
      if (!this.updates.metadata) return '/img/' + DEFAULT_TOKEN_IMG;
      else if (!this.updates.metadata['image']) return '/img/' + DEFAULT_TOKEN_IMG;
      let img = (this.updates.metadata.image.substr(0,7) == IPFS_CID_PREFIX) ? this.updates.metadata.image.replace(IPFS_CID_PREFIX, IPFS_GATEWAY_PREFIX) : this.updates.metadata.image;
      return img;
    },
  }
}
</script>

<style scoped>
.domain-name.header {
  font-weight: 500;
  font-size: 32px;
  line-height: 130%;
  text-decoration: none;
}
.expanded div.head {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 1em;
  padding-bottom: 1.25em;
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
div.expiry {
  display: inline-block;
}
label {
  margin-bottom: 0.25em;
}
div.id-row {
  margin-top: 1em;
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
  position: absolute;
  right: 10px;
  top: -8px;
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
div.new-account-item select, div.new-account-item input,
div.new-website-item select, div.new-website-item input,
div.new-subdomain-item select, div.new-subdomain-item input {
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
.item-details label, .item-details div {
  margin-top: 1em;
}
.remove {
  color: #FF4D00;
}
p.subdomain {
  margin-bottom: 1em;
}
div.metadata-token-description, p.configurable,
input.metadata-subdomain-name {
  width: 75%;
}
.configurable {
  cursor: pointer;
  float: left;
}
.new-subdomain-item.creating div input {
  width: 50%;
}
.new-subdomain-item.creating div span.input-group-text {
  height: 38px;
}
.btn-update-resolver {
  margin-top: 1em;
}
.account-item .left a {
  text-transform: capitalize;
}
.item .left a {
  text-decoration: none;
}
.close-x.extend {
  top: -48px;
  position: relative;
}
.modal-extend-title, .modal-subdomain-remove-title {
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 150%;
  letter-spacing: -0.03em;
  color: #000000;
}
.modal-extend-title .modal-domain-title,
.modal-subdomain-remove-title .modal-domain-title {
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 150%;
  letter-spacing: -0.03em;
  color: #FF4D00;
  text-transform: capitalize;
}
span.cost {
  font-style: normal;
  font-weight: 500;
  font-size: 32px;
  line-height: 130%;
  letter-spacing: -0.02em;
  color: #000000;
}
.icon-denom {
  margin-left: 8px;
}
h3.unsaved-changes {
  font-style: normal;
  font-weight: 400;
  font-size: 24px;
  line-height: 130%;
  letter-spacing: -0.02em;
  color: #000000;
}
.row.edit-ctrl {
  padding-top: 2em;
}
.row.edit-ctrl .right button {
  margin-right: 8px;
}
.metadata-token-description.form-control,
.input-group-text.edit-descr {
  margin-bottom: 16px;
}
.owner .domain-owner {
  margin-bottom: 16px;
}
.domain-resolver.value, .owner .domain-owner {
  width: 100%;
}
.col.img-t {
  max-width: 280px;
}
.token-img.wrapper {
  padding: 16px;
  gap: 16px;
  width: 233px;
  height: 228px;
  background: #F2EFED;
  border-radius: 16px;
}
.img.token-img {
  width: auto;
  height: 190px;
  background-size: contain;
  background-repeat: no-repeat;
  top: 9px;
  position: relative;
}
div.upload.btn-upload {
  padding: 12px;
  background: #FFFFFF;
  border-radius: 8px;
  display: inline-block;
  float: right;
  position: relative;
  top: -14px;
}
.icon.icon-upload {
  margin: 3px;
}
.modal-header.subdomain-remove, 
.modal-footer.subdomain {
  border: none;
}
.modal-footer.subdomain {
  justify-content: space-between;
}
.remove-subdomain.form-control {
  background: #F2EFED;
  border-radius: 8px;
  height: 56px;
  border: none;
}
div.remove-subdomain .descr {
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  letter-spacing: -0.01em;
  color: #000000;
  margin-bottom: 2px;
}
label.remove-subdomain {
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  letter-spacing: -0.01em;
  color: #666666;
  margin-bottom: 0.5em;
}
div.remove-subdomain-input {
  padding-top: 2em;
}
.metadata-token-img.form-control {
  margin-bottom: 1em;
  height: 56px;
  background: #F2EFED;
  border-radius: 8px;
}
.img-update.btn-wrapper {
  margin-right: 1em;
}
.badge-unsaved-changes {
  position: relative;
  top: -6px;
  margin-left: 1.25em;
}
div.accounts-title, div.websites-title, div.subdomains-title {
  position: relative;
  margin-left: 0;
}
.col.accounts, .col.websites {
  min-width: 300px;
}
div.col.accounts, div.col.websites, div.col.subdomains {
  margin-top: 1em;
}
.button-group.select-img-type {
  width: 100%;
  height: 50px;
  margin-bottom: 2em;
  padding: 0;
}
.button-group.select-img-type a {
  width: 45%;
  display: inline-block;
  text-align: center;
  text-decoration: none;
}
label.img-edit {
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  align-items: center;
  letter-spacing: -0.01em;
  color: #666666;
  margin-bottom: 12px;
}
</style>