/**
* VD.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	tableName: 'vd_fact',
  attributes: {
  	section_id: 'string',
  	section_name: 'string',
  	start_x: 'float',
  	start_y: 'float',
  	end_x: 'float',
  	end_y: 'float',
  	total_volume: 'float',
  	moe_level: 'float',
  	avg_speed: 'float',
  	avg_occ: 'float',
  	month: 'integer',
  	week: 'integer',
  	day: 'integer',
  	hour: 'integer',
  	weekday: 'integer'
  }
};

