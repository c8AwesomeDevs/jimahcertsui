<template>
  <v-row justify="center">
    <v-dialog :value="dialog" persistent max-width="600px" @click:outside="close" @keydown.esc="close">
      <v-card>
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
        <v-alert
          v-if="isAlerted"
          dense
          outlined
          :type="testResponseStatus==200? 'success' : 'error'"
        >
          {{testResponseMessage}}
        </v-alert>
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
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="close">Close</v-btn>
          <v-btn color="deep-purple lighten-2" :disabled="!validated" text @click="testConnection">Test Connection</v-btn>
          <v-btn v-if="mode=='upload'" color="deep-purple lighten-2" :disabled="!validated" text @click="triggerUpload">Upload to PI</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
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
      console.log('clossing dialog')
      this.$emit('closed', null)
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
          this.testResponseStatus = resp.status
          this.testResponseMessage = resp.data.message
          this.dataServers = resp.data.dataservers.map(elem => elem["Name"])
          this.$store.dispatch('getDataServers', this.dataServers)
          this.$store.dispatch('choosePI', this.piTemp)
          this.isPILoadSpin = false
          resolve(resp)
        })
        .catch(err => {
          this.isAlerted = true; 
          this.testResponseStatus = err.response.status
          this.testResponseMessage = err.response.data.error || err.response.statusText 
          if (this.testResponseStatus == 401){
            this.$router.push('/login')
          }
          this.isPILoadSpin = false
          reject(err)
        })
      })
    },
    chooseDA: function(){
      console.log("changing store")
      /*this.$store.dispatch('chooseDA', this.daTemp)*/
    },
    triggerUpload: function(){
      console.log('clossing dialog')
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