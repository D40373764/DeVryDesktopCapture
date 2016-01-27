'use strict';

var myCallbacks = {};

myCallbacks.onOpen  = function() {}
myCallbacks.onCall  = function(data) {}
myCallbacks.onOffer = function(data) {}
myCallbacks.onLeave = function(data) {
  $('#stop').click();
  $('.call-list').find("[data-callerid='" + data.callerId + "']").click();
  updateMessage("User left.");
}
myCallbacks.onError = function(error) {
  updateMessage(error);
}
myCallbacks.onJoin = function(data) {
  if (data.success === "false") {
    updateMessage("Login unsuccessful, please try a different name.");
  }
  else {
    updateMessage("Join successful.");
  }
}
myCallbacks.showCalls = function(data) {
  console.log(data);
  $('.call-list').empty();
  updateMessage(data.value.length + ' call');

  for (var i in data.value) {
    $('.call-list').append("<a href='#' class='list-group-item' data-callerid='" + data.value[i] + "'>" + data.value[i] + "<span class='badge'>Join</span></a>");
  }
  $('.call-list a').on('click', function(event){
    var callerId = $(this).data('callerid');
    if ($(this).children('span').text() === 'Join') {
      join(callerId);
      $(this).children('span').text('Leave');
      disappear($(this).siblings());
    } else {
      leave(callerId);
      $(this).remove();
    }

    return false;
  });
}
myCallbacks.onDefault = function(data) {
  console.log(data);
}
