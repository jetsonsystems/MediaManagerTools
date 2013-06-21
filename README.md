# MediaManagerTools

Some tools useful during development of the MediaManager App.

## ./bin/appjs-build.sh

`
USAGE: appjs-build.sh <install directory>
`

Builds appjs. Only tested on Mac OSX.

## ./bin/asset-manager.js

```
USAGE: node ./bin/asset-manager.js

Options:

  -d, --dbname         Database name.                       
  -h, --local-dbhost   local TouchDB / CouchDB host.        
  -p, --local-dbport   local TouchDB / CouchDB port number.
  -l, --live:          Do a live run uploading assets to Google Drive.
                       Otherwise, do a dry run where uploads are NOT actually 
                       performed and activity is logged.
  -u, --db-update-seq  TouchDB / CouchDB update seq. to start monitor
                       the changes feed from.
```

Instantiates an instance of the [MediaManagerAppSupport](https://github.com/jetsonsystems/MediaManager/blob/master/MediaManagerAppSupport/README.md) [Asset Manager](https://github.com/jetsonsystems/MediaManager/blob/master/MediaManagerAppSupport/lib/AssetManager.js).

The utility must connect to the changes feed of a touchdb/couchdb instance. By default the database is connected to using paramaters defined in the [Media Manager Application Config](https://github.com/jetsonsystems/MediaManager/blob/master/MediaManagerAppConfig/README.md).

Individual paramaters from the [Media Manager Application Config](https://github.com/jetsonsystems/MediaManager/blob/master/MediaManagerAppConfig/README.md) may be overriden using the -d, -h, and -p command line options.

Perhaps, the easiest way to use the utility is to start the [PLM desktop application, PlmApp](https://github.com/jetsonsystems/PlmApp) which will in turn start an instance of TouchDB which runs on a port consistent with the [Media Manager Application Config](https://github.com/jetsonsystems/MediaManager/blob/master/MediaManagerAppConfig/README.md).

## ./bin/run-sync.js

`
USAGE: node run-sync.js
`

Performs a one time sync between the 2 databases found in the App configuration.

## ./bin/perf-test.js

```
Usage: node ./bin/perf-test.js [<options>] <data dir>

Media Managager Performance Test Script.

Options:
  -d, --dbname         Database name.                       
  -h, --local-dbhost   local TouchDB / CouchDB host.        
  -p, --local-dbport   local TouchDB / CouchDB port number. 
  -H, --remote-dbhost  remote TouchDB / CouchDB host.       
  -P, --remote-dbport  remote TouchDB / CouchDB port number.
  -n, --num-batches    number of batches to run               [default: 1]
```

Utility to run a performance test on syncronization between a local and remote database.
For example, the following invokation could be used:

```
nohup ./bin/node MediaManagerTools/bin/perf-test.js -d plm-media-manager-perf-test -n 100 /Users/marekjulian/SoftwareDev/JetsonSystems/Projects/PLM/MediaManager/CouchStorage/PerfTest//TestData/Batch100/ &> per-test.out &
```

## ./bin/monitor-changes-feed.js





