'use strict';

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.msRTCPeerConnection;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;
window.RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate;

function hasUserMedia() {
  return !!(navigator.getUserMedia);
}

function hasRTCPeerConnection() {
  return !!(window.RTCPeerConnection);
}

DeVry.WebRTCController = function (socket) {
  if (!(this instanceof DeVry.WebRTCController)) {
    return new DeVry.WebRTCController();
  }
  this.video          = undefined;
  this.username       = undefined;
  this.callerId       = undefined;
  this.stream         = undefined;
  this.peerConnection = undefined;
  this.socket         = socket;
  this.iceServers     = [{ "url": "stun:127.0.0.1:9876" }];
  this.configuration  = { "iceServers": this.iceServers };
}

DeVry.WebRTCController.prototype.startScreenConnection = function(screenConstraints, video) {
  this.video = video;

  if (hasUserMedia() && hasRTCPeerConnection()) {
    navigator.getUserMedia(screenConstraints, this.successScreenCallback.bind(this), this.errorCallback.bind(this));
  } else {
    this.sendMessage(false, "Your browser does not support WebRTC.");
  }
}

DeVry.WebRTCController.prototype.successScreenCallback = function(stream) {
  var self = this;
  self.stream = stream;
  self.video.src = URL.createObjectURL(stream);
  stream.onended = function() {
    self.sendMessage(true, "Video ended.");
  };

  self.peerConnection = new RTCPeerConnection(self.configuration);

  self.peerConnection.onicecandidate = function(event) {
    if (event.candidate) {
      self.socket.send({
        type: "candidate",
        channel: "screen",
        candidate: event.candidate
      });
      self.sendMessage(true, "Sharing...");
    }
  }

  self.peerConnection.addStream(stream);

  self.peerConnection.createOffer(function(sessionDescription) {
    self.socket.send({
      type: "offer",
      channel: "screen",
      offer: sessionDescription
    });
    self.peerConnection.setLocalDescription(sessionDescription);
  }, function(error) {
    self.sendMessage(false, "Failed to create offer.");
  });
}

DeVry.WebRTCController.prototype.errorCallback = function(error) {
  this.sendMessage(false, "getUserMedia error: ", error);
}

DeVry.WebRTCController.prototype.closePeerConnection = function() {
  if (this.peerConnection != null) {
    this.peerConnection.close();
    this.peerConnection.onicecandidate = null;
    this.peerConnection.onaddstream = null;
  }
}

DeVry.WebRTCController.prototype.sendMessage = function (success, message) {
  var event = new CustomEvent(
    "webrtcMessageEvent",
    {
      detail: {
        success: success,
        message: message
      },
      bubbles: true,
      cancelable: true
    }
  );
  document.dispatchEvent(event);
}
