<template>
  <div>
    <!-- <PIModal :dialog="piDialog" mode="upload" @closed="closePIModal" @upload="uploadEditedData"/> -->
    <ManualLogTemplateModal :dialog="manualLogDialog" @useTemplate="updatePIDataByTemplate" @closed="closeManualLogDialog"/>
    <!-- {{piData}} -->
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
          <v-btn color="cyan darken-4" text @click="addNewItem">New Item</v-btn>
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
          <v-btn color="cyan darken-4" text @click="reset">Reset</v-btn>
          <v-btn color="cyan darken-4" text>Upload CSV</v-btn>
          <v-btn color="cyan darken-4" text @click="manualLogDialog=true">Templates</v-btn>
          <v-btn color="cyan darken-4" text @click="validateAll">Validate All</v-btn>
          <v-btn color="cyan darken-4" text>Upload</v-btn>
          <!-- <v-btn color="cyan darken-4" text @click="saveEditedData">Save</v-btn>
          <v-btn color="cyan darken-4" text @click="verifyBeforeUpload">Upload</v-btn> -->
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
import ManualLogTemplateModal from './ManualLogTemplateModal'
import ConfigMixin from '../mixins/config.js'
import AlertMixin from '../mixins/views/AlertMixin.js'
import DataListMixin from '../mixins/views/DataListMixin.js'

export default {
  name: 'PICertDataList',  

  components: {PIModal,ManualLogTemplateModal},

  mixins: [ConfigMixin,AlertMixin,DataListMixin],

  created () {
    /*this.initialize()*/
    //id = this.$route.query._id
    /*this.listConfigurations()
    let id = this.$route.query["_id"]
    this.id = id
    this.fetchPIData(id)*/
  },

  data: () => ({
    piDialog : false, 
    manualLogDialog: false,
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
    dataIsLoaded: true,
    piData: [
      {
        "Parameter" : "",
        "Timestamp" : new Date(),
        "Value" : null,
        "Validated" : false,
        "Uploaded" : false,
      }
    ],
    selectedPIData: [],
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

  methods: {
    logoutAndRedirect (item) {
      if (this.responseStatus == 401 || this.responseStatus == 403){
        this.$store.dispatch('logout')
        this.$router.push('/login')
      }
    },
    closeAlert () {
      this.isAlerted = false
      this.responseStatus = null
      this.responseMessage = null
    },
    updatePIDataByTemplate(template) {
      this.manualLogDialog = false
      template.forEach(function(element){
        element.Timestamp = null
        element.Value  = null
        element.Validated = false
        element.Uploaded = false
      })

      this.piData = template
    },
    closeManualLogDialog () {
      this.manualLogDialog = false
    },
  },

  watch: {
    $route (to, from){
      this.emitRouteUpdate(to)
    }
  },
}
</script>