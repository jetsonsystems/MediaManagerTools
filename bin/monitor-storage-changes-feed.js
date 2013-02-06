var config = require('MediaManagerAppConfig');
var mmApi = require('MediaManagerApi/lib/MediaManagerApiCore')(config);
var WebSocket = require('MediaManagerApi/lib/NotificationsWsLike');
var ws = new WebSocket('ws://appjs/notifications');

function isConnectionEstablished(parsedMsg) {
  return (parsedMsg.resource === '/notifications' && parsedMsg.event === 'connection.established');
};

function isChangesFeedEvent(parsedMsg) {
  return (parsedMsg.resource === '/storage/changes-feed');
};

function doSubscriptions() {
  ws.send(JSON.stringify({
	  "resource": "_client", 
	  "event": "subscribe",
	  "data": {
		  "resource": "/storage/changes-feed" 
	  }}));
};

function getChangesFeed() {
  var urlVersion = "v0";

  var changesFeedResource = new mmApi.StorageChangesFeed('/storage/changes-feed',
                                                         {instName: 'changes-feed',
                                                          pathPrefix: '/' + urlVersion });

  function onSuccess(responseBody) {
    console.log('onSuccess: Handling - POST /storage/changes-feed, response payload of length - ' + JSON.stringify(responseBody).length);
  };

  function onError(responseBody) {
    console.log('onError: Handling - POST /storage/changes-feed, response payload - ' + JSON.stringify(responseBody));
  };

  var options = {
    onSuccess: onSuccess,
    onError: onError,
    attr: {}
  };

  changesFeedResource.doRequest('POST', options);
};

ws.onmessage = function(msg) {
  console.log('Got message - ' + msg.data);
  var parsedMsg = JSON.parse(msg.data);
  if (isConnectionEstablished(parsedMsg)) {
    doSubscriptions();
    getChangesFeed();
  }
  else if (isChangesFeedEvent(parsedMsg)) {
    console.log('ws.onmessage: Got changes feed event, event - ' + parsedMsg.event + ', doc resource - ' + parsedMsg.data.doc_resource + ', doc - ' + JSON.stringify(parsedMsg.data.doc) + ', event - ' + msg.data);
  }
  else {
    console.log('ws.onmessage: Got unknown event - ' + msg.data);
  }
};


