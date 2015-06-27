
var status = 'done';

var site = [];
var forecast = [];
var checked = null;

$('.ui.dropdown').dropdown();
$('.ui.checkbox').checkbox();

var drawLineChart = function() { 
  // console.log(traffi);
  var pollutantName = $('input[name="pollutant"]:checked').val();
  var labels = forecast.map(function(entry) {
    return entry.week + ' 週 ' + entry.day + ' 日 ' + entry.hour + ' 時';
  });
  var forecast_filtered = [];
  for (var i = 0; i < forecast.length; ++i) {
    if (forecast[i].measure == pollutantName) forecast_filtered.push(forecast[i]);
  }
  var test = forecast_filtered.map(function(entry) {
    return entry.test_value;
  });
  var predict = forecast_filtered.map(function(entry) {
    return entry.predict_value;
  });

  $('#container').highcharts({
        chart: {
            zoomType: 'x'
        },
        title: {
            text: $('#site').dropdown('get value')[0] + '空污預測'
        },
        xAxis: [{
            categories: labels,
            crosshair: true
        }],
        yAxis: [{
            title: {
                text: 'ppm',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            opposite: true

        }, { // Secondary yAxis
            gridLineWidth: 0,
            title: {
                text: 'ppm',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            }

        }],
        tooltip: {
            shared: true
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            x: 80,
            verticalAlign: 'top',
            y: 55,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        series: [{
            name: '實際值',
            type: 'line',
            yAxis: 0,
            data: test

        }, {
            name: '預測值',
            type: 'line',
            yAxis: 0,
            data: predict
        }]
    });
};

var queryTraffic = function() {
	if (status == 'loading') return;
	if (status == 'done') {
		status = 'loading';
		$('.ui.dimmer').addClass('active');
	}

	var site = $('#site').dropdown('get value')[0];

	$.post('/pollutionForecastData', { site: site }, function(rawData) {
	  forecast = rawData.forecast;
	  drawLineChart();
	  $('.ui.dimmer').removeClass('active');
	  status = 'done';
	});
};

$('#query-button').on('click', queryTraffic);
$('input[name="pollutant"]').on('change', drawLineChart);
