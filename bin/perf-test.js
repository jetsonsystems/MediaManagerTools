//
//  Media Manager Performance Test Script: Tests import and synchronization of data between a local / remote DB.
//
//    Usage:
//
//    For configuration, loads MediaManagerAppConfig. Individual settings in the configuration can be overridden via
//    the -d, -h, -p, -H, and -P options.
//

var opts = require('optimist')
  .boolean('v')
  .boolean('c')
  .usage('Usage: $0 [<options>] <data dir>\n\nMedia Managager Performance Test Script.')
  .options({
    'd' : {
      'alias' : 'dbname',
      'describe' : 'Database name.'
    },
    'h' : {
      'alias' : 'local-dbhost',
      'describe' : 'local TouchDB / CouchDB host.'
    },
    'p' : {
      'alias' : 'local-dbport',
      'describe' : 'local TouchDB / CouchDB port number.'
    },
    'H' : {
      'alias' : 'remote-dbhost',
      'describe' : 'remote TouchDB / CouchDB host.'
    },
    'P' : {
      'alias' : 'remote-dbport',
      'describe' : 'remote TouchDB / CouchDB port number.'
    },
    'n' : {
      'alias' : 'num-batches',
      'default' : 1,
      'describe' : 'number of batches to run'
    }
  });

var argv = opts.argv;

var argsOk = function(argv) {
  if (argv._.length !== 1) {
    return false;
  }
  return true;
}(argv);

if (!argsOk) {
  opts.showHelp();
  process.exit(1);
}

var dataDir = argv._[0];

var config = require('MediaManagerAppConfig');

if (argv.d) {
  console.log('Overriding database - ' + argv.d);
  config.db.database = argv.d;
}

if (argv.h) {
  console.log('Overriding local host - ' + argv.h);
  config.db.local.host = argv.h;
}

if (argv.p) {
  console.log('Overriding local port - ' + argv.p);
  config.db.local.port = argv.p;
}

if (argv.H) {
  console.log('Overriding remote host - ' + argv.H);
  config.db.remote.host = argv.H;
}

if (argv.P) {
  console.log('Overriding remote port - ' + argv.P);
  config.db.remote.port = argv.P;
}

var logDir = './log/';
var infoLogfile = 'perf-test.log';
var errorLogfile = 'perf-test.log';

var mmApi = require('MediaManagerApi/lib/MediaManagerApiCore')(config);

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
  name: 'perf-test',
  streams: [
    {
      level: "info",
      path: logDir + '/' + infoLogfile
    },
    {
      level: "error",
      path: logDir + '/' + errorLogfile
    }
  ]
});

var events = require('events');
var async = require('async');

var WebSocket = require('MediaManagerApi/lib/NotificationsWsLike');
var ws = new WebSocket('ws://appjs/notifications');

var urlVersion = "v0";

var importersResource =  new mmApi.Importers('/importers', 
                                             {instName: 'importer',
                                              pathPrefix: '/' + urlVersion});
var syncResource = new mmApi.StorageSynchronizers('/storage/synchronizers',
                                                  {instName: 'synchronizer',
                                                   pathPrefix: '/' + urlVersion });

var importMonitorFactory = function() {
  var importMonitor;

  importMonitor = Object.create(events.EventEmitter.prototype,
                                {
                                  id: { value: undefined, writable: true },
                                  completedEvent: { value: 'import.completed' },
                                  errorEvent: { value: 'import.error' },
                                  startedTs: { value: undefined, writable: true },
                                  completedTs: { value: undefined, writable: true },
                                  run: { value: function(id) {
                                    this.id = id;
                                    console.log('Running import monitor for id - ' + this.id);
                                    this.startedTs = Date.now();
                                    async.whilst( function () { return importMonitor.completedTs === undefined; },
                                                  function (callback) {
                                                    var options = { id: id,
                                                                    onSuccess: function(responseBody) {
                                                                      console.log('Import monitor for id - ' + responseBody.importer.id + ', response- ' + JSON.stringify(responseBody));
                                                                      console.log('Import started @ - ' + responseBody.importer.started_at);
                                                                      console.log('Import completed @ - ' + responseBody.importer.completed_at);
                                                                      if (responseBody.importer.completed_at) {
                                                                        console.log('Import completed, updating completion time - ' + responseBody.importer.completed_at);
                                                                        importMonitor.completedTs = Date.now();
                                                                        console.log('Import completedTs - ' + importMonitor.completedTs + ', now - ' + Date.now());
                                                                        callback(null);
                                                                      }
                                                                      else {
                                                                        setTimeout(callback, 1000);
                                                                      }
                                                                    },
                                                                    onError: function() {
                                                                      callback(importMonitor.errorEvent);
                                                                    }};
                                                    importersResource.doRequest('GET', options);
                                                  },
                                                  function (err) {
                                                    console.log('Batch import completed');
                                                    if (err) {
                                                      importMonitor.emit(importMonitor.errorEvent);
                                                    }
                                                    else {
                                                      importMonitor.emit(importMonitor.completedEvent);
                                                    }
                                                  }
                                                );
                                  }},
                                  elapsedSeconds: { value: function() {
                                    return (this.completedTs - this.startedTs) / 1000;
                                  }}
                                });
  return importMonitor;
};

