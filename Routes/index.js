'use strict';
let web = require('./web/index');
let api = require('./api/index');
let all = [];

all = [].concat(web,api);
module.exports = all;
