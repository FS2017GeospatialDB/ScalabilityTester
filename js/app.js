var app = (function() {

	/* Private Variables */
	var endpoint = null;
	var speeds = [];
	var plotData = [];
	var plotLayout = {
  		title: 'Load vs. Output',
  		showlegend: false,
  		xaxis: {
    		title: 'Clients / Second',
    	},
    	yaxis: {
    		title: 'Output (kBPS)'
    	}
	};

	/* Private Methods */
	function fireRegionQuery(west, east, south, north, rate, times) {
		var transport = new Thrift.TXHRTransport(endpoint);
		var protocol = new Thrift.TJSONProtocol(transport);
		var client = new GeolocationServiceClient(protocol);
		var start = performance.now();

		(function(start) {
			client.getFeatures(west, east, south, north, Date.now(), function(features) {
				var delta = performance.now() - start;
				var bytes = JSON.stringify(features).length;
				var speed = (bytes/delta);

				var row = document.createElement('tr');
				var rtt_td = document.createElement('td'); rtt_td.innerText = delta.toFixed(4);
				var len_td = document.createElement('td'); len_td.innerText = bytes;
				var speed_td = document.createElement('td'); speed_td.innerText = speed.toFixed(4);
				row.appendChild(rtt_td); row.appendChild(len_td); row.appendChild(speed_td);
				
				var tbody = document.getElementById('resultList');
				tbody.appendChild(row);

				speeds.push(speed);
				if (speeds.length == times)
					plotPoint(rate, speeds);
			});
		})(start);
	}

	function firePointQuery(latitude, longitude, rate, times) {
		var transport = new Thrift.TXHRTransport("http://localhost:8000/service");
		var protocol = new Thrift.TJSONProtocol(transport);
		var client = new GeolocationServiceClient(protocol);
		var start = performance.now();

		(function(start) {
			client.getCell(latitude, longitude, Date.now(), function(cell) {
				var delta = performance.now() - start;
				var bytes = JSON.stringify(cell).length;
				var speed = (bytes/delta);

				var row = document.createElement('tr');
				var rtt_td = document.createElement('td'); rtt_td.innerText = delta.toFixed(4);
				var len_td = document.createElement('td'); len_td.innerText = bytes;
				var speed_td = document.createElement('td'); speed_td.innerText = speed.toFixed(4);
				row.appendChild(rtt_td); row.appendChild(len_td); row.appendChild(speed_td);
				
				var tbody = document.getElementById('resultList');
				tbody.appendChild(row);

				speeds.push(speed);
				if (speeds.length == times)
					plotPoint(rate, speeds);
			});
		})(start);
	}

	function plotPoint(rate, speeds) {
		console.log("Received Point: " + rate + ", " + speeds);
		rates = new Array(speeds.length); rates.fill(rate);

		plotData.push({
			x: rates,
			y: speeds,
			mode: 'markers',
			type: 'scatter'
		});
		Plotly.newPlot('scalabilityPlotDiv', plotData, plotLayout);
	}

	function validateEndpoint(inputId) {
		// Clear User Feedback on Endpoint URL
		inputId = document.getElementById('endpointInput');
		inputId.parentNode.classList.remove('has-success', 'has-error');

		// Test Connection
		var url = inputId.value;
		var transport = new Thrift.TXHRTransport(url);
		var protocol = new Thrift.TJSONProtocol(transport);
		var client = new GeolocationServiceClient(protocol);
		client.getCell(0,0,0,function(cell) {

			if (Array.isArray(cell)) {
				// Success!
				endpoint = url;
				inputId.parentNode.classList.add('has-success');
				document.getElementById('apiSelect').style.display = "";
				document.getElementById('queryParameterForm').style.display = "";
				document.getElementById('resultsForm').style.display = "";
				document.getElementById('scalabilityPlot').style.display = "";
			} else {

				// Failure
				inputId.parentNode.classList.add('has-error');
				document.getElementById('apiSelect').style.display = "None";
				document.getElementById('queryParameterForm').style.display = "None";
				document.getElementById('resultsForm').style.display = "None";
				document.getElementById('scalabilityPlot').style.display = "None";
				console.log("Stacktrace: " + cell);
			}
		});
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
		// Reset Document before Query
		document.getElementById('resultList').innerHTML = '';
		speeds = [];

		var option = document.getElementById('apiSelectDropdown').value;
		if (option === 'regionQuery') {

			(function loop(left, right, bottom, top, rate, times, timesLeft){
			   setTimeout(function() {
			      if (timesLeft === 0) return;

			      fireRegionQuery(left, right, bottom, top, rate, times);
			      loop(left, right, bottom, top, rate, times, timesLeft-1);
			  }, 1000 / rate);
			})(
				document.getElementById('leftBound').value,
				document.getElementById('rightBound').value,
				document.getElementById('bottomBound').value,
				document.getElementById('topBound').value,
				document.getElementById('rate').value,
				document.getElementById('repeat').value,
				document.getElementById('repeat').value
			);
		} else {

			(function loop(latitude, longitude, rate, times, timesLeft){
			   setTimeout(function() {
			      if (timesLeft === 0) return;

			      fireRegionQuery(latitude, longitude, rate, times);
			      loop(latitude, longitude, rate, times, timesLeft-1);
			  }, 1000 / rate);
			})(
				document.getElementById('latitude').value,
				document.getElementById('longitude').value,
				document.getElementById('rate').value,
				document.getElementById('repeat').value,
				document.getElementById('repeat').value
			);
		}
	}

	/* Initialize Page Listeners */
	document.addEventListener('DOMContentLoaded', function() {
		document.getElementById('validateEndpoint').addEventListener('click', validateEndpoint);
		document.getElementById('apiSelect').addEventListener('change', changeAPI);
		document.getElementById('fireQuery').addEventListener('click', fireQuery);
	});
})();