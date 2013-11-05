function SearchCtrl($scope, $http) {

	$scope.$on("ty:Selected", function(event, name) {
		$scope.selectedResult = JSON.stringify(event.targetScope.suggestion, null, "\t");
	});

	$http.defaults.headers.common['Accept'] = "application/vnd.github.preview";
	var queryPromise, lastQuery;

	$scope.$on("ty:Query", function(event, name, query) {
		var queryTime = lastQuery = new Date().getTime();
		queryPromise = $http.get("https://api.github.com/search/repositories?q=" + query + "&sort=stars&order=desc").success(function(data) {
			if( queryTime == lastQuery )
				event.targetScope.suggestions = data.items;
		});
		//console.info(queryPromise);
	});
}