'use strict';

var DeVry = DeVry || {};

DeVry.SocketEventHandler = function (webRTCController, callbacks) {
  if (!(this instanceof DeVry.SocketEventHandler)) {
    return new DeVry.SocketEventHandler(webRTCController, callbacks);
  }
  if (typeof webRTCController === 'undefined' || typeof callbacks === 'undefined' ) {
    return;
  }
  this.webRTCController = webRTCController;
  this.onOpen           = callbacks.onOpen || function() {};
  this.onCall           = callbacks.onCall || function() {};
  this.onJoin           = callbacks.onJoin || function() {};
  this.onOffer          = callbacks.onOffer || function() {};
  this.onError          = callbacks.onError || function() {};
  this.onLeave          = function(data) {
    callbacks.onLeave(data);
  };
  this.showCalls        = callbacks.showCalls || function() {};
  this.onDefault        = callbacks.onDefault || function() {};
  this.onAnswer         = function(data) {
    this.webRTCController.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  };
  this.onCandidate      = function(data) {
    this.webRTCController.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
  };
}

DeVry.SocketEventHandler.prototype.onMessage = function(data) {
    switch(data.type) {
      case 'call':
        this.onCall(data);
        break;
      case 'join':
        this.onJoin(data);
        break;
      case 'offer':
        this.onOffer(data);
        break;
      case 'answer':
        this.onAnswer(data);
        break;
      case 'candidate':
        this.onCandidate(data);
        break;
      case 'leave':
        this.onLeave(data);
        break;
      case 'error':
        this.onError(data);
        break;
      case 'calls':
        this.showCalls(data);
        break;
      default:
        this.onDefault(data);
    }
}

DeVry.SocketManager = function () {
  if (!(this instanceof DeVry.SocketManager)) {
    return new DeVry.SocketManager();
  }

  this.username = undefined;
  this.callerId = undefined;
  this.socket   = undefined;
}

DeVry.SocketManager.prototype.connect = function(url, controller, myCallbacks) {

  var callbackHandler = new DeVry.SocketEventHandler(controller, myCallbacks);

  this.socket = new WebSocket(url);

  this.socket.onopen = function() {
    console.log("Signaling Server Connected.");
    //callback();
    callbackHandler.onOpen();
  };

  this.socket.onmessage = function(message) {
    console.log("Got message: ", message.data);

    var data = JSON.parse(message.data);

    if (data.type === 'call') {
      DeVry.SocketManager.callerId = data.callerId;
    }
    else if (data.type === 'leave') {
      DeVry.SocketManager.callerId = null;
    }
    callbackHandler.onMessage(data);
  };

  this.socket.onerror = function(error) {
    callbackHandler.onError("Failed when communicating with WebSocket server.");
  };
}

DeVry.SocketManager.prototype.makeCall = function(username) {
  this.send({
    type: "call",
    username: username,
  });

  this.username = username;
}

DeVry.SocketManager.prototype.getCallerIDs = function(username) {
  this.send({
    type: "calls",
    username: username,
  });
}

DeVry.SocketManager.prototype.joinCall = function(username, callerId) {
  this.send({
    type: "join",
    username: username,
    callerId: callerId
  });

  this.username = username;
  this.callerId = callerId;
}

DeVry.SocketManager.prototype.leaveCall = function(username, callerId) {
  this.send({
    type: "leave",
    username: username,
    callerId: callerId
  });

  this.username = '';
  this.callerId = '';
}

DeVry.SocketManager.prototype.send = function(message) {
  var username = this.username;
  var callerId = this.callerId;

  if (username !== undefined && username.length > 0) {
    message.username = username;
  }
  if (callerId !== undefined && callerId.length > 0) {
    message.callerId = callerId;
  }
  this.socket.send(JSON.stringify(message));
}
