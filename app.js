'use strict';

const DESKTOP_MEDIA = ['screen', 'window'];

var pending_request_id = null;

// Launch the chooseDesktopMedia().
document.querySelector('#start').addEventListener('click', function(event) {
  pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
      DESKTOP_MEDIA, onAccessApproved);
});

document.querySelector('#stop').addEventListener('click', function(event) {
  if (pending_request_id != null) {
    chrome.desktopCapture.cancelChooseDesktopMedia(pending_request_id);
    //document.querySelector('#video').style.webkitFilter="brightness(0)";
    WebRTCController.closePeerConnection();
  }
  updateMessage("Screen sharing stopped.");
});

document.querySelector('#calls').addEventListener('click', function(event) {
  var username = $('#username').val();

  if (username.length == 0) {
    updateMessage("Please enter your name.");
  } else {
    DeVry.SocketManager.send({'username':username, 'type':'calls'});
    $('#calls').text('Refresh Caller List');
  }
});

function join(callerId) {
  var username = $('#username').val();
  DeVry.SocketManager.joinCall(username, callerId);
}

function leave(callerId) {
  var username = $('#username').val();
  DeVry.SocketManager.leaveCall(username, callerId);
  updateMessage("Ready to join a new call.");
}

// Launch webkitGetUserMedia() based on selected media id.
function onAccessApproved(id) {
  if (!id) {
    console.log('Access rejected.');
    return;
  }

  WebRTCController.startScreenConnection({
    audio:{
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: id
      }
    },
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: id,
        maxWidth: screen.width,
        maxHeight: screen.height
      }
    }
  }, document.querySelector('#video'));
}

function getUserMediaError(error) {
  console.log('navigator.webkitGetUserMedia() errot: ', error);
}

function updateMessage(message) {
  var height = $('.to-bottom').height();
  $('.to-bottom').height('0');
  setTimeout(function() {
    $('.messageSpan').text(message);
    $('.to-bottom').height(height);
  }, 500);
}

function disappear(items) {
  items.each(function() {
    var that = $(this);
    that.css('opacity', '0');
    setTimeout(function() {
      that.remove();
    }, 500);
  });
}

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  console.log(request);
});

var url = 'wss://d40373764.dvuadmin.net:8443';
DeVry.SocketManager.connect(url, DeVry.SocketEventHandler);
