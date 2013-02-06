var config = require('MediaManagerAppConfig');
var mmApi = require('MediaManagerApi/lib/MediaManagerApiCore')(config);
var WebSocket = require('MediaManagerApi/lib/NotificationsWsLike');
var ws = new WebSocket('ws://appjs/notifications');

function isConnectionEstablished(parsedMsg) {
  return (parsedMsg.resource === '/notifications' && parsedMsg.event === 'connection.established');
};

function isImportEvent(parsedMsg) {
  return (parsedMsg.resource === '/importers');
};

function doSubscriptions() {
  ws.send(JSON.stringify({
	  "resource": "_client", 
	  "event": "subscribe",
	  "data": {
		  "resource": "/importers" 
	  }}));
};

function doImport() {
  var urlVersion = "v0";

  var importResource = new mmApi.Importers('/importers',
                                           {instName: 'importer',
                                            pathPrefix: '/' + urlVersion });

  function onSuccess(responseBody) {
    console.log('onSuccess: Handling - POST /importers, response payload of length - ' + JSON.stringify(responseBody).length);
  };

  function onError(responseBody) {
    console.log('onError: Handling - POST /importers, response payload - ' + JSON.stringify(responseBody));
  };

  var options = {
    onSuccess: onSuccess,
    onError: onError,
    attr: { import_dir: '/Users/marekjulian/PLM' }
  };

  importResource.doRequest('POST', options);
};

ws.onmessage = function(msg) {
  console.log('Got message - ' + msg.data);
  var parsedMsg = JSON.parse(msg.data);
  if (isConnectionEstablished(parsedMsg)) {
    doSubscriptions();
    doImport();
  } else if (isImportEvent(parsedMsg)) {
    console.log('ws.onmessage: Import event, message - ' + msg.data + ', data - ' + JSON.stringify(parsedMsg.data));
  }
};


