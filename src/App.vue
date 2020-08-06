<template>
  <!-- MAIN APPLICATION CONTAINER -->
  <v-app>

    <!-- DIALOGS -->
    <!-- PI Connection Dialog -->
    <PIModal 
      v-if="isLoggedIn" 
      :dialog="piDialog" 
      mode="validate" 
      @closed="closePIModal"
    />
    <!-- User Activities Logs Dialog -->
    <ActivitiesModal
      v-if="isLoggedIn"  
      ref="activitiesModal" 
      :dialog="activitiesDialog" 
      :activities="activities" 
      @updateActivityLogs="updateActivityLogs" 
      @closed="closeActivitiesModal"
    />
    
    <!-- SIDE BAR NAVIGATIONS -->
    <v-navigation-drawer
      v-model="drawer"
      clipped
      app
      :mini-variant="mini"
      permanent
      >
      <!-- Signed-in User -->
      <v-list-item>
        <v-list-item-avatar>
          <v-icon >mdi-account</v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>
            {{isLoggedIn ? `Signed in as ${user.username}` : "Signed out"}}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <!-- Navigational/Functional/Informational Lists -->
      <v-list dense>
        <!-- Client Status -->
        <v-list-item>
          <v-list-item-icon>
            <v-icon 
              :color="isClientOnline? 'success' : 'danger'"
            >
              mdi-signal-variant
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>
              {{isClientOnline? 'Online' : 'Offline'}}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- Navigational Links -->
        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
        >
          <v-list-item-icon>
            <v-icon 
              color="blue" 
              @click="goto(item.path)"
            >
              {{ item.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content @click="goto(item.path)">
            <v-list-item-title>
              {{ item.title }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- User Activity Logs Functional Button -->
        <v-list-item  @click="openActivitiesModal" link>
          <v-list-item-icon>
            <v-icon color="blue">mdi-clipboard-list</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Activity Logs </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- PI Connection Functional Button -->
        <v-list-item v-if="isLoggedIn" @click="openPIModal">
          <v-list-item-icon>
            <v-icon color="blue">mdi-pi</v-icon>
          </v-list-item-icon>
          <v-list-item-content @click="openPIModal">
            <v-list-item-title>Connect to Pi</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- Logout -->
        <v-list-item v-if="isLoggedIn" @click="logout">
          <v-list-item-icon>
            <v-icon color="error">mdi-power</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    
    <!-- APPLICATION BAR -->
    <v-app-bar
      clipped-left
      app
      color="cyan darken-4"
      dark
      >
      <v-app-bar-nav-icon @click.stop="mini=!mini"/>
      <v-toolbar-title>
        {{APP_TITLE}}
      </v-toolbar-title>
    </v-app-bar>

    <!-- APPLICATION MAIN -->
    <v-main>
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          cols="12"
          sm="8"
          md="11"
        >
          <!-- APplication Content -->
          <router-view @newActivityLog="refreshActivityLog"/>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios'
import PIModal from './components/PIModal'
import ActivitiesModal from './components/ActivitiesModal'
//import App Mixins
import AppMixin from './mixins/views/AppMixin.js'

export default {
  name: 'App',

  components: {
    PIModal,
    ActivitiesModal
  },

  mixins: [AppMixin],

  data: () => ({
    piDialog : false, 
    activitiesDialog : false,
    routes : [],
    drawer : null,
    items: [
      { title: 'Document Uploader', icon: 'mdi-file-upload' , path:"/certificates"},
      { title: 'Manual Logger', icon: 'mdi-pencil', path:"/manuallogs" },
    ],
    piTemp : null,
    activities : [],
    interval: null,
    mini: true,
  }),

  computed: {
    isClientOnline () {
      return this.$store.getters.isClientOnline
    },
    isLoggedIn () {
      return this.$store.getters.isLoggedIn
    },
    user () {
      return this.$store.getters.user
    },
    pi () {
      return this.$store.getters.pi
    }, 
    hostname () {
      return this.$store.getters.hostname
    },
  },

  created() {
    this.piTemp = this.$store.getters.pi

  },

  methods: {
    refreshActivityLog: function(){
      this.$refs.activitiesModal.fetchActivityLogs()
    },
    logout: function () {
      this.$store.dispatch('logout')
      .then(() => {
        this.$router.push('/login')
      })
    },
    closePIModal: function(value){
      this.piDialog = false;
    },
    closeActivitiesModal: function(value){
      this.activitiesDialog = false;
    },
    openPIModal: function(){
      this.piDialog = true
    },
    openActivitiesModal: function(){
      this.activitiesDialog = true
    },
    updateActivityLogs : function(value) {
      this.activities = value
    },
    goto : function(path){
      this.$router.push(path)
    },
  },
};
</script>
<style>
.toolbar-title {
  color: inherit;
  text-decoration: inherit;
}
</style>