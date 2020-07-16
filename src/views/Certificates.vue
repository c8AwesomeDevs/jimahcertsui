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

export default {
  name: 'Certificate',
  components: {
    CertList
  }
}
</script>