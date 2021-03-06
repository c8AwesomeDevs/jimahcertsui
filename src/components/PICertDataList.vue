<template>
  <div>
    <PIModal :dialog="piDialog" mode="upload" @closed="closePIModal" @upload="uploadEditedData"/>
    <TagConfTemplateModal :dialog="tagConfDialog" :id="Number(id)" :tagConfiguration="tagConfiguration" :tagConfigurations="tagConfigurations" :certTagConfigurationId="certTagConfigurationId" @closed="closeTagConfModal" @selectConfigurations="selectConfigurations" @resetConfiguration="resetConfiguration" @listConfigurations="listConfigurations"/>

    <v-alert
      v-for="(alert, index) in alertsReversedSpliced"
      dense
      outlined
      :type="alert.responseStatus == 200 ? 'success' : 'error'"
      :key="index"
    >
      <v-row>
        <span @click="viewPdf">{{alert.responseMessage}}</span>
        <v-spacer/>
        <v-btn icon :color="alert.responseStatus == 200 ? 'success' : 'error'" @click="closeAlert(index)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-row>
      <v-row>
        <router-link v-if="alert.responseStatus==401 || alert.responseStatus==403" :to="{ path: '/certificates'}">
        Go Back to Certificates
        </router-link>
      </v-row>
      <v-row v-if="alert.responseStatus==401 || alert.responseStatus==403">
        Log in as another user
        <v-btn icon :color="alert.responseStatus == 200 ? 'success' : 'error'" v-if="alert.responseStatus==401 || alert.responseStatus==403" @click="logoutAndRedirect">
          <v-icon small>mdi-login</v-icon>
        </v-btn>
      </v-row>
    </v-alert>
    <v-data-table
      v-if="isDataValidator"
      :headers="headers"
      :items="piData"
      :search="search"
      sort-by="Parameter"
      :loading ="!dataIsLoaded"
      loading-text="Extracting Data... Please wait"
      dense
      class="elevation-12"
      >
      <template v-slot:top>
        <!-- {{piData}} -->
        <v-toolbar flat color="white">
          <v-toolbar-title>PI Data</v-toolbar-title>
          <v-divider
            class="mx-4"
            inset
            vertical>
          </v-divider>
          <router-link :to="{ path: '/certificates'}">
          Certificates
          </router-link>/
          <router-link :to="{ path: '/pdf', query: {_id: id }}" target="_blank">
          {{certName}}
          </router-link>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details>
          </v-text-field>
        </v-toolbar>
        <v-row>
          <v-spacer></v-spacer>
          <v-btn color="cyan darken-4" text @click="tagConfDialog=true">Configure Tag Template</v-btn>
          <v-btn color="cyan darken-4" text @click="saveEditedData">Save</v-btn>
          <v-btn color="cyan darken-4" text @click="verifyBeforeUpload">Save and Upload</v-btn>
        </v-row>
        <v-divider></v-divider>
      </template>
      <template v-slot:item.Value="{item}" >
        <v-text-field v-model="item.Value" dense flat hide-details/>
      </template>
      <template v-slot:item.Parameter="{item}" >
        <v-text-field v-model="item.Parameter" dense flat hide-details :background-color="item.Validated ? 'light-green lighten-3' : 'yellow lighten-3'"/>
      </template>
      <template v-slot:item.Timestamp="{item}" @dblclick="">
        <v-datetime-picker
          v-model="item.Timestamp"
          :text-field-props="textFieldProps"
          :time-picker-props="timeProps"
          time-format="HH:mm:ss">
          <template slot="dateIcon">
            <v-icon>mdi-calendar</v-icon>
          </template>
          <template slot="timeIcon">
            <v-icon>mdi-clock</v-icon>
          </template>
          <template slot="actions" slot-scope="{ parent }">
            <!-- <v-btn color="grey lighten-1" text @click.native="parent.clearHandler">Clear</v-btn> -->
            <v-btn color="green darken-1" text @click="parent.okHandler">Ok</v-btn>
            <v-btn color="blue darken-1" text @click="duplicateTimestamp(item.Timestamp)">Apply to all</v-btn>
          </template>
        </v-datetime-picker>
      </template>
      <template v-slot:item.Validated="{ item }">
        <v-simple-checkbox v-model="item.Validated"></v-simple-checkbox>
      </template>
      <template v-slot:item.Uploaded="{ item }">
        <v-simple-checkbox v-model="item.Uploaded" disabled></v-simple-checkbox>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import axios from 'axios'
import PIModal from './PIModal'
import TagConfTemplateModal from './TagConfTemplateModal'
import ConfigMixin from '../mixins/config.js'
import AlertMixin from '../mixins/views/AlertMixin.js'
import DataListMixin from '../mixins/views/DataListMixin.js'
import PIModalMixin from '../mixins/views/PIModalMixin.js'

