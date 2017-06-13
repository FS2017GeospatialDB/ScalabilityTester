var app = (function() {

	/* Private Variables */
	var endpoint = null;

	/* Private Methods */
	function fireRegionQuery(west, east, south, north) {
		var transport = new Thrift.TXHRTransport(endpoint);
		var protocol = new Thrift.TJSONProtocol(transport);
		var client = new GeolocationServiceClient(protocol);
		var start = performance.now();

		client.getFeatures(west, east, south, north, Date.now(), function(features) {
			var delta = performance.now() - start;
			var bytes = JSON.stringify(features).length;

			var line = document.createElement('li');
			line.classList.add('list-group-item');
			line.innerText = bytes + ' bytes in ' + delta + ' ms, .... about ' + (bytes/delta) + ' bps.';
			
			var list = document.getElementById('resultList');
			list.appendChild(line);
		});
	}

	function firePointQuery(latitude, longitude) {
		var transport = new Thrift.TXHRTransport("http://localhost:8000/service");
		var protocol = new Thrift.TJSONProtocol(transport);
		var client = new GeolocationServiceClient(protocol);
		var start = performance.now();

		client.getCell(latitude, longitude, Date.now(), function(cell) {
			var delta = performance.now() - start;
			var bytes = JSON.stringify(features).length;
						
			var line = document.createElement('li');
			line.classList.add('list-group-item');
			line.innerText = bytes + ' bytes in ' + delta + ' ms, .... about ' + (bytes/delta) + ' bps.';			

			var list = document.getElementById('resultList');
			list.appendChild(line);
		});
	}

	/* Public Methods */
	function validateEndpoint(inputId) {
		// Clear User Feedback on Endpoint URL
		inputId = document.getElementById('endpointInput');
		inputId.parentNode.classList.remove('has-success', 'has-error');

		try {
			// Test Connection
			var url = inputId.value;
			var transport = new Thrift.TXHRTransport(url);
			var protocol = new Thrift.TJSONProtocol(transport);
			var client = new GeolocationServiceClient(protocol);
			client.getCell(0,0,0,null,function(){});

			// Success!
			endpoint = url;
			inputId.parentNode.classList.add('has-success');
			document.getElementById('apiSelect').style.display = "";
			document.getElementById('queryParameterForm').style.display = "";
			document.getElementById('resultsForm').style.display = "";
			
		} catch (e) {
			// Failure
			inputId.parentNode.classList.add('has-error');
			document.getElementById('apiSelect').style.display = "None";
			document.getElementById('queryParameterForm').style.display = "None";
			document.getElementById('resultsForm').style.display = "None";
		}
	}

	function changeAPI() {
		var regionQuery = document.getElementById('regionQueryForm');
		var pointQuery = document.getElementById('pointQueryForm');
		var option = document.getElementById('apiSelectDropdown').value;

		if (option === 'regionQuery') {
			regionQuery.style.display = "";
			pointQuery.style.display = "None";
		} else {
			regionQuery.style.display = "None";
			pointQuery.style.display = "";
		}
	}

	function fireQuery() {
		var option = document.getElementById('apiSelectDropdown').value;
		if (option === 'regionQuery') {
			fireRegionQuery(
				document.getElementById('leftBound').value,
				document.getElementById('rightBound').value,
				document.getElementById('bottomBound').value,
				document.getElementById('topBound').value);
		} else {
			firePointQuery(
				document.getElementById('latitude').value,
				document.getElementById('longitude').value);
		}
	}

	return {
		validateEndpoint: validateEndpoint,
		changeAPI		: changeAPI,
		fireQuery		: fireQuery
	};
})();