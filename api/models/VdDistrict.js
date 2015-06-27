/**
* VdDistrict.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	tableName: 'vd_district',
  attributes: {
  	hour: 'integer',
  	weekday: 'string',
  	month: 'integer',
  	day: 'integer',
  	week: 'integer',
  	district: 'string',
  	volume: 'integer'
  }
};

