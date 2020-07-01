import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

import Certificates from '../views/Certificates.vue'
import PIDataViewer from '../views/PIDataViewer.vue'
import Login from '../views/Login.vue'
import Page404 from '../views/Page404.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Certificates',
    component: Certificates,
  },
  {
    path: '/certificates',
    name: 'Certificates',
    component: Certificates,
  },
  { path: '/data', 
    component: PIDataViewer ,
  },
  { path: '/login', 
    component: Login ,
  },
  { 
    path: "*", 
    component: Page404 
  }

]

const router = new VueRouter({
  routes
})

export default router
