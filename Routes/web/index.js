'use strict';

const rootHandler = (request, h) => {

    let current_title = 'Sample Chat App';

    //Regular EJS
    return h.view('index', {
        app_env: process.env.NODE_ENV,
        current_title: current_title
    });
};
let webURLs = ['','chat'];

let webRoutesArray = [];

webURLs.forEach(function(url){
    webRoutesArray.push(
        { method: 'GET', path: '/'+url,
            options: {
                handler: rootHandler
            }
        }
    )
})

module.exports = webRoutesArray;
