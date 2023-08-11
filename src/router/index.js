import { createWebHistory, createRouter } from 'vue-router';

// Components
import Home from '../components/Home';
import Domains from '../components/Domains';
import Domain from '../components/Domain';
import MyDomains from '../components/MyDomains';
import Address from '../components/Address';
import Marketplace from '../components/Marketplace';

const PageNotFound = Home;

// Routes
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/domains', name: 'Domains', component: Domains, meta: { requiresAuth: true } },
  { path: '/domains/:id', name: 'Domain', component: Domain, meta: { requiresAuth: true } },
  { path: '/address/:id', name: 'Address', component: Address, meta: { requiresAuth: true } },
  { path: '/my-domains', name: 'My Domains', component: MyDomains, meta: { requiresAuth: true } },
  { path: '/marketplace', name: 'Marketplace', component: Marketplace, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFound }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// router.afterEach(async (to/*, from*/) => {
//   if (!window['ga']) {
//     return;
//   }
//   window.ga('set', 'page', to.path);
//   window.ga('send', 'pageview');
//   // console.log('Router =>', {to: to, from: from});
// });

export default router;