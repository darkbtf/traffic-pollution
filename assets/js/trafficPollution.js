
var status = 'done';

var raw_pollutions = [];
var raw_vds = [];
var checked = null;

var pollution_stats = ['psi', 'so2', 'co', 'o3', 'no2', 'pm10', 'pm25'];
var vd_stats = ['avg_speed', 'avg_occ', 'total_volume', 'moe_level'];

$('.ui.dropdown').dropdown();
$('.ui.checkbox').checkbox();

var changeScale = function(data, stats, column) {
  var result = [];
  for (var i = 0; i < data.length; ++i) { 
    if (i == 0 || data[i][column] != data[i - 1][column]) {
      result.push(Object.create(data[i]));
    } else {
      for (var j = 0; j < stats.length; ++j) {
        result[result.length - 1][stats[j]] += data[i][stats[j]];
      }
    }
  }
  return result;
};

var sumByProp = function(data, stats, column) {
  var result = [];
  var index = {};
  for (var i = 0; i < data.length; ++i) {
    var value = data[i][column]; 
    if (index[value] == undefined) {
      index[value] = result.length;
      result.push(Object.create(data[i]));
    } else {
      var idx = index[value];
      for (var j = 0; j < stats.length; ++j) {
        result[idx][stats[j]] += data[i][stats[j]];
      }
    }
  }
  return result;
};

var drawLineChart = function() {
  var pollutantName = $('input[name="pollutant"]:checked').val();
  var chartType = $('input[name="chart"]:checked').val();
  var chartStyle = 'line';

  var pollutions = [];
  var vds = [];
  var labels = [];

  if (chartType == 'hour') {
    pollutions = raw_pollutions;
    vds = raw_vds;
    labels = pollutions.map(function(entry) {
      return entry.week + ' 週 ' + entry.day + ' 日 ' + entry.hour + ' 時';
    });
  } else if (chartType == 'interval') {
    pollutions = changeScale(raw_pollutions, pollution_stats, 'interval');
    vds = changeScale(raw_vds, vd_stats, 'interval');
    console.log(vds, raw_vds);
    labels = pollutions.map(function(entry) {
      return entry.week + ' 週 ' + entry.day + ' 日 ' + entry.interval + ' 時';
    });
  } else if (chartType == 'day') {
    pollutions = changeScale(raw_pollutions, pollution_stats, 'day');
    vds = changeScale(raw_vds, vd_stats, 'day');
    labels = pollutions.map(function(entry) {
      return entry.week + ' 週 ' + entry.day + ' 日 ';
    });
  } else if (chartType == 'shour') {
    chartStyle = 'column';
    pollutions = sumByProp(raw_pollutions, pollution_stats, 'hour');
    vds = sumByProp(raw_vds, vd_stats, 'hour');
    labels = pollutions.map(function(entry) {
      return entry.hour + ' 時';
    });
  } else if (chartType == 'sinterval') {
    chartStyle = 'column';
    pollutions = sumByProp(raw_pollutions, pollution_stats, 'interval');
    vds = sumByProp(raw_vds, vd_stats, 'interval');
    labels = pollutions.map(function(entry) {
      return entry.interval + ' 時';
    });
    
  } else if (chartType == 'weekday') {
    chartStyle = 'column';
    pollutions = sumByProp(raw_pollutions, pollution_stats, 'weekday');
    vds = sumByProp(raw_vds, vd_stats, 'weekday');
    labels = pollutions.map(function(entry) {
      return entry.weekday;
    });
  }

  var pollutant = pollutions.map(function(entry) {
    var tmp = entry[pollutantName];
    if (typeof tmp == 'string') tmp = parseFloat(tmp);
    return tmp;
  });
  var volume = vds.map(function(entry) {
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
            name: pollutantName,
            type: chartStyle,
            yAxis: 1,
            data: pollutant

        }, {
            name: '車流量',
            type: chartStyle,
            yAxis: 0,
            data: volume
        }]
    });
};

var queryTrafficPollution = function() {
	if (status == 'loading') return;
	if (status == 'done') {
		status = 'loading';
		$('.ui.dimmer').addClass('active');
	}

	var site = $('#site').dropdown('get value')[0];
	var district = $('#district').dropdown('get value')[0];

	$.post('/trafficPollutionData', { site: site, district: district}, function(rawData) {
	  raw_pollutions = rawData.pollutions;
	  raw_vds = rawData.vds;
    for (var i = 0; i < raw_pollutions.length; ++i)
      if (typeof raw_pollutions[i].psi == 'string')
        raw_pollutions[i].psi = parseFloat(raw_pollutions[i].psi);
	  drawLineChart();

	  $('.ui.dimmer').removeClass('active');
	  status = 'done';
	});
};

$('input[name="pollutant"]').on('change', drawLineChart);
$('input[name="chart"]').on('change', drawLineChart);
$('#query-button').on('click', queryTrafficPollution);
