<template>
	<v-row justify="center">
		<v-dialog :value="dialog" persistent max-width="600px" @click:outside="close" @keydown.esc="close">
			<v-card>
        <v-card-title>
          <span class="headline">Manual Log Templates</span>
        </v-card-title>
        <v-divider/>
        <!-- TODO Alerts -->
        <!-- <v-alert
          v-if="isAlerted"
          dense
          outlined
          :type="responseStatus == 200 || responseStatus == 201 ? 'success' : 'error'"
        >
          {{responseMessage}}
        </v-alert> -->
        <v-card-text>
          <v-radio-group v-model="selectOrUpload" row>
            <v-radio label="Select Template" value="select"></v-radio>
            <v-radio label="Upload New Template" value="upload"></v-radio>
          </v-radio-group>
          <v-row v-if="selectOrUpload=='select'">
            <v-select
              v-model="selectedManualLogTemplate"
              :items="manualLogTemplatesFiltered"
              menu-props="auto"
              label="Select Manual Log Template"
              prepend-icon="mdi-file"
            >
            </v-select>
          </v-row>
          <v-row v-if="selectOrUpload=='upload'">
            <v-text-field v-model="manualLogTemplate.name" label="Name"></v-text-field>
          </v-row>
          <v-row v-if="selectOrUpload=='upload'">
            <v-file-input 
              v-model="manualLogTemplate.template"
              prepend-icon="mdi-file"
              label="Upload New Template"
              accept=".csv"
            >
            </v-file-input>
          </v-row>
        </v-card-text>
	      <v-card-actions>
	        <v-spacer></v-spacer>
	        <v-btn 
	        	v-if="selectOrUpload=='upload'" 
	        	:disabled="!canUpload"
	        	color="cyan darken-4" 
	        	text 
	        	@click="addManualLogTemplate"
	        >
	      		Upload Template
	      	</v-btn>
	        <v-btn 
	        	v-if="selectOrUpload=='select'" 
	        	:disabled="!canSelect"
	        	color="cyan darken-4" 
	        	text 
	        	@click="useManualLogTemplate"
	        >
	      		Use Template
	      	</v-btn>
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
	name : "ManualLogTemplateModal",

	props: {
		dialog : Boolean
	},

	mixins : [ConfigMixin,AlertMixin],

  created () {
  	this.fetchManualLogTemplate()
  },

	data: () =>({
		selectOrUpload: "select",
		selectedManualLogTemplate: null,
		manualLogTemplates: [],
		manualLogTemplate: {
			id : null,
			name: null,
			template: null,
		}
	}),

	computed: {
    manualLogTemplatesFiltered: function() {
      return this.manualLogTemplates.map(item=>item.name)
    },
    canUpload: function(){
    	return this.manualLogTemplate.name && this.manualLogTemplate.template
    },
    canSelect: function(){
    	return this.selectedManualLogTemplate
    }
	},

	methods: {
		fetchManualLogTemplate: function() {
      let token = this.$store.getters.token
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/manuallogtemplates`, 
              method: 'GET',
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            })
        .then(resp => { 
        	this.manualLogTemplates = resp.data
          resolve(resp)
        })
        .catch(err => {
        	console.log(err)
          reject(err)
        })
      })
		},
		addManualLogTemplate: function(){
      let token = this.$store.getters.token
      let formData = new FormData();
      formData.append('name',this.manualLogTemplate.name)
      formData.append('template',this.manualLogTemplate.template ? this.manualLogTemplate.template : '')
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/manuallogtemplates/`, 
              method: 'POST',
              headers: {
                  'Content-Type': 'multipart/form-data',
                  "Authorization": `Bearer ${token}`
              },
              data: formData
            })
        .then(resp => { 
        	this.selectOrUpload = "select"
        	this.selectedManualLogTemplate = resp.data.name
        	this.fetchManualLogTemplate()
          resolve(resp)
        })
        .catch(err => {
          //console.log(err.response)
          reject(err)
        })
      }) 
		},
		useManualLogTemplate: function(){
			this.manualLogTemplate = this.manualLogTemplates.find(item=>item.name == this.selectedManualLogTemplate)
			let token = this.$store.getters.token
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/extract_manual_log_template?_id=${this.manualLogTemplate.id}`, 
              method: 'POST',
              headers: {
                  "Authorization": `Bearer ${token}`
              },
            })
        .then(resp => { 
        	this.$emit('useTemplate', resp.data.template)
          resolve(resp)
        })
        .catch(err => {
          console.log(err.response)
          reject(err)
        })
      })
		},
		resetData: function(){
			this.selectOrUpload = "select"
			this.selectedManualLogTemplate = null
			this.manualLogTemplate = {
				id : null,
				name: null,
				template: null
			}
		},
    close: function(){
    	this.resetData()
      this.$emit('closed', null)
    },		
	}
}
</script>