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
        <v-toolbar flat color="white">
          <v-toolbar-title>PI Data</v-toolbar-title>
          <v-divider
            class="mx-4"
            inset
            vertical>
          </v-divider>
          {{certName}}
          <v-spacer></v-spacer>
          <!-- TODO
          Create Component for Edit Dialog -->
          <!-- <v-dialog v-model="editDialog" max-width="500px">
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
          </v-dialog> -->
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details>
          </v-text-field>
        </v-toolbar>
      </template>
      <!-- <template v-slot:item.actions="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
      </template> -->
      <template v-slot:item.Parameter="{item}" @dblclick="">
        <v-text-field v-model="item.Parameter" dense solo flat hide-details :background-color="item.Validated ? 'light-green lighten-3' : 'yellow lighten-3'"/>
      </template>
      <template v-slot:item.Validated="{ item }">
        <v-simple-checkbox v-model="item.Validated"></v-simple-checkbox>
      </template>
      <!-- <template v-slot:no-data>
        <v-btn color="primary" @click="fetchPIData">Reset</v-btn>
      </template> -->
    </v-data-table>
</template>

<script>
import axios from 'axios'
//import CertUploader from '@/components/CertUploader.vue'

export default {
  name: 'PIDataList',  

  // components: [CertUploader],

  data: () => ({
    certName: null,
    editDialog: false,
    search: '',
    headers: [
      { text: 'Parameter', value: 'Parameter',filterable: true, groupable: true, width: "40%" },
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

  watch: {
    dialog (val) {
      val || this.close()
    },
  },

  created () {
    /*this.initialize()*/
    //id = this.$route.query._id
    let id = this.$route.query["_id"]
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

    close () {
      this.editDialog = false
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
  },

}
</script>