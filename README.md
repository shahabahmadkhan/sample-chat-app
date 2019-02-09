# Sample Chat App By Shahab

## Tech Stack

* Node v9.5.0 or higher + NPM
* Mongo v3.4.9 or higher
* Redis v4.0 or higher
* Bower v1.8.8

##Pre-requisite
1) Make sure you have everything written above installed on your server/pc
2) Make sure no other service is running on port 3000 // You can change this in appConstants 

## How to run
1) ``` cd sample-chat-app && npm install  ```
2) ``` node server.js``` or  ``` nodemon```

##Basic Info Regarding Project
1) Three users are pre-bootstrapped in the database as soon as the application is run, the users & password can be found in Utils/BootstrapData.js file.
2) After entering username and password on login/home screen, the user is redirected to /chat page.
3) Since there's no data in the database, So you have to open a new chat using @username in the chat input field.
4) If the corresponding user is logged into from another browser/device, then the message will be delivered to him.
5) If he is not logged in, then the app will check if the receiver has subscribed to push notification or not, If subscribed then a push notification will be sent to him.
6) If the receiver is logged in but on a different page then also push notification will be sent to gather his attention.
7) User chat list is fetched upon clicking the name on the recent user list on left sidebar. 
8) This chat supports only 1 to 1 chatting, You cannot being a group chat (Can be added later if required)
9) This uses JWT token authentication so if we create a iOS app or Android app, it will be running smoothly over there.
10) This application is deployed to https://sample-chat-app-shahab.herokuapp.com
11) The swagger-api documention can be found at http://localhost:3000/documentation
12) Make sure to use 'Bearer your-access-token' in the authorization header to fetch resources. (Token is generated upon successful login)
