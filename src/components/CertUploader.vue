<template>
  <v-row justify="center">
    <v-dialog :value="dialog" persistent max-width="600px" @click:outside="close" @keydown.esc="close">
    <!-- <v-dialog :value="dialog" persistent max-width="600px"> -->
      <v-card>
        <v-card-title>
          <span class="headline">Upload Certificate</span>
          <!-- <v-spacer/>
          <v-tooltip v-else top>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="connectToDBDialog" >mdi-database-search</v-icon>
            </template>
            <span>{{VIEW_MODE_ICON_HINT}}</span>
          </v-tooltip> -->
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
            <v-radio-group v-model="certType" row>
              <v-radio label="DGA Test Certificate" value="DGA"></v-radio>
              <v-radio label="Coal Test Certificate" value="COAL"></v-radio>
            </v-radio-group>
            {{fileUpload}}
            <v-file-input 
              v-model="fileUpload"
              prepend-icon="mdi-file"
              accept="pdf"
            >
            </v-file-input>
            <!-- <v-form
              ref="form"
              lazy-validation
              v-else
              >
              TODO
              <v-text-field
                label=""
                name="sqlDBUpload"
                prepend-icon="mdi-database"
                type="text"
                required
              />
              <v-text-field
                name="username"
                prepend-icon="person"
                type="text"
                required
              />
              <v-text-field
                prepend-icon="lock"
                name="password"
                type="password"
                required
              />
            </v-form> -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <!-- <v-btn color="red" text @click="close">{{CLOSE_DIALOG_BUTTON_LABEL}}</v-btn> -->
          <v-btn color="deep-purple lighten-2" :disabled="!fileUpload" text @click="uploadNewCert">Upload File</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import axios from 'axios'
//TODO
//Create Mixin for this .js component

export default {
  name: 'CertUploader',

  props: {
    dialog : Boolean,
  },

  data: ()=> ({
    fileUpload : null,
    certType : "COAL",
    isAlerted : false,
    responseStatus : null,
    responseMessage : null,
  }),

  methods : {
    uploadNewCert : function() {
      let formData = new FormData();
      console.log(this.fileUpload.name)
      formData.append('cert_type',this.certType)
      formData.append('name',this.fileUpload.name)
      formData.append('upload',this.fileUpload)

      return new Promise((resolve, reject) => {
        axios({url: `http://10.10.8.116:81/api/v1/certificates/`, 
              method: 'POST',
              headers: {
                  /*"Authorization": `Bearer ${token}`,*/
                  'Content-Type': 'multipart/form-data'
              },
              data: formData
            })
        .then(resp => { 
          console.log(resp.data)
          let _id = resp.data.id
          return new Promise((resolve, reject) => {
            axios({url: `http://10.10.8.116:81/api/v1/extract_data?_id=${_id}`, 
                  method: 'POST',
                })
            .then(resp => { 
              console.log(resp)
              this.isAlerted = true
              this.responseStatus = resp.status
              this.responseMessage = "Certificate Successfully Uploaded and Queued for Data Extraction.Queued Certificates for Data Extraction will take a few seconds to process. Please refresh page to see updated status."

              //reset data
              this.fileUpload = null
              this.newCertUploaded()
              resolve(resp)
            })
            .catch(err => {
              console.log(err.response)
              //TODO
              //Error Message
              reject(err)
            })
          }) 
          this.isAlerted = true
          this.responseStatus = resp.status
          this.responseMessage = "Certificate Successfully Uploaded"

          //reset data
          this.fileUpload = null
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
    close: function(){
      console.log('clossing dialog')
      this.$emit('closed', null)
    },
    newCertUploaded: function(){
      console.log('new cert is added')
      this.$emit('newCertUploaded', null)
    }
  }
}
</script>