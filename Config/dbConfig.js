'use strict';

const dev_config = {
    mongo : {
        URI: process.env.MONGODB_URI || 'mongodb://localhost/sampleChatApp',
        port: 27017
    },
    redis : {
        URI: '127.0.0.1',
        port: 6379
    }
};

const production_config = {
    mongo : {
        URI: process.env.MONGODB_URI,
        port: 27017
    },
    redis : {
        URI: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT || 9974 //9974 is redistogo port
    }
};

module.exports = {
    dev_config,
    production_config
};
