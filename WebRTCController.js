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

var WebRTCController = {
  localVideo           : undefined,
  username             : undefined,
  callerId             : undefined,
  screenStream         : undefined,
  peerConnection       : undefined,
  iceServers           : [{ "url": "stun:127.0.0.1:9876" }],
  configuration        : { "iceServers": this.iceServers }
}

WebRTCController.startScreenConnection = function(screenConstraints, localVideo) {
  WebRTCController.localVideo = localVideo;

  if (hasUserMedia() && hasRTCPeerConnection()) {
    navigator.getUserMedia(screenConstraints, this.successScreenCallback, this.errorCallback);
  } else {
    alert("Your browser does not support WebRTC.")
  }
}

WebRTCController.successScreenCallback = function(stream) {

  WebRTCController.screenStream = stream;
  WebRTCController.localVideo.src = URL.createObjectURL(stream);
  stream.onended = function() { console.log('Ended'); };

  var peerConnection = new RTCPeerConnection(WebRTCController.configuration);
  WebRTCController.peerConnection = peerConnection;

  peerConnection.onicecandidate = function(event) {
    if (event.candidate) {
      DeVry.SocketManager.send({
        type: "candidate",
        channel: "screen",
        candidate: event.candidate
      });
      updateMessage('Sharing...');
    }
  }

  peerConnection.addStream(stream);

  peerConnection.createOffer(function(sessionDescription) {
    DeVry.SocketManager.send({
      type: "offer",
      channel: "screen",
      offer: sessionDescription
    });
    WebRTCController.peerConnection.setLocalDescription(sessionDescription);
  }, function(error) {
    console.log("Failed to create offer.");
  });

}

WebRTCController.errorCallback = function(error) {
  console.log("getUserMedia error: ", error);
}

WebRTCController.closePeerConnection = function() {
  if (WebRTCController.peerConnection != null) {
    WebRTCController.peerConnection.close();
    WebRTCController.peerConnection.onicecandidate = null;
    WebRTCController.peerConnection.onaddstream = null;
  }
}
