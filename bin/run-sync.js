var config = require('MediaManagerAppConfig');
var mmApi = require('MediaManagerApi/lib/MediaManagerApiCore')(config);
var WebSocket = require('MediaManagerApi/lib/NotificationsWsLike');
var ws = new WebSocket('ws://appjs/notifications');

function isConnectionEstablished(parsedMsg) {
  return (parsedMsg.resource === '/notifications' && parsedMsg.event === 'connection.established');
};

function doSubscriptions() {
  ws.send(JSON.stringify({
	  "resource": "_client", 
	  "event": "subscribe",
	  "data": {
		  "resource": "/storage/synchronizers" 
	  }}));
};

function doSync() {
  var urlVersion = "v0";

  var syncResource = new mmApi.StorageSynchronizers('/storage/synchronizers',
                                                    {instName: 'synchronizer',
                                                     pathPrefix: '/' + urlVersion });

  function onSuccess(responseBody) {
    console.log('onSuccess: Handling - POST /storage/synchronizers, response payload of length - ' + JSON.stringify(responseBody).length);
  };

  function onError(responseBody) {
    console.log('onError: Handling - POST /storage/synchronizers, response payload - ' + JSON.stringify(responseBody));
  };

  var options = {
    onSuccess: onSuccess,
    onError: onError,
    attr: {}
  };

  syncResource.doRequest('POST', options);
};

ws.onmessage = function(msg) {
  console.log('Got message - ' + msg.data);
  var parsedMsg = JSON.parse(msg.data);
  if (isConnectionEstablished(parsedMsg)) {
    doSubscriptions();
    doSync();
  }
};


