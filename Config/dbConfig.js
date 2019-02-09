'use strict';

const dev_config = {
    mongo : {
        URI: process.env.MONGO_URI || 'mongodb://localhost/sampleChatApp',
        port: 27017
    },
    redis : {
        URI: '127.0.0.1',
        port: 6379
    }
};

const production_config = {
    mongo : {
        URI: process.env.MONGO_URI,
        port: 27017
    },
    redis : {
        URI: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
};

module.exports = {
    dev_config,
    production_config
};
