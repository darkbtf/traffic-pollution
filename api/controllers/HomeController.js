/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var async = require('async');

var sortByDate = function(a, b) {
	if (a.week != b.week) {
		return a.week - b.week;
	} else if (a.day != b.day) {
		return a.day - b.day;
	} else {
		return a.hour - b.hour;
	}
};

var weekdayStr2Int = function(s) {
	if (s === 'Mon') return 0;
	if (s === 'Tue') return 1;
	if (s === 'Wed') return 2;
	if (s === 'Thur') return 3;
	if (s === 'Fri') return 4;
	if (s === 'Sat') return 5;
	if (s === 'Sun') return 6;
};

var queryPollution = function(site) {
	return function(cb) {
		var queryStr = 'SELECT * FROM pollution_fact, time ' +
									'WHERE ' +
									'pollution_fact.site_name="中山" AND ' +
									'pollution_fact.time_key=time.time_key;';
		Pollution.query(queryStr, function(err, result) {
				//console.log(err, result);
				if (err || !result) cb('error');
				else cb(null, result);
		});
	};
};

var queryDistrictTraffic = function(district) {
	console.log(district);
	var queryStr = 'SELECT month, hour, day, `interval`, weekday, sum(total_volume) AS total_volume FROM ( ' +
									'SELECT location.district_start AS district_start, ' +
									'time.month AS month, ' +
									'time.hour AS hour, ' +
									'time.day AS day, ' +
									'time.interval AS `interval`, ' +
									'time.weekday AS weekday, ' +
									'avg(vd_fact.avg_speed) AS avg_speed, ' +
									'avg(vd_fact.avg_occ) AS avg_occ, ' +
									'avg(vd_fact.total_volume) AS total_volume, ' +
									'avg(vd_fact.moe_level) AS moe_level ' +
									'FROM location, time, vd_fact ' +
									'WHERE ' +
									'location.district_start="' + district + '" AND ' +
									'vd_fact.time_key=time.time_key AND  ' +
									'vd_fact.section_id=location.section_id  ' +
									'GROUP BY location.section_id, time.month, time.hour, time.day) tmp ' +
									'GROUP BY month, hour, day;';
	return function(cb) {
		VdDistrict.query(queryStr, function(err, result) {
			if (err || !result) cb('error');
			else {
				cb(null, result);
			}
		});
	};
};


var queryTraffic = function(traffic) {
	return function(cb) {
		var queryStr = 'SELECT location.section_name  AS section_name, ' +
  						     'time.month AS month, ' +
  						     'time.hour AS hour, ' +
  						     'time.day AS day, ' +
  						     'time.interval AS `interval`, ' +
  						     'time.weekday AS weekday,  ' +
  						     'avg(vd_fact.avg_speed) AS avg_speed, ' +
  						     'avg(vd_fact.avg_occ) AS avg_occ, ' +
  						     'avg(vd_fact.total_volume) AS total_volume, ' +
  						     'avg(vd_fact.moe_level) AS moe_level ' +
  						     'FROM location, time, vd_fact ' +
  						     'WHERE vd_fact.time_key=time.time_key AND ' +
  						     'vd_fact.section_id=location.section_id AND ' +
  						     'location.section_name="' + traffic + '" ' +
  						     'GROUP BY time.month, time.hour, time.day;';
		VD.query(queryStr, 
			function(err, result) {
				console.log(err, result);
				if (err || !result) cb('error');
				else {
					result.sort(sortByDate);
					cb(null, result);
				}
			});
	};
};

var killDuplicateSync = function(result) {
	var use = {};
	var pollutions = [],
	  	vds = [];
	var oldPollutions = result.pollutions,
			oldVds = result.vds;

	oldPollutions.sort(sortByDate);

	for (var i = 0; i < oldPollutions.length; ++i) {
		if (i > 0 && oldPollutions[i].hour == oldPollutions[i - 1].hour) continue;
		var pollution = oldPollutions[i];

		pollutions.push(pollution); 
		use[pollution.month + '-' + pollution.day + '-' + pollution.hour] = true;
	}

	oldVds.sort(sortByDate);
	for (var i = 0; i < oldVds.length; ++i) {
		var vd = oldVds[i];
		var dateString = vd.month + '-' + vd.day + '-' + vd.hour;
		if (use[dateString]) vds.push(vd);
	}
	
	return {
		pollutions: pollutions,
		vds: vds
	};
};

module.exports = {
	index: function(req, res) {
		res.view('homepage');
	},
	trafficPollution: function(req, res) {
		var site = req.body.site;
		var district = req.body.district;

		async.parallel([
			queryPollution(site),
			queryDistrictTraffic(district)
		], function(cb, results) {
			var result = {
				pollutions: results[0],
				vds: results[1]
			};
			res.json(killDuplicateSync(result));
		});
	},
	trafficCross: function(req, res) {
		var traffic1 = req.body.traffic1;
		var traffic2 = req.body.traffic2;

		async.parallel([
			queryTraffic(traffic1),
			queryTraffic(traffic2)
		], function(cb, results) {
			res.json({
				traffic1: results[0],
				traffic2: results[1]
			});
		});
	}
};

