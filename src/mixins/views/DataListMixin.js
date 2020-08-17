export default {
	methods: {
    addNewItem(item){
      let newItem = {
        "Parameter" : "",
        "Timestamp" : new Date(),
        "Value" : null,
        "Validated" : false,
        "Uploaded" : false,
      }
      this.piData.unshift(newItem)
    },
    reset(){
	    this.piData = [
	      {
	        "Parameter" : "",
	        "Timestamp" : new Date(),
	        "Value" : null,
	        "Validated" : false,
	        "Uploaded" : false,
	      }
	    ]
	    this.selectedPIData = []
    },
    validateAll(){
    	this.piData.forEach(function(item){
    		if(item.Parameter && item.Timestamp && item.Value){
                item.Validated = true
            }
    	})
    },
    duplicateTimestamp(timestamp){
      for(var item in this.piData){
        this.piData[item]["Timestamp"] = timestamp
      }
    },
    emitRouteUpdate(route){
    	this.$emit('updateRoute', route)
    }
	},
}