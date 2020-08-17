export default {
	data (){
		return {
			piDialog: false,
		}
	},
	methods: {
    verifyBeforeUpload () {
      let token = this.$store.getters.token
      this.piDialog = true
    },
    closePIModal: function(value){
      this.piDialog = false;
      //TODO Update Configuration on router using mutation
    },
	},
}