var config = require("MediaManagerAppConfig");
var storage = require("MediaManagerStorage")(config.db, {singleton: true});
var changesFeed = storage.changesFeed();
changesFeed.on('doc.image.created', function(id) { console.log('Doc created w/ id - ' + id); });
changesFeed.listen()

