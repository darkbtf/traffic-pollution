
var status = 'done';

var site = [];
var forecast = [];
var checked = null;

$('.ui.dropdown').dropdown();
$('.ui.checkbox').checkbox();

var drawLineChart = function() { 
  // console.log(traffi);
  var labels = traffic1.map(function(entry) {
    return entry.week + ' 週 ' + entry.day + ' 日 ' + entry.hour + ' 時';
  });
  var volume1 = traffic1.map(function(entry) {
    return entry.total_volume;
  });
  var volume2 = traffic2.map(function(entry) {
    return entry.total_volume;
  });

  $('#container').highcharts({
        chart: {
            zoomType: 'x'
        },
        title: {
            text: $('#site').dropdown('get value')[0] + '監測站 vs ' + $('#district').dropdown('get value')[0] + '車流量'
        },
        xAxis: [{
            categories: labels,
            crosshair: true
        }],
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            title: {
                text: '車流量',
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
            name: 'QQ',
            type: 'line',
            yAxis: 1,
            data: volume1

        }, {
            name: '車流量',
            type: 'line',
            yAxis: 0,
            data: volume2
        }]
    });
};

var queryTraffic = function() {
	if (status == 'loading') return;
	if (status == 'done') {
		status = 'loading';
		$('.ui.dimmer').addClass('active');
	}

	var site = $('#site').dropdown('get value');

	$.post('/pollutionForecastData', { site: site }, function(rawData) {
	  traffic1 = rawData.traffic1;
	  traffic2 = rawData.traffic2;
	  drawLineChart();

	  $('.ui.dimmer').removeClass('active');
	  status = 'done';
	});
};

$('#query-button').on('click', queryTraffic);
