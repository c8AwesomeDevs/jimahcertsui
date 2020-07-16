<template>
  <v-container
  class="fill-height"
  fluid
  >
    <v-row/>
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        sm="8"
        md="4"
      >
        <v-card class="elevation-12" @keyup.enter="login">
          <v-toolbar
            color="deep-purple  darken-1 white--text"
            flat
          >
            <v-spacer />
            <v-toolbar-title>
             Login to C8 CUbE
            </v-toolbar-title>
            <v-spacer />
          </v-toolbar>
          <v-alert
            v-if="isAlerted"
            dense
            outlined
            :type="responseStatus == 200 || responseStatus == 201 ? 'success' : 'error'"
          >
            {{responseMessage}}
          </v-alert>
          <v-card-text>
            <v-form
              ref="form"
              v-model="valid"
              lazy-validation
            >
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

              <!-- <v-btn color="deep-purple lighten-2 white--text" @click="login">Login</v-btn> -->
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="deep-purple  darken-1 white--text" @click="login">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import AlertMixin from '../mixins/views/AlertMixin.js'
import ConfigMixin from '../mixins/config.js'

export default {
  name: 'Login',
  mixins: [AlertMixin,ConfigMixin],
  data(){
    return {
      valid: false, 
      username : "",
      usernameRules: [
        v => !!v || 'Name is required'
      ],
      password : "",
      passwordRules: [
        v => !!v || 'Password is required'
      ],
    }
  },
  computed: {
    isAuthenticated () {
      return this.$store.getters.isAuthenticated
    },
  },
  methods: {
    login: function () {
      this.$refs.form.validate()
      let username = this.username 
      let password = this.password
      this.$store.dispatch('login', { username, password })
      .then(() => {
        let token = this.$store.getters.token
        this.$store.dispatch('getUserGroups', token)
        .then(()=>{
          this.$router.push('/') 
        })
       }
      )
      .catch(err => {
        this.isAlerted = true;
        try {
          this.responseStatus = err.response.status
          this.responseMessage = err.response.data.detail || err.response.statusText 
        }
        catch(err2){
          this.responseStatus = 500
          this.responseMessage = err
        }

      })
    },
  }
}

</script>