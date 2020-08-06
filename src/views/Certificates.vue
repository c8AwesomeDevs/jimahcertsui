<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <CertList @newActivityLog="$emit('newActivityLog', null)"/>
  </div>
</template>

<script>
// @ is an alias to /src
import CertList from '@/components/CertList.vue'
import PingMixin from '../mixins/views/PingMixin.js'

export default {
  name: 'Certificate',
  mixins: [PingMixin],
  components: {
    CertList
  }
 }
</script>