var syncMonitorFactory = function() {
  return Object.create(events.EventEmitter.prototype,
                       {
                         completedEvent: { value: 'sync.completed' },
                         errorEvent: { value: 'sync.error' },
                         started: { value: false, writable: true },
                         completed: { value: false, writable: true },
                         startedTs: { value: undefined, writable: true },
                         completedTs: { value: undefined, writable: true },
                         gotStarted: { value: function() {
                           if ((this.started === false) && (this.completed === false)) {
                             this.started = true;
                             this.startedTs = Date.now();
                           }
                           else {
                             this.emit(this.errorEvent);
                           }
                         } },
                         gotCompleted: { value: function() {
                           if ((this.started === true) && (this.completed === false)) {
                             this.completed = true;
                             this.completedTs = Date.now();
                             this.emit(this.completedEvent);
                           }
                           else {
                             this.emit(this.errorEvent);
                           }
                         } },
                         elapsedSeconds: { value: function() {
                           return (this.completedTs - this.startedTs) / 1000;
                         } }
                       });
};

var syncMonitor = undefined;
                                      
var doBatch = function(batchNum, batchDoneCallback) {
  var importerMeta = { status: undefined,
                       elapsedSeconds: undefined };
  var syncMeta = { status: undefined,
                   elapsedSeconds: undefined };
  async.series([
    function doImport(callback) {

      var importMonitor = importMonitorFactory();

      importMonitor.once(importMonitor.completedEvent, function() {
        importerMeta.status = 0;
        importerMeta.elapsedSeconds = importMonitor.elapsedSeconds();
        callback(null);
      });

      importMonitor.once(importMonitor.errorEvent, function() {
        importerMeta.status = -1;
        callback(importMonitor.errorEvent);
      });

      var options = {
        attr: { "import_dir" : dataDir },
        onSuccess: function(responseBody) {
          console.log('Got importer response - ' + responseBody);
          importMonitor.run(responseBody.importer.id);
          console.log('Import monitor completedTs - ' + importMonitor.completedTs);
        },
        onError: function() {
          callback(importMonitor.errorEvent);
        }
      };

      importersResource.doRequest('POST', options);
    },
    function doSync(callback) {

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

      syncMonitor = syncMonitorFactory();

      syncMonitor.once(syncMonitor.completedEvent, function() {
        syncMeta.status = 0;
        syncMeta.elapsedSeconds = syncMonitor.elapsedSeconds();
        console.log('Sync elapsed seconds - ' + syncMonitor.elapsedSeconds());
        callback(null);
      });

      syncMonitor.once(syncMonitor.errorEvent, function() {
        syncMeta.status = -1;
        callback(syncMonitor.errorEvent);
      });

      syncResource.doRequest('POST', options);
    }
  ], function(err, results) {
    logger.info({ event: '__batchDone__',
                  batchNum: batchNum,
                  importer: importerMeta,
                  sync: syncMeta });
    batchDoneCallback(err);
  });
};

var numBatches = argv.n;

var doBatches = function(numBatches) {
  console.log('Starting batches, will run ' + numBatches + '...');
  var batchNum = 0;

  async.whilst( function () { return batchNum < numBatches; },
                function (callback) {
                  console.log('Doing batch - ' + batchNum);
                  doBatch(batchNum, function(err) {
                    console.log('Batch finished - ' + batchNum);
                    batchNum = batchNum + 1;
                    callback(err);
                  });
                },
                function() {
                  console.log('All batches completed!');
                } );
};

function isConnectionEstablished(parsedMsg) {
  return (parsedMsg.resource === '/notifications' && parsedMsg.event === 'connection.established');
};

function isSyncStarted(parsedMsg) {
  return (parsedMsg.resource === '/storage/synchronizers' && parsedMsg.event === 'sync.started');
};

function isSyncCompleted(parsedMsg) {
  return (parsedMsg.resource === '/storage/synchronizers' && parsedMsg.event === 'sync.completed');
};

function doSubscriptions() {
  ws.send(JSON.stringify({
	  "resource": "_client", 
	  "event": "subscribe",
	  "data": {
		  "resource": "/storage/synchronizers" 
	  }}));
};

ws.onmessage = function(msg) {
  console.log('Got message - ' + msg.data);
  var parsedMsg = JSON.parse(msg.data);
  if (isConnectionEstablished(parsedMsg)) {
    doSubscriptions();
    doBatches(numBatches);
  }
  else if (isSyncStarted(parsedMsg)) {
    if (syncMonitor) {
      syncMonitor.gotStarted();
    }
  }
  else if (isSyncCompleted(parsedMsg)) {
    if (syncMonitor) {
      syncMonitor.gotCompleted();
    }
  }
};
