'use strict';

var DeVry = {};

DeVry.SocketEventHandler = {
  onOpen:       undefined,
  onError:      undefined,
  onCall:       undefined,
  onJoin:       undefined,
  onOffer:      undefined,
  onAnswer:     undefined,
  onCandidate:  undefined,
  onLeave:      undefined,
  showCalls:    undefined,
  onDefault:    undefined,

  onMessage: function(data) {
    switch(data.type) {
      case 'call':
        DeVry.SocketEventHandler.onCall(data);
        break;
      case 'join':
        DeVry.SocketEventHandler.onJoin(data);
        break;
      case 'offer':
        DeVry.SocketEventHandler.onOffer(data);
        break;
      case 'answer':
        DeVry.SocketEventHandler.onAnswer(data);
        break;
      case 'candidate':
        DeVry.SocketEventHandler.onCandidate(data);
        break;
      case 'leave':
        DeVry.SocketEventHandler.onLeave();
        break;
      case 'error':
        DeVry.SocketEventHandler.onError(data);
        break;
      case 'calls':
        DeVry.SocketEventHandler.showCalls(data);
        break;
      default:
        DeVry.SocketEventHandler.onDefault(data);
    }
  }
};

DeVry.SocketManager = {
  username: undefined,
  callerId: undefined,
  socket:   undefined,

  connect: function(url, callbackHandler) {
    var socket = new WebSocket(url);

    socket.onopen = function() {
      console.log("Signaling Server Connected.");
      //callback();
      callbackHandler.onOpen();
    };

    socket.onmessage = function(message) {
      console.log("Got message: ", message.data);

      var data = JSON.parse(message.data);

      if (data.type === 'call') {
        DeVry.SocketManager.callerId = data.callerId;
      }
      callbackHandler.onMessage(data);
    };

    socket.onerror = function(error) {
      console.log("Got error", error);
      callbackHandler.onError(error);
    };

    DeVry.SocketManager.socket = socket;
  },
  makeCall: function(username) {
    DeVry.SocketManager.send({
      type: "call",
      username: username,
    });

    DeVry.SocketManager.username = username;
  },
  joinCall: function(username, callerId) {
    DeVry.SocketManager.send({
      type: "join",
      username: username,
      callerId: callerId
    });

    DeVry.SocketManager.username = username;
    DeVry.SocketManager.callerId = callerId;
  },
  leaveCall: function(username, callerId) {
    DeVry.SocketManager.send({
      type: "leave",
      username: username,
      callerId: callerId
    });

    DeVry.SocketManager.username = '';
    DeVry.SocketManager.callerId = '';
  },
  send: function(message) {
    var username = DeVry.SocketManager.username;
    var callerId = DeVry.SocketManager.callerId;

    if (username !== undefined && username.length > 0) {
      message.username = DeVry.SocketManager.username;
    }
    if (callerId !== undefined && callerId.length > 0) {
      message.callerId = callerId;
    }
    DeVry.SocketManager.socket.send(JSON.stringify(message));
  }

};
