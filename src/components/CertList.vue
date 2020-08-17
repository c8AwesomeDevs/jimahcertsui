<template>
  <!-- DOCUMENT SUMMARY -->
  <div>
    <!-- Certificate Uploader -->
    <CertUploader 
      :dialog="addItemDialog" 
      @closed="closeCertUploader" 
      @newCertUploaded="fetchCertificates" 
      @newActivityLog="$emit('newActivityLog', null)"
    />

    <!-- Alerts -->
    <!-- {{alertsReversedSpliced}} -->
    <v-alert
      v-for="(alert,index) in alertsReversedSpliced "
      dense
      outlined
      :type="alert.responseStatus == 200 ? 'success' : 'error'"
      :key="index"
    >
      <v-row>
        {{alert.responseMessage}}
        <v-spacer/>
        <v-btn v-if="alert.responseStatus==200" icon :color="alert.responseStatus == 200 ? 'success' : 'error'" @click="closeAlert(index)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-row>
    </v-alert>

    <!-- Table -->
    <v-data-table
      :headers="headers"
      :items="certificates"
      :search="search"
      :loading ="!dataIsLoaded && !isAlerted"
      sort-by="id"
      :sort-desc="true"
      class="elevation-12"
      dense
      >

      <!-- Table Toolbar -->
      <template v-slot:top>
        <v-toolbar flat color="white">

          <!-- Table Title -->
          <v-toolbar-title>
            Certificates
          </v-toolbar-title>

          <v-divider
            class="mx-4"
            inset
            vertical>
          </v-divider>

          <!-- Cert Uploader Action Button -->
          <v-btn 
            color="cyan darken-4" 
            text 
            @click="openCertUploader"
          >
            New Item
          </v-btn>

          <v-spacer></v-spacer>

          <!-- TODO
          Create Component for Edit Dialog -->
          <!-- <v-dialog v-model="editItemDialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">New Item</span>
              </v-card-title>
              <v-divider/>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="12" md="4">
                      <v-text-field v-model="editedItem.name" label="Name"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="4">
                      <v-text-field v-model="editedItem.cert_type" label="Certificate Type"></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
            </v-card>
          </v-dialog> -->

          <!-- Search/Filter Action Field -->
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details>
          </v-text-field>
        </v-toolbar>
        <v-divider></v-divider>
      </template>

      <!-- Table Slots -->
      <template v-slot:item.extraction_status="{item}">
        <v-chip 
          :color="extractionStatusColor[item.extraction_status]" 
          dark
        >
          {{extractionStatus[item.extraction_status]}}
        </v-chip>
      </template>
      <!-- <template v-slot:item.cert_type="{item}">
        <v-chip 
          :color="certTypeColor[item.cert_type]" 
          dark
        >
          {{item.cert_type}}
        </v-chip>
      </template> -->
      <template v-slot:item.actions="{ item }">
        <!-- <v-icon
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon> -->
        <v-icon
          v-if="item.extraction_status=='E'"
          small
          @click="extractData(item)"
        >
          mdi-export
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import axios from 'axios'
import CertUploader from '@/components/CertUploader.vue'
import ConfigMixin from '../mixins/config.js'
import AlertMixin from '../mixins/views/AlertMixin.js'

export default {
  name: 'CertList',  

  components: {CertUploader},

  mixins: [ConfigMixin,AlertMixin],

  data: () => ({
    editItemDialog: false,
    addItemDialog: false,
    search: '',
    headers: [
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
      { text: 'Certificate Type', value: 'cert_type',filterable: true},
      { text: 'Extraction Status', value: 'extraction_status',filterable: true},
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    certificates: [],
    dataIsLoaded: false,
    editedItem: {
      id: null,
      name: '',
      extraction_status: null,
      cert_type: "COAL",
    },
    defaultItem: {
      id: null,
      name: '',
      extraction_status: null,
      cert_type: "COAL",
    },
    extractionStatus: {
      "NE" : "Not Extracted",
      "Q" : "Queued",
      "E" : "Extracted",
       "X" : "Failed"
    },
    extractionStatusColor: {
      "X" : "red darken-3",
      "NE" : "orange darken-3",
      "Q" : "yellow darken-3",
      "E" : "light-green darken-3"
    }, 
    certTypeColor: {
      "COAL" : "blue-grey darken-3",
      "DGA" : "blue-grey lighten-3",
    }, 
  }),

  mounted() {
    /*this.fetchCertificates()*/
  },

  created () {
    /*this.initialize()*/
    this.fetchCertificates()
  },

  methods: {
    fetchCertificates () {
      let token = this.$store.getters.token
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/certificates/`, 
              method: 'GET',
              headers: {
                  "Authorization": `Bearer ${token}`
              },
            })
        .then(resp => { 
          this.certificates = resp.data
          this.dataIsLoaded = true
          let alert = {
            responseStatus : resp.status,
            responseMessage : "Certificates succesfully retrieved",
          }

          this.alerts.push(alert)

          resolve(resp)
        })
        .catch(err => {
          this.isAlerted = true
          let alert = {}
          try{
            alert.responseStatus = err.response.status
            try {
              alert.responseMessage = err.response.data.detail
            } catch(err){
              alert.responseMessage = "An Unknown error occured. Please Contact the Developer"
            }
          } catch(err){
            alert.responseStatus = 500
            alert.responseMessage = "An Unknown error occured. Please Contact the Developer"
          }
          this.alerts.push(alert)
          if (err.response.status == 401){
            this.$store.dispatch('logout')
            this.$router.push('/login')
          }
          reject(err)
        })
      })      
    },
    extractData (item) {
      this.$router.push(`/data/certificate?_id=${item.id}`)
    },
    editItem (item) {
      this.editedIndex = this.certificates.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.editItemDialog = true
    },
    openCertUploader(){
      this.addItemDialog = true
    },
    closeCertUploader: function(value){
      this.addItemDialog = false;
    },
  },

}
</script>