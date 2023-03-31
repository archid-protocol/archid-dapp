import { createWebHistory, createRouter } from 'vue-router';

// Components
import Home from '../components/Home';
import TestBench from '../components/TestBench';
import Domains from '../components/Domains';
import Domain from '../components/Domain';
import MyDomains from '../components/MyDomains';
import Address from '../components/Address';

const PageNotFound = Home;

// Routes
const routes = [
  // General
  { path: '/', name: 'Home', component: Home },
  { path: '/test', name: 'Test Bench', component: TestBench },
  { path: '/domains', name: 'Domains', component: Domains },
  { path: '/domains/:id', name: 'Domain', component: Domain },
  { path: '/address/:id', name: 'Address', component: Address },
  { path: '/my-domains', name: 'My Domains', component: MyDomains },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFound }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// router.afterEach(async (to/*, from*/) => {
//   if (!window['ga']) {
//     return;
//   }
//   window.ga('set', 'page', to.path);
//   window.ga('send', 'pageview');
//   // console.log('Router =>', {to: to, from: from});
// });

export default router;