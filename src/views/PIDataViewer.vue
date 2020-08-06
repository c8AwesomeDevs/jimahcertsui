<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <PIDataList @newActivityLog="$emit('newActivityLog', null)"/>
  </div>
</template>

<script>
// @ is an alias to /src
import PIDataList from '@/components/PIDataList.vue'
import PingMixin from '../mixins/views/PingMixin.js'

export default {
  name: 'PIDataViewer',
  mixins: [PingMixin],
  components: {
    PIDataList
  }
}
</script>