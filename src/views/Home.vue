<template>
  <v-container
    class="text-center"
    fill-height
    style="height: calc(100vh - 58px);"
  >
    <v-row align="center">
      <v-col>

        <img src="../assets/c8-cube-logo-01.png" :aspect-ratio="5/5"></img>
        <h1 class="display-2 black--text">Welcome to C8 CUBE</h1>

        <p>An online PDF Uploader and Manual Logger to PI</p>

        <v-btn
          :to="`/certificates`"
          color="cyan darken-4"
          outlined
        >
          Go to Certificates
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import PingMixin from '../mixins/views/PingMixin.js'

export default {
  name: 'Page404',
  mixins : [PingMixin],
  props: {
    lang: {
      type: String,
      default: 'en',
    },
  },
}
</script>