import { createRouter, createWebHistory } from 'vue-router'

// import App from './App.vue'

// import Delete_Post from './components/Delete_Post.vue'
// import Add_Post from './components/Add_Post.vue'
import Home_Page from '../components/HomePage.vue'
import AppSignup from '../components/AppSignup.vue'
import AppLogin from '../components/AppLogin.vue'
// import PlayerProfile from './components/PlayerProfile.vue'
// import AccessDenied from './components/AccessDenied.vue'
// import Play_Tables from './components/Play_Tables.vue'
// import Playing_Table from './components/Playing_Table.vue'
// import Not_Found from './components/Not_Found.vue'
// import Create_Table from './components/CreateTable.vue'
// import Game_Rules from './components/GameRules.vue'
// import Top_List from './components/TopList.vue'
import About_Page from '../components/AboutPage.vue'
// import Donation_Page from './components/DonationPage.vue'

const router = createRouter({
  routes: [
    { path: '/', component: Home_Page},
//    { path: '/deletepost', component: Delete_Post, meta: { requiresAuth: true } },
//    { path: '/addpost', component: Add_Post, meta: { requiresAuth: true } },
    { path: '/signup', component: AppSignup },
    { path: '/signup/:signupArgument', component: AppSignup, props: true },
    { path: '/login', component: AppLogin },
//    { path: '/access_denied', component: AccessDenied },
//    { path: '/404', component: Not_Found },
//    { path: '/create_table', component: Create_Table, meta: { requiresAuth: true } },
//    { path: '/rules', component: Game_Rules },
//    { path: '/toplist', component: Top_List },
    { path: '/about', component: About_Page },
//    { path: '/donation', component: Donation_Page },

//    { path: '/tables', component: Play_Tables, name: 'TablesPage', meta: { requiresAuth: true } },
//    { path: '/profile/:user_id', component: PlayerProfile, name: 'ProfilePage' },
//    { path: '/table/:table_id', component: Playing_Table, name: 'PlayingTablePage' },
   ],
  history: createWebHistory()
})

export default router;