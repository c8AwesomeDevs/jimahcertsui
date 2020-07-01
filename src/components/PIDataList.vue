<template>
    <v-data-table
      :headers="headers"
      :items="piData"
      :search="search"
      sort-by="Parameter"
      :loading ="!dataIsLoaded"
      loading-text="Extracting Data... Please wait"
      dense
    >
      <template v-slot:top>
        <PIModal :dialog="piDialog" mode="upload" @closed="closePIModal" @upload="uploadEditedData"></PIModal>
        <v-alert
          v-if="isAlerted"
          dense
          outlined
          :type="responseStatus == 200 ? 'success' : 'error'"
        >
          <v-row>
            {{responseMessage}}
            <v-spacer/>
            <v-btn icon :color="responseStatus == 200 ? 'success' : 'error'" v-if="responseStatus==401 || responseStatus==403" @click="logoutAndRedirect">
              <v-icon small>mdi-login</v-icon>
            </v-btn>   
            <v-btn v-else icon :color="responseStatus == 200 ? 'success' : 'error'" @click="closeAlert">
              <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-row>
        </v-alert>
        <v-toolbar flat color="white">
          <v-toolbar-title>PI Data</v-toolbar-title>
          <v-divider
            class="mx-4"
            inset
            vertical>
          </v-divider>
          {{certName}}
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
          <v-btn color="deep-purple darken-1" text @click="saveEditedData">Save</v-btn>
          <v-btn color="deep-purple darken-1" text @click="verifyBeforeUpload">Save and Upload</v-btn>
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
</template>

<script>
import axios from 'axios'
import PIModal from './PIModal'

export default {
  name: 'PIDataList',  

  components: {PIModal},

  data: () => ({
    id : null,
    certName: null,
    piDialog : false, 
    search: '',
    //Table
    headers: [
      { text: 'Parameter', value: 'Parameter',filterable: true, groupable: true, width: "40%" },
      { text: 'Description', value: 'Description', width: "20%"},
      { text: 'Timestamp', value: 'Timestamp'},
      { text: 'Value', value: 'Value'},
      { text: 'Validated', value: 'Validated'},
      { text: 'Uploaded', value: 'Uploaded'},
    ],
    dataIsLoaded: false,
    piData: [],
    selectedPIData: [],
    editedItem: {
      Parameter: null,
      Description: '',
      Timestamp: null,
      Value : null,
      Validated: false,
    },
    defaultItem: {
      Parameter: null,
      Description: '',
      Timestamp: null,
      Value : null,
      Validated: false,
      Uploaded: false,
    },
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
  }),

  mounted() {
    /*let id = this.$route.query["_id"]
    this.fetchPIData(id)*/
  },

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    },
  },

  created () {
    /*this.initialize()*/
    //id = this.$route.query._id
    let id = this.$route.query["_id"]
    this.id = id
    this.fetchPIData(id)
  },

  methods: {
    fetchPIData (id) {
      console.log("Extracting Data")
      let token = this.$store.getters.token
      console.log(token)
      return new Promise((resolve, reject) => {
        axios({url: `http://10.10.8.113:81/api/v1/view_data?_id=${id}`, 
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${token}`                
              }
            })
        .then(resp => { 
          console.log(resp)
          this.piData = resp.data.results
          for(var item in this.piData){
            this.piData[item]["Timestamp"] = new Date(this.piData[item]["Timestamp"])
          }
          this.certName = resp.data.cert.name
          this.dataIsLoaded = true
          this.isAlerted = true
          this.responseStatus = resp.status
          this.responseMessage = "PI Data succesfully retrieved"
          resolve(resp)
        })
        .catch(err => {
          console.log(err.response)
          this.dataIsLoaded = true
          this.isAlerted = true
          this.responseStatus = err.response.status
          this.responseMessage = err.response.data.detail
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

    editItem (item) {
      this.editedIndex = this.certificates.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.editDialog = true
    },

    deleteItem (item) {
      const index = this.desserts.indexOf(item)
      confirm('Are you sure you want to delete this item?') && this.desserts.splice(index, 1)
    },

    closeAlert () {
      this.isAlerted = false
      this.responseStatus = null
      this.responseMessage = null
    },
    saveEditedData () {
      console.log("Saving Edited Data")
      let token = this.$store.getters.token
      return new Promise((resolve, reject) => {
        axios({url: `http://10.10.8.113:81/api/v1/save_edited_data?_id=${this.id}`, 
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${token}`                
              },
              data: this.piData
            })
        .then(resp => { 
          console.log(resp)
          this.isAlerted = true
          this.responseStatus = resp.status
          this.responseMessage = resp.data.message
          resolve(resp)
        })
        .catch(err => {
          console.log(err.response)
          //TODO
          //Error Message
          reject(err)
        })
      })
    },
    verifyBeforeUpload () {
      let token = this.$store.getters.token
      this.piDialog = true
    },
    uploadEditedData (metadata) {
      this.piDialog = false
      let token = this.$store.getters.token
      let data = {
        metadata: metadata,
        piData : this.piData
      }
      return new Promise((resolve, reject) => {
        axios({url: `http://10.10.8.113:81/api/v1/upload_edited_data?_id=${this.id}`, 
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${token}`
              },
              data: data
            })
        .then(resp => { 
          console.log(resp)
          this.isAlerted = true
          this.responseStatus = resp.status
          this.responseMessage = resp.data.message
          //refresh list
          this.fetchPIData(this.id)
          resolve(resp)
        })
        .catch(err => {
          console.log(err.response)
          //TODO
          //Error Message
          reject(err)
        })
      })
    },
    duplicateTimestamp(timestamp){
      console.log("duplicating")
      console.log(timestamp)
      for(var item in this.piData){
        this.piData[item]["Timestamp"] = timestamp
      }
    },
    closePIModal: function(value){
      this.piDialog = false;
    },
  },

}
</script>