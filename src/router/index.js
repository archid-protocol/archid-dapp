import { createWebHistory, createRouter } from 'vue-router';

// Components
import Home from '../components/Home';
import TestBench from '../components/TestBench';
import Tokens from '../components/Tokens';
import Token from '../components/Token';

const PageNotFound = Home;

// Routes
const routes = [
  // General
  { path: '/', name: 'Home', component: Home },
  { path: '/test', name: 'Test Bench', component: TestBench },
  { path: '/domains', name: 'Domains', component: Tokens },
  { path: '/domains/:id', name: 'Domain', component: Token },
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