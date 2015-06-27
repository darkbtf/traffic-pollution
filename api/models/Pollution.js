/**
* Pollution.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	position: 'string',
  	PSI: 'integer',
  	MajorPollutant: 'string',
  	Status: 'string',
  	SO2: 'float',
  	CO: 'float',
  	O3: 'float',
  	PM10: 'float',
  	PM25: 'float',
  	NO2: 'float',
  	WindSpeed: 'float',
  	WindDirec: 'float',
  	FPMI: 'integer',
  	PublishTime: 'datetime',
  	day: 'integer',
  	weekday: 'string',
  	week: 'integer',
  	month: 'integer',
  	day: 'integer',
  	hour: 'integer'
  }
};

