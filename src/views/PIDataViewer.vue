<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <PIDataList/>
  </div>
</template>

<script>
// @ is an alias to /src
import PIDataList from '@/components/PIDataList.vue'

export default {
  name: 'PIDataViewer',
  components: {
    PIDataList
  }
}
</script>