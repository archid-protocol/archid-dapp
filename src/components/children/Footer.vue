<template>
  <div class="footer container-xl">
    <div class="row tp">
      <div class="col">
        <div class="top">
          <span class="icon icon-archid alt"></span>
        </div>
      </div>
      <div class="col">
        <div class="top">
          <h4 class="category">ArchID</h4>
          <ul class="about">
            <li>
              <a :href="links.about" target="_blank">About ArchID<span class="icon icon-external-link">↗</span></a>
            </li>
            <li>
              <a :href="links.mydomains">Your Domains</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="col">
        <div class="top">
          <h4 class="category">Developers</h4>
          <ul class="developers">
            <li>
              <a class="integrate-archid" :href="links.integrate" target="_blank">Integrating with ArchID<span class="icon icon-external-link">↗</span></a>
            </li>
            <li>
              <a :href="links.github" target="_blank"><span class="icon icon-github"></span>GitHub <span class="icon icon-external-link">↗</span></a>
            </li>
          </ul>
        </div>
      </div>
      <div class="col">
        <div class="top">
          <h4 class="category">Support</h4>
          <ul class="support">
            <li>
              <a :href="links.mailto"><span class="icon icon-mail"></span>Reach Out <span class="icon icon-external-link">↗</span></a>
            </li>
          </ul>
        </div>
      </div>
      <div class="col">
        <div class="top">
          <h4 class="category">Social</h4>
          <ul class="social">
            <li>
              <a :href="links.discord" target="_blank"><span class="icon icon-discord"></span>Discord<span class="icon icon-external-link">↗</span></a>
            </li>
            <li>
              <a :href="links.twitter" target="_blank"><span class="icon icon-twitter"></span>X (Twitter) <span class="icon icon-external-link">↗</span></a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="row attribute">
      <div class="col archid">
        <div class="bottom">&#169; ArchID {{ year }}</div>
      </div>
      <div class="col privacy">
        <div class="bottom"><a href="/policy.html" target="_blank">Privacy Policy</a></div>
      </div>
      <div class="col tos">
        <div class="bottom"><a href="/tos.html" target="_blank">Terms of Service</a></div>
      </div>
      <div class="col"></div>
      <div class="col"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  components: {},
  data: () => ({
    year: null,
    links: {
      about: "https://medium.com/@archid.protocol/archid-a-name-service-for-archway-network-c221193fa989",
      discord: "https://discord.gg/ghCCDu3dPB",
      github: "https://github.com/archid-protocol",
      integrate: "https://docs.archid.app",
      mailto: "mailto:archid.protocol@gmail.com",
      mydomains: "https://archid.app/my-domains",
      twitter: "https://twitter.com/archidapp",
    },
  }),
  mounted: function () {
    this.year = new Date().getFullYear();
  },
}
</script>

<style scoped>
ul, li {
  list-style: none;
  padding: 0;
}
li {
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 120%;
  letter-spacing: -0.01em;
  color: #000000;
}
h4 {
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 120%;
  color: #000000;
}
h4, li {
  margin-bottom: 14px;
}
.footer {
  margin-bottom: 8em;
}
.row {
  justify-content: space-evenly;
}
.row.tp {
  padding-bottom: 2em;
}
.bottom {
  font-style: normal;
  font-weight: 400;
  /* font-size: 12px; */
  font-size: 14px;
  line-height: 120%;
  color: rgba(0, 0, 0, 0.667);
}
a, a:active, a:focus, 
a:link, a:hover,
.icon-external-link,
.icon-external-link:active,
.icon-external-link:focus,
.icon-external-link:hover,
.icon-external-link:link {
  text-decoration: none;
}
.container-xl {
  max-width: 90vw;
  padding: 4em;
}
.col {
  padding-left: 1em;
}
a.integrate-archid {
  min-width: 197px;
  display: inline-block;
}
</style>