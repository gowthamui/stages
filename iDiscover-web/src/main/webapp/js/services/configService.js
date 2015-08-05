myApp.factory( 'ConfigService',
	function() {
		var configType = 'test'
		var configOptions = {
            navbarTitle:'ResearchDoc',
			webServiceRoot:'ws/' ,
			clientDataPath:'clientData/'
		};

		if(configType=='test'){

		}else if(configType=='debug'){

		}else if(configType=='prod'){

		}

        configOptions.Constants={
            QUERY_TYPE_EDW_VALUE:2,
            QUERY_TYPE_EDW_LIST:3
        };

		return configOptions;
	}
);