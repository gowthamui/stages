myApp.factory( 'DataService',['ConfigService','UserService','$http','$interval','$location', '$state','$window',
	function(ConfigService,UserService,$http,$interval,$location,$state,$window) {
		var cachedWidgetTypes= null;
		var cachedDataTypes = null;
		var cachedFormTypes = null;
        var cachedValueDataSources=null;
		var cachedDeIdentifyStrategies=null;
		var serviceInstance ={

			getPath:function(path){
				return ConfigService.webServiceRoot  +ConfigService.clientDataPath+path;
			},
			getFilePath:function(id){
				return ConfigService.webServiceRoot  +ConfigService.clientDataPath+'file/ValueFile/'+id;
			},
			post: function(methodName,data) {
				var parameters = data ||{};
				return $http.post(ConfigService.webServiceRoot+ConfigService.clientDataPath+methodName,parameters,{
					headers:{
					}
				});

			},

			get: function(methodName) {
				return $http.get(ConfigService.webServiceRoot+ConfigService.clientDataPath+methodName,{
					headers:{
					}
				});

			},

			widgetTypes:function(callback){
				if(cachedWidgetTypes==null){
					serviceInstance.post('data/WidgetType/search').then(function(result){
						cachedWidgetTypes=result.data.items;
					    callback(cachedWidgetTypes);
					});
				}else{
					callback(cachedWidgetTypes);
				}
			},

			deIdentifyStrategies:function(callback){
				if(cachedDeIdentifyStrategies==null){
					serviceInstance.post('data/DeIdentifyStrategy/search').then(function(result){
						cachedDeIdentifyStrategies=result.data.items;
						callback(cachedDeIdentifyStrategies);
					});
				}else{
					callback(cachedDeIdentifyStrategies);
				}
			},

			valueDataSources:function(callback){
				if(cachedValueDataSources==null){
					serviceInstance.post('data/ValueDataSource/search').then(function(result){
						cachedValueDataSources=result.data.items;
						callback(cachedValueDataSources);
					});
				}else{
					callback(cachedValueDataSources);
				}
			},

			users:function(callback){
				serviceInstance.post('data/Users/search').then(function(result){
					callback(result.data.items);
				});
			},

			groups:function(callback){
				serviceInstance.post('data/Groups/search').then(function(result){
					callback(result.data.items);
				});
			},


			dataTypes:function(callback){
				if(cachedDataTypes==null){
					serviceInstance.post('data/DataType/search').then(function(result){
						cachedDataTypes=result.data.items;
						callback(cachedDataTypes);
					});
				}else{
					callback(cachedDataTypes);
				}
			},

			lookupGroups:function(callback){
				serviceInstance.post('data/LookupGroup/search').then(function(result){
					callback(result.data.items);
				});
			},

			formTypes:function(callback){
				if(cachedFormTypes==null){
					serviceInstance.post('data/FormType/search').then(function(result){
						if(result.data){
							cachedFormTypes=result.data.items;
						}
						callback(cachedFormTypes);
					});
				}else{
					callback(cachedFormTypes);
				}
			},


			getData:function(entity,callback){
				serviceInstance.post('data/'+entity+'/search').then(function(result){
					var items =null;
					if(result.data){
						items=result.data.items;
					}
					callback(items);
				});
			},


			truncateDate:function(date){
				var result = date;
				try{
					result = date.substr(0,date.indexOf('T')+1)+'00:00:00.000Z';
				}catch(x){}
				return result;
			},

            list: function(methodName) {
                return $http.get(ConfigService.webServiceRoot+'objects/'+methodName,{
                    headers:{
                    }
                });
            },

            create: function(methodName,data) {
                var parameters = data ||{};
                return $http.post(ConfigService.webServiceRoot+'objects/'+methodName,parameters,{
                    headers:{
                    }
                });
            },

            update: function(methodName,id,data) {
                var parameters = data ||{};
                return $http.put(ConfigService.webServiceRoot+'objects/'+methodName+'/'+id,parameters,{
                    headers:{
                    }
                });
            },

            view: function(methodName,id) {
                return $http.get(ConfigService.webServiceRoot+'objects/'+methodName+'/'+id,{
                    headers:{
                    }
                });
            },

            delete: function(methodName,id) {
                return $http.delete(ConfigService.webServiceRoot+'objects/'+methodName+'/'+id,{
                    headers:{
                    }
                });
            }
		};

		return serviceInstance;
	}]
);
