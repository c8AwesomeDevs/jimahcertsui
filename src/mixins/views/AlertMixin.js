export default {
	data (){
		return {
				alerts : [],
	      responseMessage: "",
	      responseStatus: null,
	      isAlerted: false,
		}
	},
	computed: {
		alertsReversedSpliced: function(){
			return this.alerts.slice(-3).reverse()
		}
	},
	methods: {
    closeAlert (index) {
      this.alerts.splice(index,1)
    },
    clearAlerts(){
    	this.alerts = []
    }
	},
	/*mounted() {
		setTimeout(this.closeAlert, 5000)
	}*/
}