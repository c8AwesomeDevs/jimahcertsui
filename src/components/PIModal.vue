<template>
  <v-row justify="center">
    <v-dialog :value="dialog" persistent max-width="600px" @click:outside="close" @keydown.esc="close">
      <v-card>
        <v-card-title>
          <span class="headline">Connect to PI</span>
          <v-spacer/>
          <!-- <v-progress-circular
            v-if="isPILoadSpin"
            indeterminate
            color="primary">  
          </v-progress-circular> -->
        </v-card-title>
        <v-divider/>
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

            <!-- <v-btn color="deep-purple lighten-2 white--text" @click="login">Login</v-btn> -->
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PIModal',
  
  props: {
    dialog : Boolean
  },

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
    piRules: [
      v => !!v || 'PI Host is required'
    ],
    valid: true,
    isPILoadSpin: false,
  }),

  methods: {
    close: function(){
      console.log('clossing dialog')
      this.$emit('closed', null)
    },
  }
}
</script>