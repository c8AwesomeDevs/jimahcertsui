import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import store from '../store/index.js'
import Certificates from '../views/Certificates.vue'
import PIDataViewer from '../views/PIDataViewer.vue'
import Login from '../views/Login.vue'
import Page404 from '../views/Page404.vue'
import PDFViewer from '../views/PDFViewer.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/certificates',
    name: 'Certificates',
    component: Certificates,
  },
  { path: '/data/:source', 
    name: 'PIDataViewer',  
    component: PIDataViewer ,
  },
  {
    path: '/pdf',
    name: 'PDFViewer',  
    component: PDFViewer,
  },
  { path: '/login', 
    name: 'Login',
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

router.beforeEach((to, from, next) => {
  if (to.name !== 'Login' && !store.getters.isAuthenticated) next({ name: 'Login' })
  else next()
})

export default router
