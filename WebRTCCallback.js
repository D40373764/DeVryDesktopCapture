'use strict';

DeVry.SocketEventHandler.onOpen = function() {
  //DeVry.SocketManager.send({type:'calls'});
}

DeVry.SocketEventHandler.onError = function(error) {
  var layerMessage = new Layer({
    name: 'error',
    shadowX: 10,
    shadowY: 10,
    html: 'Failed to connect to the server'
  });
  layerMessage.center();
  layerMessage.bringToFront()
}

DeVry.SocketEventHandler.onCall = function(data) {}

DeVry.SocketEventHandler.onJoin = function(data) {
  if (data.success === false) {
    alert("Login unsuccessful, please try a different name.");
  } else {
    updateMessage("Join successful.");
  }
}

DeVry.SocketEventHandler.onOffer = function(data) {}

DeVry.SocketEventHandler.onAnswer = function(data) {
  WebRTCController.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
}

DeVry.SocketEventHandler.onCandidate = function(data) {
  WebRTCController.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
}

DeVry.SocketEventHandler.onLeave = function(data) {
}

DeVry.SocketEventHandler.showCalls = function(data) {
  console.log(data);
  $('.call-list').empty();
  updateMessage(data.value.length + ' call');

  for (var i in data.value) {
    $('.call-list').append("<a href='#' class='list-group-item' title='Join this call' data-callerid='" + data.value[i] + "'>" + data.value[i] + "<span class='badge'>Join</span></a>");
  }
  $('.call-list a').on('click', function(){
    var callerId = $(this).data('callerid');
    if ($(this).children('span').text() === 'Join') {
      join(callerId);
      $(this).children('span').text('Leave');
      disappear($(this).siblings());
    } else {
      leave(callerId);
      $(this).remove();
    }
  });
}

DeVry.SocketEventHandler.onDefault = function(data) {
  console.log(data);
}