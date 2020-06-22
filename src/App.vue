<template>
  <v-app>
    <PIModal :dialog="piDialog" @closed="closePIModal"></PIModal>
    <v-app-bar
      app
      color="deep-purple darken-1"
    >
      <!-- <v-app-bar-nav-icon @click.stop="drawer = !drawer" /> -->
      <v-toolbar-title>
        <!-- <router-link to="/certificates">{{APP_TITLE}}</router-link> -->
        <v-btn to="/" color="white" text dark>{{APP_TITLE}}</v-btn>
      </v-toolbar-title>
      <v-spacer/>
      <v-hover
        v-slot:default="{ hover }"
      >
        <v-icon
          medium
          :dark = "hover ? true : false"
          @click="openPIModal"
        >
          mdi-pi
        </v-icon>
      </v-hover>
      <!-- {{crumbs}}
      <v-breadcrumbs :items="crumbs"></v-breadcrumbs> -->
    </v-app-bar>
    <v-content>
      <router-view/>
    </v-content>
  </v-app> 
</template>

<script>
import axios from 'axios'
import PIModal from './components/PIModal'
//import App Mixins
import AppMixin from './mixins/views/AppMixin.js'

export default {
  name: 'App',

  components: {
    PIModal
  },

  mixins: [AppMixin],

  data: () => ({
    piDialog : false, 
    routes : [],
  }),

  computed: {
    /*isLoggedIn () {
      return this.$store.getters.isLoggedIn
    },*/
    crumbs: function() {
      let pathArray = this.$route.path.split("/")
      pathArray.shift()
      let breadcrumbs = pathArray.reduce((breadcrumbArray, path, idx) => {
        breadcrumbArray.push({
          path: path,
          to: breadcrumbArray[idx - 1]
            ? "/" + breadcrumbArray[idx - 1].path + "/" + path
            : "/" + path,
          text: this.$route.matched[idx].meta.breadCrumb || path,
        });
        return breadcrumbArray;
      }, [])
      return breadcrumbs;
    }
  },

  created() {
    this.$router.options.routes.forEach(route => {
        this.routes.push({
            name: route.name
            , path: route.path
        })
    })
  },

  methods: {
    logout: function () {
      console.log('logging out')
      this.$store.dispatch('logout')
      .then(() => {
        this.$router.push('/login')
      })
    },
    closePIModal: function(value){
      this.piDialog = false;
    },
    openPIModal: function(){
      console.log("Opening PI Modal")
      this.piDialog = true
    },
  }
};
</script>