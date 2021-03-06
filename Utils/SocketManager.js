'use strict';

const TokenManager = require('./TokenManager');
const async = require('async');

exports.connectSocket = function (server) {
    console.log('Initializing Socket Server')
    if (!server.app) {
        server.app = {}
    }
    server.app.socketConnections = {};
    let socket = require('socket.io').listen(server.listener);

    function getConnectedList() {
        let list = [];

        for (let client in socket.sockets.connected) {
            list.push(client)
        }
        return list
    }

    function emitToAuthorizedClients(userId, event, emitData) {
        if (server.app.socketConnections && server.app.socketConnections.hasOwnProperty(userId)) {
            let socketIdsToSend = server.app.socketConnections[userId].socketIds;
            if (socketIdsToSend && socketIdsToSend.length > 1) {
                socketIdsToSend.forEach(function (socketIdToSend) {
                    socket.to(socketIdToSend).emit(event, emitData);
                })
            } else {
                if (socketIdsToSend[0]) {
                    socket.to(socketIdsToSend[0]).emit(event, emitData);
                }
            }
        }
    }

    socket.on('connection', function (socket) {

        socket.on('clientAuth', function (data) {
            //Update SocketConnections
            if (data && data.token) {
                TokenManager.decodeToken(data.token, function (err, decodedData) {
                    if (!err && decodedData.id) {
                        if (server.app.socketConnections.hasOwnProperty(decodedData.id)) {
                            server.app.socketConnections[decodedData.id].socketIds.push(socket.id);
                            socket.emit('messageFromServer', {message: 'Socket id Updated', performAction: 'INFO'});
                        } else {
                            server.app.socketConnections[decodedData.id] = {
                                socketIds: [socket.id]
                            };
                            socket.emit('messageFromServer', {
                                message: 'Added To socketConnections',
                                performAction: 'INFO'
                            });
                        }
                    } else {
                        socket.emit('disconnectFromServer', {message: 'Invalid Token', performAction: 'DISCONNECT'});
                    }
                })
            } else {
                socket.emit('disconnectFromServer', {message: 'Invalid Token', performAction: 'DISCONNECT'});
            }
        });

        socket.on('pageFocusEvent', function (data) {
            if (data && data.token) {
                TokenManager.decodeToken(data.token, function (err, decodedData) {
                    if (!err && decodedData.id) {
                        if (server.app.socketConnections.hasOwnProperty(decodedData.id)) {
                            server.app.socketConnections[decodedData.id].isTabActive = data.isTabActive;
                        }
                    }
                })
            }
        });


        socket.on('chatMsgFromClient', function (data, callback) {
            if (!data.hasOwnProperty('token')) {
                return callback({type: 'error', msg: 'Token is required!'});
            }
            if (!data.hasOwnProperty('receiver_id')) {
                return callback({type: 'error', msg: 'Receiver Id is required!'});
            }
            if (!data.hasOwnProperty('chatMsg')) {
                return callback({type: 'error', msg: 'Message Id is required!'});
            }
            TokenManager.decodeToken(data.token, function (err, decodedData) {
                if (!err && decodedData.id) {
                    //check receiver id and emit msg to him
                    let dataToSave = {
                        from_user_id: decodedData.id,
                        to_user_id: data.receiver_id,
                        chatTxt: data.chatMsg,
                        webPush : decodedData.username + ': ' + data.chatMsg
                    };
                    process.emit('chatMsgReceived', dataToSave);
                    //check if receiver is online or not

                    if (server.app.socketConnections.hasOwnProperty(data.receiver_id)
                        && server.app.socketConnections[data.receiver_id].socketIds) {
                        let dataToEmit = {
                            from_user_id: decodedData.id,
                            from_username: decodedData.username,
                            chatTxt: data.chatMsg
                        };
                        emitToAuthorizedClients(data.receiver_id, 'incomingChatMsgForReceiver', dataToEmit);
                        if (!!server.app.socketConnections[data.receiver_id].isTabActive){
                            // already focused no need to send web push
                        }else {
                            process.emit('sendWebPush',dataToSave)
                        }

                        callback({type: 'success', msg: 'Successfully sent'})

                    } else {
                        callback({type: 'error', msg: 'Receiver Not Online'});
                        process.emit('sendWebPush',dataToSave)
                    }
                } else {
                    socket.emit('disconnectFromServer', {message: 'Invalid Token', performAction: 'DISCONNECT'});
                }
            });
        });

        socket.emit('messageFromServer', {message: 'WELCOME TO SAMPLE CHAT APP', performAction: 'INFO'});

    });
};
