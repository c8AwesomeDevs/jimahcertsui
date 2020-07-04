<template>
  <div class="home">
  <!-- 
  TODO 
  Alertes 
	-->
	<pdf 
		v-for="i in numPages"
		:key="i"
		:src="pdfSource"
		:page="i"
	/>
  </div>
</template>

<script>
import axios from 'axios'
import pdf from 'vue-pdf'
import ConfigMixin from '../mixins/config.js'

export default {
  name: 'PDFViewer',
  components: {
    pdf,
  },
  mixins: [ConfigMixin],
  data: () => ({
    pdfSource: null,
    numPages: 1,
    loadingTask: null,
  }),
  created () {
    /*this.initialize()*/
    //id = this.$route.query._id
    let id = this.$route.query["_id"]
    this.id = id
    this.viewPdf(id)
  },
  methods: {
    viewPdf (id) {
      console.log("Extracting PDF")
      let token = this.$store.getters.token
      return new Promise((resolve, reject) => {
        axios({url: `${this.BACKEND_REST_API}/view_pdf?_id=${id}`, 
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type" : "application/pdf"            
              },
              responseType: 'blob'
            })
        .then(resp => { 
          var fileURL = window.URL.createObjectURL(new Blob([resp.data]));
          this.loadingTask = pdf.createLoadingTask(fileURL)
					this.loadingTask.promise
				  .then(this.getNumPages)
				  .catch(err=>{
				  	console.log(err)
				  })
          this.pdfSource = fileURL
        })
        .catch(err => {
          console.log(err)
        })
      }) 
    },
    getNumPages(pdf) {
    	this.numPages = pdf.numPages
    }
  }
}
</script>
