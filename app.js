'use strict';

const DESKTOP_MEDIA = ['screen', 'window'];
const url = 'wss://d40373764.dvuadmin.net:8443';
//const url = 'wss://192.168.1.6:8443';

var pending_request_id = null;
var screenController = new DeVry.WebRTCController(url, myCallbacks);

// Launch the chooseDesktopMedia().
document.querySelector('#start').addEventListener('click', function(event) {
  pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
      DESKTOP_MEDIA, onAccessApproved);
});

document.querySelector('#stop').addEventListener('click', function(event) {
  if (pending_request_id != null) {
    chrome.desktopCapture.cancelChooseDesktopMedia(pending_request_id);
    screenController.closePeerConnection();
    document.querySelector('#video').src = '';
    //document.querySelector('#video').style.webkitFilter="brightness(0)";
  }
  updateMessage("Screen sharing stopped.");
});

document.querySelector('#calls').addEventListener('click', function(event) {
  var username = $('#username').val();

  if (username.length == 0) {
    updateMessage("Please enter your name.");
  } else {
    screenController.getCallerIDs(username);
    $('#calls').text('Refresh Caller List');
  }
});

function join(callerId) {
  var username = $('#username').val();
  screenController.joinCall(username, callerId);
}

function leave(callerId) {
  var username = $('#username').val();
  screenController.leaveCall(username, callerId);
  updateMessage("Ready to join a new call.");
}

// Launch webkitGetUserMedia() based on selected media id.
function onAccessApproved(id) {
  if (!id) {
    updateMessage("Access rejected.");
    return;
  }

  screenController.startScreenConnection({
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

function updateMessage(message) {
  var height = '10%';
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

document.addEventListener("webrtcMessageEvent", function(e) {
  updateMessage(e.detail.message);
}, false);

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  console.log(request);
});
