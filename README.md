# MediaManagerTools

Some tools useful during development of the MediaManager App.

## ./bin/appjs-build.sh

`
USAGE: appjs-build.sh <install directory>
`

Builds appjs. Only tested on Mac OSX.

## ./bin/run-sync.js

`
USAGE: node run-sync.js
`

Performs a one time sync between the 2 databases found in the App configuration.

## ./bin/perf-test.js

`
Usage: node ./bin/perf-test.js [<options>] <data dir>

Media Managager Performance Test Script.

Options:
  -d, --dbname         Database name.                       
  -h, --local-dbhost   local TouchDB / CouchDB host.        
  -p, --local-dbport   local TouchDB / CouchDB port number. 
  -H, --remote-dbhost  remote TouchDB / CouchDB host.       
  -P, --remote-dbport  remote TouchDB / CouchDB port number.
  -n, --num-batches    number of batches to run               [default: 1]
`

Utility to run a performance test on syncronization between a local and remote database.
For example, the following invokation could be used:

`
nohup ./bin/node MediaManagerTools/bin/perf-test.js -d plm-media-manager-perf-test -n 100 /Users/marekjulian/SoftwareDev/JetsonSystems/Projects/PLM/MediaManager/CouchStorage/PerfTest//TestData/Batch100/ &> per-test.out &
`




