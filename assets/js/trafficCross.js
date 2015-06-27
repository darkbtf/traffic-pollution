
var status = 'done';

var road1 = '';
var road2 = '';
var traffic1 = [];
var traffic2 = [];
var checked = null;

$('.ui.dropdown').dropdown();
$('.ui.checkbox').checkbox();

var drawLineChart = function() {
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
            text: road1 + ' 車流量 vs ' + road2 + ' 車流量'
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
                text: road1 + ' 車流量',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            opposite: true

        }, { // Secondary yAxis
           labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            title: {
                text: road2 + ' 車流量',
                style: {
                    color: Highcharts.getOptions().colors[1]
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
            name: road1 + ' 車流量',
            type: 'line',
            yAxis: 1,
            data: volume1

        }, {
            name: road2 + ' 車流量',
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

	road1 = $('#traffic1').dropdown('get value')[0];
	road2 = $('#traffic2').dropdown('get value')[0];

	$.post('/trafficCrossData', { traffic1: road1, traffic2: road2 }, function(rawData) {
	  traffic1 = rawData.traffic1;
	  traffic2 = rawData.traffic2;
	  drawLineChart();

	  $('.ui.dimmer').removeClass('active');
	  status = 'done';
	});
};

$('#query-button').on('click', queryTraffic);
