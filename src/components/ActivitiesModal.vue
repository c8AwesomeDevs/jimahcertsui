<template>
  <v-row justify="center">
    <v-dialog :value="dialog" persistent max-width="1000px" @click:outside="close" @keydown.esc="close">
      <v-card>
        <v-card-title>
          <span>Activity Logs</span>
        </v-card-title>
        <v-divider/>
        <v-spacer/>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="activities"
            sort-by="id"
            :sort-desc="true"
            class="elevation-1"
            hide-default-footer
            dense
          >
            <template v-slot:footer>
              <v-pagination
                v-model="page"
                circle
                :length="length"
                :page="page"
                :total-visible="totalVisible"
                @next="fetchActivityLogs"
                @previous="fetchActivityLogs"
              >
                
              </v-pagination>
            </template>
            <template v-slot:item.status="{item}">
              <v-chip :color="activityStatusColor[item.status]" dark>{{activityStatus[item.status]}}</v-chip>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
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
  name: 'ActivitiesModal',
  
  props: {
    dialog : Boolean,
    activities: Array,
  },

  mixins: [ConfigMixin,AlertMixin],

  data:() => ({
    headers: [
      { text: 'Id', value: 'id' },
      { text: 'User', value: 'user' ,filterable: true},
      { text: 'Timestamp', value: 'timestamp',filterable: true},
      { text: 'Activity', value: 'activity',filterable: true},
      { text: 'Status', value: 'status', sortable: false },
    ],
    dataIsLoaded: false,
    length: 1,
    page: 1,
    totalVisible: 5,
    itemsPerPage: 10,  
    activityStatus: {
      "P" : "In Progress",
      "C" : "Completed",
      "X" : "Failed"
    },
    activityStatusColor: {
      "X" : "red darken-3",
      "P" : "yellow darken-3",
      "C" : "light-green darken-3"
    }, 
  }),

  created() {
    this.fetchActivityLogs()
  },

  methods: {
    close: function(){
      console.log('clossing dialog')
      this.$emit('closed', null)
    },
    fetchActivityLogs: function(){
      console.log("fetching Activity Logs")
      return new Promise((resolve, reject) => {
        let token = this.$store.getters.token        
        axios({url: `${this.BACKEND_REST_API}/activitylogs/?page=${this.page}&page_size=${this.itemsPerPage}`, 
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              },
            })
        .then(resp => { 
          this.$emit('updateActivityLogs', resp.data.results)
          this.length = Math.ceil(resp.data.count/this.itemsPerPage)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
      })
    },
  }
}
</script>