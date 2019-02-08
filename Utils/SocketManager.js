'use strict';

const TokenManager = require('./TokenManager');

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
                if (socketIdsToSend[0]){
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

        socket.on('disconnect', function () {
            console.log('socket disconnected', this.id);
        });

        socket.on('chatMsgFromClient', function (data, callback) {
            if (!data.hasOwnProperty('token')) {
                return callback({type:'error', msg: 'Token is required!'});
            }
            if (!data.hasOwnProperty('receiver_id')) {
                return callback({type:'error', msg: 'Receiver Id is required!'});
            }
            if (!data.hasOwnProperty('chatMsg')) {
                return callback({type:'error', msg: 'Message Id is required!'});
            }
            TokenManager.decodeToken(data.token, function (err, decodedData) {
                if (!err && decodedData.id) {
                    //check receiver id and emit msg to him
                    let dataToSave = {
                        from_user_id: decodedData.id,
                        to_user_id: data.receiver_id,
                        chatTxt: data.chatMsg
                    };
                    process.emit('chatMsgReceived',dataToSave);
                    if (server.app.socketConnections.hasOwnProperty(data.receiver_id)
                        && server.app.socketConnections[data.receiver_id].socketIds) {
                        let dataToEmit = {
                            from_user_id: decodedData.id,
                            from_username : decodedData.username,
                            chatTxt: data.chatMsg
                        };
                        console.log('emitting>>>',dataToEmit)
                        emitToAuthorizedClients(data.receiver_id, 'incomingChatMsgForReceiver', dataToEmit);

                        callback({type:'success', msg: 'Successfully sent'})

                    } else {
                        callback({type: 'error', msg: 'Receiver Not Online'})
                    }
                } else {
                    socket.emit('disconnectFromServer', {message: 'Invalid Token', performAction: 'DISCONNECT'});
                }
            });
        });


        socket.emit('messageFromServer', {message: 'WELCOME TO SAMPLE CHAT APP', performAction: 'INFO'});

    });
};
