$(document).ready(function(){
	if(document.getElementById("results-chart")){
		var ctx = document.getElementById("results-chart").getContext('2d');
		var uId = $('#results-chart').attr('data-uId');
		var pId = $('#results-chart').attr('data-pId');
		var backgroundColor = 'rgba(54, 162, 235, 0.8)';
		var borderColor = 'rgba(54, 162, 235, 1)';

		function displayChart(chartData) {
			var myChart = new Chart(ctx, {
				type: 'bar',
				data: {
						labels: chartData.labels,
						datasets: [{
								label: '# of Votes',
								data: chartData.data,
								backgroundColor: chartData.backgroundColor,
								borderColor: chartData.borderColor,
								borderWidth: 1
						}]
				},
				options: {
						scales: {
								yAxes: [{
										ticks: {
												beginAtZero:true,
												stepSize: 1
										}
								}]
						}
				}
			});
		}

		$.ajax({
							type: "GET",
							url: `http://localhost:3000/${uId}/polls/${pId}/results?format=json`,
							contentType: "application/json; charset=utf-8",
							async: true,   
							dataType: "json",
							success: function (data, textStatus, jqXHR) {
									var chartData = {'labels':[], 'data':[], 'backgroundColor': [], 'borderColor': []}
									data.forEach(function(element) {
										if(element.text){
											chartData.labels.push(element.text);
											chartData.data.push(element.votes);
											chartData.backgroundColor.push(backgroundColor);
											chartData.borderColor.push(borderColor);
										}
										
									});
									displayChart(chartData);
							},
							error: function (errorMessage) {
									console.log('There was an error trying to get data from the specified url.');
							}
					});
	}
});