export default {
  name: 'PICertDataList',  

  components: {PIModal,TagConfTemplateModal},

  mixins: [ConfigMixin,AlertMixin,DataListMixin,PIModalMixin],

  created () {
    /*this.initialize()*/
    //id = this.$route.query._id
    this.listConfigurations()
    let id = this.$route.query["_id"]
    this.id = id
    this.fetchPIData(id)
  },

  data: () => ({
    id : null,
    certName: null,
    certTagConfigurationId: -1,
    tagConfiguration : {
      id: -1,
      name: "New Template",
      transformation: "Select Parameter,Parameter as Tagname from pi_data",
      reference: ""      
    },
    tagConfigurations : [],
    piDialog : false, 
    search: '',
    //Table
    headers: [
      { text: 'Parameter', value: 'Parameter',filterable: true, groupable: true, width: "40%" },
      /*{ text: 'Description', value: 'Description', width: "10%"},*/
      { text: 'Timestamp', value: 'Timestamp',width: "18%"},
      { text: 'Value', value: 'Value'},
      { text: 'Validated', value: 'Validated'},
      { text: 'Uploaded', value: 'Uploaded'},
    ],
    dataIsLoaded: false,
    piData: [],
    selectedPIData: [],
    defaultItem: {
      Parameter: null,
      Description: '',
      Timestamp: null,
      Value : null,
      Validated: false,
      Uploaded: false,
    },
    //pdf
    pdfSource: null,
    //calendard data
    datetime: new Date(),
    timeProps: {
      useSeconds: true,
      ampmInTitle: true
    },
    textFieldProps: {
      dense: true,
      flat: true, 
      hideDetails : true,
    },
    //Alerts
    isAlerted : false,
    responseStatus : null,
    responseMessage : null,
    //configurations
    tagConfDialog : false,
  }),

  methods: {
    viewPdf () {
      this.$router.push(`${this.BACKEND_REST_API}/pdf?_id=${this.id}`)
    },
    fetchPIData (id) {
      let token = this.$store.getters.token
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/view_data?_id=${id}`, 
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${token}`                
              }
            })
        .then(resp => { 
          this.piData = resp.data.results
          for(var item in this.piData){
            this.piData[item]["Timestamp"] = new Date(this.piData[item]["Timestamp"])
          }
          this.certName = resp.data.cert.name
          this.certTagConfigurationId = resp.data.cert.tag_configuration_id
          this.fetchTagConfiguration()
          this.dataIsLoaded = true
          /*let alert = {
            responseStatus : resp.status,
            responseMessage : "Extracted Data from certificate succesfully retrieved"
          }
          this.alerts.push(alert)*/
          resolve(resp)
        })
        .catch(err => {
          this.dataIsLoaded = true
          let alert = {
            responseStatus : err.response.status,
            responseMessage : err.response.data.detail
          }
          this.alerts.push(alert)
          reject(err)
        })
      }) 
    },
    fetchTagConfiguration : function() {
      this.$emit('newActivityLog', null)
      let token = this.$store.getters.token
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/tagconfigurationtemplates/${this.certTagConfigurationId}`, 
              method: 'GET',
              headers: {
                "Authorization": `Bearer ${token}`                
              }
            })
        .then(resp => {
          /*if (this.tagConfiguration.id != resp.data.id){
            let alert = {
              responseStatus : resp.status,
              responseMessage : "Tag Configuration for this certificate Successfully retrieved/updated"
            }
            this.alerts.push(alert)
          }*/
          this.tagConfiguration = resp.data
          resolve(resp)
        })
        .catch(err => {
          console.log(err.response)
          let alert = {
            responseStatus : 200,
            responseMessage : `Tag Configuration for this certificate ${err.response.statusText}. Using default configuration` 
          }
          //this.alerts.push(alert)
          reject(err)
        })
      }) 
    },
    listConfigurations : function() {
      this.$emit('newActivityLog', null)
      let token = this.$store.getters.token
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/tagconfigurationtemplates/`, 
              method: 'GET',
              headers: {
                  "Authorization": `Bearer ${token}`
              },
            })
        .then(resp => { 
          this.tagConfigurations = resp.data
          /*let alert = {
            responseStatus : resp.status,
            responseMessage : "Tag Configuration Templates Successfully retrieved/updated."
          }
          this.alerts.push(alert)*/
          resolve(resp)
        })
        .catch(err => {
          let alert = {
            responseStatus :  err.response.status,
            responseMessage : err.response.data.detail
          }
          this.alerts.push(alert)
          reject(err)
        })
      }) 
    },
    logoutAndRedirect (item) {
      if (this.responseStatus == 401 || this.responseStatus == 403){
        this.$store.dispatch('logout')
        this.$router.push('/login')
      }
    },
    saveEditedData () {
      //console.log("Saving Edited Data")
      this.$emit('newActivityLog', null)
      let token = this.$store.getters.token
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/save_edited_data?_id=${this.id}`, 
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${token}`
              },
              data: this.piData
            })
        .then(resp => { 
          let alert = {
            responseStatus : resp.status,
            responseMessage : resp.data.message 
          }
          this.alerts.push(alert)
          resolve(resp)
        })
        .catch(err => {
          //console.log(err.response)
          //TODO
          //Error Message
          reject(err)
        })
      })
    },
    uploadEditedData (metadata) {
      //console.log("Uploading edited Data")
      this.$emit('newActivityLog', null)
      this.piDialog = false
      let token = this.$store.getters.token
      let data = {
        metadata: metadata,
        piData : this.piData
      }
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/upload/certificate?_id=${this.id}`, 
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${token}`
              },
              data: data
            })
        .then(resp => { 
          //console.log(resp)
          let alert = {
            responseStatus : resp.status,
            responseMessage : resp.data.message 
          }
          this.alerts.push(alert)
          //refresh list
          this.fetchPIData(this.id)
          resolve(resp)
        })
        .catch(err => {
          //console.log(err.response)
          //TODO
          //Error Message
          reject(err)
        })
      })
    },
    selectConfigurations: function(event){
      console.log(event)
      this.tagConfiguration = event
      /*this.tagConfiguration.reference = null*/
    },
    resetConfiguration: function(event){
      //this.fetchTagConfiguration()
      this.tagConfiguration = {
        id: -1,
        name: "New Template",
        transformation: "Select Parameter,Parameter as Tagname from pi_data",
        reference: ""      
      }
    },
    closeTagConfModal : function(){
      console.log("closing dialog")
      this.tagConfDialog=false
      this.fetchPIData(this.id)
    }
  },

  watch: {
    $route (to, from){
      this.emitRouteUpdate(to)
      //this.show = false;
    }
  },

}
</script>