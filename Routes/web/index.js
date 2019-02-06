'use strict';

const rootHandler = (request, h) => {

    let current_title = 'Sample Chat App';

    //Regular EJS
    return h.view('index', {
        app_env: process.env.NODE_ENV,
        current_title: current_title
    });
};

let webRoutesArray = [];

webRoutesArray.push(
    {
        method: 'GET', path: '/',
        options: {
            handler: rootHandler
        }
    },
    {
        method: 'GET', path: '/chat',
        options: {
            handler: rootHandler
        }
    }
)

module.exports = webRoutesArray;
