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
        <v-alert
          v-if="isAlerted"
          dense
          outlined
          :type="responseStatus == 200 ? 'success' : 'error'"
        >
          <v-row>
            {{responseMessage}}
            <v-spacer/>
            <v-btn icon :color="responseStatus == 200 ? 'success' : 'error'" @click="closeAlert">
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
          <v-btn color="green darken-1" text @click="saveEditedData">Save</v-btn>
          <v-btn color="green darken-1" text >Save and Upload</v-btn>
        </v-row>
        <v-divider></v-divider>
      </template>
      <template v-slot:item.Value="{item}" @dblclick="">
        <v-text-field v-model="item.Value" dense solo flat hide-details/>
      </template>
      <template v-slot:item.Parameter="{item}" @dblclick="">
        <v-text-field v-model="item.Parameter" dense solo flat hide-details :background-color="item.Validated ? 'light-green lighten-3' : 'yellow lighten-3'"/>
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
    </v-data-table>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PIDataList',  

  components: [],

  data: () => ({
    id : null,
    certName: null,
    editDialog: false,
    search: '',
    //Table
    headers: [
      { text: 'Parameter', value: 'Parameter',filterable: true, groupable: true, width: "30%" },
      { text: 'Description', value: 'Description', width: "25%"},
      { text: 'Timestamp', value: 'Timestamp'},
      { text: 'Value', value: 'Value'},
      { text: 'Validated', value: 'Validated'},
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
    },
    //calendard data
    datetime: new Date(),
    timeProps: {
      useSeconds: true,
      ampmInTitle: true
    },
    textFieldProps: {
      dense: true,
      solo: true, 
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
      return new Promise((resolve, reject) => {
        axios({url: `http://10.10.8.116:81/api/v1/extract_data?_id=${id}`, 
              method: 'POST',
            })
        .then(resp => { 
          console.log(resp)
          this.piData = resp.data.results
          for(var item in this.piData){
            this.piData[item]["Timestamp"] = new Date(this.piData[item]["Timestamp"])
          }
          this.certName = resp.data.cert.name
          this.dataIsLoaded = true
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

    /*extractData (item) {
      console.log(item.id)
    },*/

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
      this.responseStatus = resp.status
      this.responseMessage = resp.data.message
    },

    saveEditedData () {
      console.log("Saving Edited Data")
     /* let formData = new FormData();
      formData.append('data_to_save',this.piData)*/
      return new Promise((resolve, reject) => {
        axios({url: `http://10.10.8.116:81/api/v1/save_edited_data?_id=${this.id}`, 
              method: 'POST',
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
    duplicateTimestamp(timestamp){
      console.log("duplicating")
      console.log(timestamp)
      for(var item in this.piData){
        this.piData[item]["Timestamp"] = timestamp
      }
    }
  },

}
</script>