<template>
  <v-row justify="center">
    <v-dialog :value="dialog" persistent max-width="600px" @click:outside="close" @keydown.esc="close">
      <v-card v-if="mode=='configure'">
        <v-card-title>
          <span class="headline">Configure Tag Templates</span>
        </v-card-title>
        <v-divider/>
        <v-alert
          v-if="isAlerted"
          dense
          outlined
          :type="responseStatus == 200 || responseStatus == 201 ? 'success' : 'error'"
        >
          {{responseMessage}}
        </v-alert>
        <v-card-text>
            <v-row>
              <v-chip-group
                multiple
                active-class="primary--text"
              >
                <v-chip color="light-green darken-3" dark v-for="sqlVariable in sqlVariables" :key="sqlVariable">
                  {{ sqlVariable }}
                </v-chip>
              </v-chip-group>
            </v-row>
            <v-radio-group v-model="selectOrCreate" @change="resetConfiguration" row>
              <v-radio label="Select Configuration from existing Configurations" value="select"></v-radio>
              <v-radio label="Create New Configuration" value="create"></v-radio>
            </v-radio-group>
            <v-row>
              <v-select
                v-if = "selectOrCreate=='select'"
                v-model="tagConfigurationId"
                :items="tagConfigurationsFiltered"
                menu-props="auto"
                label="Select Configurations"
                prepend-icon="mdi-file"
                @change="selectConfigurations"
              >
              </v-select>
            </v-row>
            <v-row>
              <v-text-field :disabled= "selectOrCreate=='select'" v-model="tagConfiguration.name" label="Name"></v-text-field>
            </v-row>

            <v-row>
              <v-textarea
                :disabled= "selectOrCreate=='select'"
                label="Transformation"
                v-model="tagConfiguration.transformation"
                hint="Write transformation query in SQLite Syntax"
                :height="100"
              ></v-textarea>
            </v-row>
            <v-row>
              <v-file-input 
                v-if= "selectOrCreate=='create'"
                v-model="tagConfiguration.reference"
                prepend-icon="mdi-file"
                label="Reference"
                accept=".csv"
              >
              </v-file-input>
            </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-if="selectOrCreate=='create'" color="cyan darken-4" text @click="addConfiguration">Save Configuration</v-btn>
          <v-btn v-if="selectOrCreate=='select'" color="cyan darken-4" text @click="patchCertTagConfiguration">Save Configuration</v-btn>
          <v-btn color="cyan darken-4" text @click="previewConfiguration">Preview Configuration</v-btn>
        </v-card-actions>
      </v-card>
              {{responseMessage}}
      <v-card v-if="mode=='preview'">
        <v-card-title>
          <span class="headline">Preview Tags</span>
        </v-card-title>
        <v-divider/>
        <v-alert
          v-if="isAlerted"
          dense
          outlined
          :type="responseStatus == 200 ? 'success' : 'error'"
        >
          {{responseMessage}}
        </v-alert>
         <v-card-text>
          <v-data-table
            :headers="headers"
            :items="preview"
            class="elevation-1"
            dense
          >
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="cyan darken-4" text @click="mode = 'configure'">Edit Configuration</v-btn>
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
  name : "TagConfTemplateModal",
  
  props: {
    dialog : Boolean,
    id : Number,
    tagConfiguration : Object,
    tagConfigurations: Array,
    certTagConfigurationId: Number,
  },

  mixins: [ConfigMixin,AlertMixin],

  data: ()=> ({
    reference : '',
    name: null,
    mode: 'configure',
    transformation: "Select Parameter,Parameter as Tagname from pi_data",
    //Table
    headers: [
      { text: 'Parameter', value: 'Parameter'},
      { text: 'Tagname', value: 'Tagname'},
    ],
    dataIsLoaded: false,
    preview: [],
    //
    tagConfigurationId : -1,
    selectOrCreate: "select",
  }),

  computed: {
    sqlVariables: function(){
      return !this.reference ? ["pi_data"] : ["pi_data","reference"]
    },
    hasTagConfiguration: function() {
      return this.certTagConfigurationId!=-1
    },
    tagConfigurationsFiltered: function() {
      return this.tagConfigurations.map(item=>item.id)
    },
  },

  methods: {
    selectConfigurations : function(){
      let tempTagConfiguration = this.tagConfigurations.find(item=>item.id==this.tagConfigurationId)
      //console.log(this.tagConfigurations)
      this.$emit('selectConfigurations', tempTagConfiguration)
    },
    resetConfiguration: function(){
      if (this.selectOrCreate==="create"){
        this.$emit('resetConfiguration', null)
      }
    },
    previewConfiguration () {
      this.$emit('newActivityLog', null)
      let token = this.$store.getters.token
      let formData = new FormData();
      formData.append('transformation',this.tagConfiguration.transformation)
      formData.append('reference',this.tagConfiguration.reference ? this.tagConfiguration.reference : '')
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/preview_configuration_api?_id=${this.id}`, 
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              data: formData
            })
        .then(resp => { 
          //console.log(resp)
          this.isAlerted = true
          this.responseStatus = resp.status
          this.responseMessage = resp.data.message
          this.preview = resp.data.preview
          this.mode = 'preview'
          resolve(resp)
        })
        .catch(err => {
          this.isAlerted = true
          this.responseStatus = err.response.status
          this.responseMessage = err.response.data.message
          reject(err)
        })
      })
    },
    addConfiguration : function() {
      this.$emit('newActivityLog', null)
      let token = this.$store.getters.token
      let formData = new FormData();
      formData.append('name',this.tagConfiguration.name)
      formData.append('transformation',this.tagConfiguration.transformation)
      formData.append('reference',this.tagConfiguration.reference ? this.tagConfiguration.reference : '')
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/tagconfigurationtemplates/`, 
              method: 'POST',
              headers: {
                  'Content-Type': 'multipart/form-data',
                  "Authorization": `Bearer ${token}`
              },
              data: formData
            })
        .then(resp => { 
          this.tagConfigurationId = resp.data.id
          this.patchCertTagConfiguration()
          this.isAlerted = true
          this.responseStatus = resp.status
          this.responseMessage = "Tag Configuration Successfully Uploaded"
          resolve(resp)
        })
        .catch(err => {
          //console.log(err.response)
          this.isAlerted = true
          this.responseStatus = err.response.status
          this.responseMessage = err.response.data
          reject(err)
        })
      }) 
    },
    editConfiguration : function() {
      this.$emit('newActivityLog', null)
      let token = this.$store.getters.token
      let formData = new FormData();
      formData.append('name',this.tagConfiguration.name)
      formData.append('transformation',this.tagConfiguration.transformation)
      formData.append('reference',this.tagConfiguration.reference ? this.tagConfiguration.reference : '')
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/tagconfigurationtemplates/${this.tagConfiguration.id}/`, 
              method: 'PATCH',
              headers: {
                  'Content-Type': 'multipart/form-data',
                  "Authorization": `Bearer ${token}`
              },
              data: formData
            })
        .then(resp => { 
          this.tagConfigurationId = resp.data.id
          this.patchCertTagConfiguration()
          this.isAlerted = true
          this.responseStatus = resp.status
          this.responseMessage = "Tag Configuration Successfully Edited"
          resolve(resp)
        })
        .catch(err => {
          //console.log(err.response)
          this.isAlerted = true
          this.responseStatus = err.response.status
          this.responseMessage = err.response.data
          reject(err)
        })
      }) 
    },
    patchCertTagConfiguration: function() {
      //console.log("Patching Configuration")
      let token = this.$store.getters.token
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/certificates/${this.id}/`, 
              method: 'PATCH',
              headers: {
                  "Authorization": `Bearer ${token}`
              },
              data: {tag_configuration_id: this.tagConfigurationId}
            })
        .then(resp => { 
          this.$emit('listConfigurations', null)
          resolve(resp)
        })
        .catch(err => {
          this.isAlerted = true
          this.responseStatus = err.response.status
          this.responseMessage = err.response.data
          reject(err)
        })
      }) 
    },
    close: function(){
      this.selectOrCreate = 'select'
      this.$emit('closed', null)
    },
  }

}

</script>