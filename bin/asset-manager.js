//
//  Media Manager Asset Manager invokation: Instantiates the asset manager to start monitoring for new original
//    assets and storing them on google drive.
//
//    Usage:
//
//    For configuration, loads MediaManagerAppConfig. Individual settings in the configuration can be overridden via
//    the -d, -h, and -p.
//

var opts = require('optimist')
  .boolean('v')
  .boolean('h')
  .boolean('l')
  .default('w', 10000)
  .usage('Usage: $0 [<options>]\n\nMedia Managager Asset Manager Test Script.')
  .options({
    'H' : {
      'alias' : 'help',
      'describe' : 'Print this help.'
    },
    'l' : {
      'alias': 'live',
      'describe': 'Do a live run as opposed to logging only.'
    },
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
    'u' : {
      'alias' : 'db-update-seq',
      'describe' : 'TouchDB / CouchDB update sequence to start monitoring the changes feed from'
    },
    'w' : {
      'alias' : 'wait-sec',
      'describe' : 'Wait at least this many seconds before exiting...'
    }
  });

var argv = opts.argv;

var argsOk = function(argv) {
  if (argv._.length !== 0) {
    return false;
  }
  return true;
}(argv);

if (!argsOk) {
  opts.showHelp();
  process.exit(1);
}

if (argv.H) {
  opts.showHelp();
  process.exit(1);
}

var options = {};

var config = require('MediaManagerAppConfig');

if (argv.l) {
  console.log('Overriding config. to do a live run.');
  options.logOnly = false;
};

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

var waitSec = argv.w;

var storage = require('MediaManagerStorage')(config.db, {singleton: false});
var touchdb = storage.get('touchdb');
var assetManagerModule = require('MediaManagerAppSupport/lib/AssetManager');

var assetManager = undefined;
var numPending = undefined;
if (typeof(argv.u) === 'number') {
  assetManager = assetManagerModule(config, argv.u, options);
  numPending = assetManager.numPending();
  setTimeout(function() {
    updateNumPending();
  },
             waitSec
            );
}
else {
  console.log('Fetching DB info to obtain the current update sequence.');
  touchdb.info(function(err, infoObj) {
    if (err) {
      console.log('Error retrieving DB info!');
      process.exit(-1);
    }
    else {
      assetManager = assetManagerModule(config, infoObj.updateSeq, options);
      numPending = assetManager.numPending();
      setTimeout(function() {
        updateNumPending();
      },
                 waitSec
                );
    }
  });
}

function onExit() {
  console.log('num changes: ' + assetManager.stats().numChanges);
  console.log('num queued: ' + assetManager.stats().numQueued);
  console.log('num started: ' + assetManager.stats().numStarted);
  console.log('num success: ' + assetManager.stats().numSuccess);
  console.log('num error: ' + assetManager.stats().numError);
  console.log('num to pending: ' + assetManager.numPending());
};

function updateNumPending() {
  var stats = assetManager.stats();
  numPending = stats.numPending;
  console.log('Have ' + numPending + ' still to upload, queued - ' + stats.queueSize + ', uploading - ' + stats.numUploading);
  if (numPending > 0) {
    setTimeout(function() {
      updateNumPending();
    },
               1000);
  }
  else {
    console.log('Nothing left to do!');
    onExit();
    console.log('Exiting...');
    process.exit(0);
  }
};
