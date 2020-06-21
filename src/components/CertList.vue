<template>
  <v-data-table
    :headers="headers"
    :items="certificates"
    :search="search"
    sort-by="id"
    class="elevation-1"
    dense
  >
    <template v-slot:top>
      <CertUploader :dialog="addItemDialog" @closed="closeCertUploader" @newCertUploaded="fetchCertificates"/>
      <v-toolbar flat color="white">
        <v-toolbar-title>Certificates</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical>
        </v-divider>
        <v-btn
          color="primary"
          dark
          @click="addItem">
          New Item
        </v-btn>
        <v-spacer></v-spacer>
        <!-- TODO
        Create Component for Edit Dialog -->
        <v-dialog v-model="editItemDialogg" max-width="500px">
          <!-- <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              dark
              class="mb-2"
              v-bind="attrs"
              v-on="on"
            >New Item</v-btn>
          </template> -->
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
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

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details>
        </v-text-field>
      </v-toolbar>
    </template>
    <template v-slot:item.extraction_status="{item}">

      <!-- <v-text-field v-model="item.Parameter" dense solo flat hide-details :background-color="item.Validated ? 'light-green lighten-3' : 'yellow lighten-3'"/> -->
      <v-chip :color="extractionStatusColor[item.extraction_status]" dark>{{extractionStatus[item.extraction_status]}}</v-chip>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        small
        class="mr-2"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        v-if="item.extraction_status=='E'"
        small
        @click="extractData(item)"
      >
        mdi-export
      </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="fetchCertificates">Reset</v-btn>
    </template>
  </v-data-table>
</template>

<script>
import axios from 'axios'
import CertUploader from '@/components/CertUploader.vue'

export default {
  name: 'CertList',  

  components: {CertUploader},

  data: () => ({
    editItemDialogg: false,
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
    }    
  }),

  mounted() {
    this.fetchCertificates()
  },

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    },
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
  },

  created () {
    /*this.initialize()*/
    this.fetchCertificates()
  },

  methods: {
    fetchCertificates () {
      return new Promise((resolve, reject) => {
        axios({url: `http://10.10.8.116:81/api/v1/certificates/`, 
              method: 'GET',
            })
        .then(resp => { 
          console.log(resp)
          this.certificates = resp.data
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

    extractData (item) {
      this.$router.push(`/data?_id=${item.id}`)
    },
    editItem (item) {
      this.editedIndex = this.certificates.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.editItemDialog = true
    },
    addItem(){
      this.addItemDialog = true
    },
    deleteItem (item) {
      const index = this.desserts.indexOf(item)
      confirm('Are you sure you want to delete this item?') && this.desserts.splice(index, 1)
    },
    close () {
      this.editItemDialogg = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    save () {
      //TODO
      /*if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem)
      } else {
        this.desserts.push(this.editedItem)
      }*/
      this.close()
    },
    closeCertUploader: function(value){
      this.addItemDialog = false;
    },
  },

}
</script>