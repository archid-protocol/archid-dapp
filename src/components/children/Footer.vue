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
              <a href="#">About ArchID</a>
            </li>
            <li>
              <a href="#">Your Domains</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="col">
        <div class="top">
          <h4 class="category">Developers</h4>
          <ul class="developers">
            <li>
              <a href="#">Integrating with ArchID</a>
            </li>
            <li>
              <a :href="links.github" target="_blank">GitHub <span class="icon icon-external-link">↗</span></a>
            </li>
          </ul>
        </div>
      </div>
      <div class="col">
        <div class="top">
          <h4 class="category">Support</h4>
          <ul class="support">
            <li>
              <a :href="links.mailto">Reach Out <span class="icon icon-external-link">↗</span></a>
            </li>
          </ul>
        </div>
      </div>
      <div class="col">
        <div class="top">
          <h4 class="category">Social</h4>
          <ul class="social">
            <li>
              <a href="#"><span class="icon icon-discord"></span>Discord</a>
            </li>
            <li>
              <a :href="links.twitter" target="_blank"><span class="icon icon-twitter"></span>Twitter <span class="icon icon-external-link">↗</span></a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="bottom">&#169; Archid {{ year }}</div>
      </div>
      <div class="col">
        <div class="bottom"><a href="#">Privacy Policy</a></div>
      </div>
      <div class="col"></div>
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
      github: "https://github.com/archid-protocol",
      mailto: "archid.protocol@gmail.com",
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
  /* font-size: 14px; */
  font-size: 16px;
  line-height: 120%;
  letter-spacing: -0.01em;
  color: #000000;
}
h4 {
  font-style: normal;
  font-weight: 600;
  /* font-size: 14px; */
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
</style>