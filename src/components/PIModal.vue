<template>
  <!-- PI CONNECTION DIALOG COMPONENT -->
  <v-dialog 
    :value="dialog" 
    persistent 
    max-width="600px" 
    @click:outside="close" 
    @keydown.esc="close">
    <v-card>

      <!-- Dialog Title -->
      <v-card-title>
        <span class="headline">Connect to PI</span>
        <v-spacer/>
        <v-progress-circular
          v-if="isPILoadSpin"
          indeterminate
          color="primary">  
        </v-progress-circular>
      </v-card-title>
      <v-divider/>
      
      <!-- Alerts -->
      <v-alert
        v-if="isAlerted"
        dense
        outlined
        :type="responseStatus==200? 'success' : 'error'"
      >
        {{responseMessage}}
      </v-alert>

      <!-- Dialog Form -->
      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-text-field
            v-model="piTemp"
            :rules="piRules"
            label="Host"
            name="piHost"
            prepend-icon="mdi-pi"
            type="text"
            required
          />
          <v-text-field
            v-model="username"
            :rules="usernameRules"
            label="Username"
            name="username"
            prepend-icon="mdi-account"
            type="text"
            required
          />
          <v-text-field
            id="password"
            v-model="password"
            :rules="passwordRules"
            label="Password"
            prepend-icon="mdi-lock"
            name="password"
            type="password"
            required
          />
          <v-select
            v-model="daTemp"
            :items="dataServers"
            menu-props="auto"
            label="Data Server"
            prepend-icon="mdi-database"
            @input="chooseDA"
          >
          </v-select>
        </v-form>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn 
          color="red" 
          text 
          @click="close"
        >
          Close
        </v-btn>
        <v-btn 
          color="deep-purple lighten-2" 
          text
          :disabled="!validated" 
          @click="testConnection"
        >
          Test Connection
        </v-btn>
        <v-btn 
          v-if="mode=='upload'" 
          color="deep-purple lighten-2" 
          :disabled="!validated" 
          text 
          @click="triggerUpload"
        >
          Upload to PI
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios'
import ConfigMixin from '../mixins/config.js'
import AlertMixin from '../mixins/views/AlertMixin.js'

export default {
  name: 'PIModal',
  
  props: {
    dialog : Boolean,
    mode : String,
  },

  mixins: [ConfigMixin,AlertMixin],

  data:() => ({
    username : "",
    usernameRules: [
      v => !!v || 'Name is required'
    ],
    password : "",
    passwordRules: [
      v => !!v || 'Password is required'
    ],
    piTemp : "",
    daTemp : "",
    piRules: [
      v => !!v || 'PI Host is required'
    ],
    valid: true,
    isPILoadSpin: false,
    dataServers : [],
  }),

  created() {
    this.refreshData()
    this.piTemp = this.pi
    this.daTemp = this.da
    this.dataServers = this.$store.getters.dataServers
  },

  computed: {
    pi (){
      return this.$store.getters.pi
    },
    da (){
      return this.$store.getters.da
    },
    validated(){
      //REFACTOR [TEMPORARY]
      return this.username && this.password && this.piTemp
    }
  },

  methods: {
    close: function(){
      this.$emit('closed', null)
    },
    refreshData: function(){
      this.username = ""
      this.piTemp = ""
      this.daTemp = ""
      this.valid = true
      this.isPILoadSpin= false
      this.dataServers = []
      this.responseMessage = ""
      this.responseStatus = null
      this.isAlerted = false
    },
    testConnection: function(){
      this.isPILoadSpin = true
      return new Promise((resolve, reject) => {
        let token = this.$store.getters.token        
        axios({url: `${this.BACKEND_REST_API}/test_pi_connection`, 
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              data: {
                host: `https://${this.piTemp}/piwebapi`,
                username: this.username,
                password: this.password
              }
            })
        .then(resp => { 
          this.isAlerted = true;
          this.responseStatus = resp.status
          this.responseMessage = resp.data.message
          this.dataServers = resp.data.dataservers.map(elem => elem["Name"])
          this.$store.dispatch('getDataServers', this.dataServers)
          this.$store.dispatch('choosePI', this.piTemp)
          this.isPILoadSpin = false
          resolve(resp)
        })
        .catch(err => {
          this.isAlerted = true; 
          try {
            this.responseStatus = err.response.status
            try{
              this.responseMessage = err.response.data.error
            }
            catch (err){
              this.responseMessage = "An Unknown error occured. Please Contact the Developer"
            }
          }
          catch (err){
            this.responseStatus = 500
            this.responseMessage = "An Unknown error occured. Please Contact the Developer"
          }
          if (this.responseStatus == 401){
            this.$router.push('/login')
          }
          this.isPILoadSpin = false
          reject(err)
        })
      })
    },
    chooseDA: function(){
      /*this.$store.dispatch('chooseDA', this.daTemp)*/
    },
    triggerUpload: function(){
      let metadata = {
        "host" : this.piTemp,
        "da" : this.daTemp,
        "username" : this.username,
        "password" : this.password
      }
      this.$emit('upload', metadata)
    },
  }
}
</script>