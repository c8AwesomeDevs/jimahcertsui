<template>
  <div class="home">
    <PICertDataList v-if="source=='certificate'" @updateRoute="updateRouteParams" @newActivityLog="$emit('newActivityLog', null)"/>
    <PIManualDataList v-if="source=='manualLog'" @newActivityLog="$emit('newActivityLog', null)"/>

  </div>
</template>

<script>
// @ is an alias to /src
import PICertDataList from '@/components/PICertDataList.vue'
import PIManualDataList from '@/components/PIManualDataList.vue'
import PingMixin from '../mixins/views/PingMixin.js'

export default {
  name: 'PIDataViewer',
  mixins: [PingMixin],
  components: {
    PICertDataList,
    PIManualDataList
  },
  created () {
    let source = this.$route.params["source"]
    this.source = source
  },
  data: () => ({
    source : "manualLog"
  }),
  methods: {
    updateRouteParams(route) {
      this.source = route.params.source
    }
  }
}
</script>