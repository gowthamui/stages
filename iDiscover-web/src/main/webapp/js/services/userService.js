myApp.factory( 'UserService',['$cookieStore','$cookies','$browser',
	function($cookieStore,$cookies,$browser) {
		var result = $cookieStore.get('user') || {};
		if($cookies.currentUser){
			result.userId=$cookies.currentUser;
		}else{
			result.userId=$cookies.tam_junction_simulation_user;
		}
		result.save=function(){
			$cookieStore.put('user',result);
		};

		result.logout=function(){
			var cookiesToRemove = ['user','tam_junction_simulation_user','AM-DSESS-DEV-SECURE-SESSION-ID','AM-DSESS-DEV-SESSION-ID','AM-DSESS-SECURE-SESSION-ID','AM-DSESS-SESSION-ID','currentUser'] ;
			angular.forEach(cookiesToRemove,function(item){
				document.cookie = item+'=xxxxxx; expires=Fri, 3 Aug 2003 20:47:11 UTC;';
			});
		}
		return result;
	}]
);