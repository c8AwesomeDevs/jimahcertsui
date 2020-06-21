import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

import Certificates from '../views/Certificates.vue'
import PIDataViewer from '../views/PIDataViewer.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Certificates',
    component: Certificates,
    meta: { breadCrumb: 'Home' },
  },
  {
    path: '/certificates',
    name: 'Certificates',
    component: Certificates,
    meta: { breadCrumb: 'Certificates' },
  },
  { path: '/data', 
    component: PIDataViewer ,
    meta: { breadCrumb: 'Data' },
  }

]

const router = new VueRouter({
  routes
})

export default router
