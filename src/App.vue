<template>
  <v-app>
    <v-img src="./assets/background-04.png" :aspect-ratio="16/5">
    <PIModal v-if="isLoggedIn" :dialog="piDialog" mode="validate" @closed="closePIModal"></PIModal>
    <v-app-bar
      app
      color="deep-purple darken-1"
      
      dark
    >
      <v-toolbar-title>
        <v-icon
          medium
        >
          mdi-home
        </v-icon>        
        {{APP_TITLE}}
        <!-- <v-btn to="/" color="white" text>{{APP_TITLE}}</v-btn> -->
      </v-toolbar-title>
      <v-spacer/>
      <v-tooltip v-if="isLoggedIn" bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon @click="openPIModal" small>mdi-pi</v-icon>
          </v-btn>
        </template>
        <span v-if="piTemp">Connected to  {{piTemp}}.</span>
        <span v-else="pi">No PI System connected.</span>
      </v-tooltip>
      <v-tooltip v-if="isLoggedIn" bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon  @click="drawer = !drawer" small>mdi-account</v-icon>
          </v-btn>
        </template>
        <span>Signed in as {{user.username}} </span>
      </v-tooltip>
    </v-app-bar>
    <v-content>
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          cols="12"
          sm="8"
          md="11"
        >
          <router-view/>
        </v-col>
      </v-row>
    </v-content>
    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
      right
    >
      <v-list-item>
        <v-list-item-avatar>
          <!-- <v-img src="https://randomuser.me/api/portraits/men/78.jpg"></v-img> -->
          <v-icon >mdi-account</v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{user.username}}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>

        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
        >
          <v-list-item-icon>
            <v-icon @click="goto(item.path)">{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content @click="goto(item.path)">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <div class="pa-2">
        <v-btn @click="logout" block>Logout</v-btn>
      </div>
      <!-- <template v-slot:append>
        <div class="pa-2">
          <v-btn @click="logout" block>Logout</v-btn>
        </div>
      </template> -->
    </v-navigation-drawer>
    </v-img>
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
    drawer : null,
    items: [
      { title: 'Certificates', icon: 'mdi-file' , path:"/certificates"},
      { title: 'Manual Logs', icon: 'mdi-clipboard-list', path:"/manuallogs" },
    ],
    piTemp : null,
  }),

  computed: {
    isLoggedIn () {
      return this.$store.getters.isLoggedIn
    },
    user () {
      return this.$store.getters.user
    },
    pi () {
      return this.$store.getters.pi
    },    
  },

  created() {
    this.piTemp = this.$store.getters.pi
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
    goto : function(path){
      console.log("goto")
      this.$router.push(path)
    }
  }
};
</script>
<style>
.toolbar-title {
  color: inherit;
  text-decoration: inherit;
}
</style>