import { createRouter, createWebHistory } from 'vue-router'

// import App from './App.vue'

import Home_Page from '../components/HomePage.vue'
import AppSignup from '../components/AppSignup.vue'
import AppLogin from '../components/AppLogin.vue'
import OAuth_Google_Page from '../components/OAuthGoogle.vue'
import Error_404_Page from '../components/404.vue'
import Error_500_Page from '../components/500.vue'
import PlayerProfile from '../components/PlayerProfile.vue'
import PlayerReview from '../components/PlayerReview.vue'
import AccessDeniedPage from '../components/AccessDenied.vue'
import TablesHall from '../components/TablesHall.vue'
import PlayingTable from '../components/PlayingTable.vue'
// import Create_Table from './components/CreateTable.vue'
import GameRulesPage from '../components/GameRulesPage.vue'
import TopListPage from '../components/TopListPage.vue'
import AboutPage from '../components/AboutPage.vue'
// import Donation_Page from './components/DonationPage.vue'

const router = createRouter({
  routes: [
    { path: '/', component: Home_Page},
    { path: '/signup', component: AppSignup },
    { path: '/signup/:signupArgument', component: AppSignup, props: true },
    { path: '/login', component: AppLogin },
    { path: '/access_denied', component: AccessDeniedPage },
//    { path: '/create_table', component: Create_Table, meta: { requiresAuth: true } },
    { path: '/rules', component: GameRulesPage },
    { path: '/toplist', component: TopListPage },
    { path: '/about', component: AboutPage },
    { path: '/oauth_google/', component: OAuth_Google_Page },
    { path: '/404', component: Error_404_Page },
    { path: '/500', component: Error_500_Page },
    { path: '/profile/:user_id', component: PlayerProfile, name: 'ProfilePage' },
    { path: '/review/:user_id/', component: PlayerReview, name: 'ReviewPage' },
//    { path: '/donation', component: Donation_Page },
    { path: '/tables', component: TablesHall, name: 'TablesHall' },    
    { path: '/table/:table_id', component: PlayingTable, name: 'PlayingTablePage' },
   ],
  history: createWebHistory()
})

export default router;