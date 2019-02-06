'use strict';

const dev_config = {
    mongo : {
        URI: process.env.MONGO_URI || 'mongodb://localhost/sampleChatApp',
        port: 27017
    }
};

const redis = {
    URI: '127.0.0.1',
    port: 6379
};

module.exports = {
    dev_config,
    redis
};
