export default {
	data (){
		return {
			BACKEND_REST_API : `http://192.168.254.166:81/api/v1`
		}
	},
	computed: {
	    userGroups () {
	      return this.$store.getters.userGroups
	    },
	    isPublicUser () {
	    	return this.userIsInGroup("public")
	    },
	    isCertificateUploader () {
	    	return this.userIsInGroup("certificate_uploader")	
	    },
	    isDataValidator () {
	    	return this.userIsInGroup("data_validator")
	    }
	},
	methods: {
		userIsInGroup: function(group) {
			return this.userGroups.includes(group)
		}
	}
}