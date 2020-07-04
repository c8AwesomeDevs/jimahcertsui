<template>
  <div class="home">
	<pdf :src="pdfSource"></pdf>
  </div>
</template>

<script>
import axios from 'axios'
import pdf from 'vue-pdf'
import ConfigMixin from '../mixins/config.js'

export default {
  name: 'PDFViewer',
  components: {
    pdf
  },
  mixins: [ConfigMixin],
  data: () => ({
    pdfSource: null,
  }),
  created () {
    /*this.initialize()*/
    //id = this.$route.query._id
    let id = this.$route.query["_id"]
    this.id = id
    this.viewPdf(id)
  },
  methods: {
    viewPdf () {
      console.log("Extracting PDF")
      let token = this.$store.getters.token
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/view_pdf?_id=${id}`, 
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type" : "application/pdf"            
              },
              responseType: 'arraybuffer'
            })
        .then(resp => { 
          console.log(resp)
          //this.pdfSource = resp.data
          //this.pdfSource = new Blob([response.data], { type: 'application/pdf' })
          var fileURL = window.URL.createObjectURL(new Blob([resp.data]));
          this.pdfSource = fileURL

        })
        .catch(err => {
          console.log(err.response)
        })
      }) 
    },
  }
}
</script>
