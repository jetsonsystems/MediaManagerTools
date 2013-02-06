var config = require("MediaManagerAppConfig");
var storage = require("MediaManagerStorage")(config.db, {singleton: true});
var changesFeed = storage.changesFeed({ appId: config.app.id });
changesFeed.on('doc.image.created', function(event) { console.log('EVENT: image create event, type - ' + event.type + ', w/ id - ' + event.doc._id); });
changesFeed.on('doc.image.updated', function(event) { console.log('EVENT: image update event, type - ' + event.type + ', w/ id - ' + event.doc._id); });
changesFeed.on('doc.image.deleted', function(event) { console.log('EVENT: image deleted event, type - ' + event.type + ', w/ id - ' + event.doc._id); });
changesFeed.on('doc.importer.created', function(event) { console.log('EVENT: importer create event, type - ' + event.type + ', w/ id - ' + event.doc._id); });
changesFeed.on('doc.importer.updated', function(event) { console.log('EVENT: importer update event, type - ' + event.type + ', w/ id - ' + event.doc._id); });
changesFeed.on('doc.importer.deleted', function(event) { console.log('EVENT: importer delete event, type - ' + event.type + ', w/ id - ' + event.doc._id); });
changesFeed.on('doc.__unknown__.created', function(event) { console.log('EVENT: unknown create event, type - ' + event.type + ', w/ id - ' + event.doc._id); });
changesFeed.on('doc.__unknown__.updated', function(event) { console.log('EVENT: unknown update event, type - ' + event.type + ', w/ id - ' + event.doc._id); });
changesFeed.on('doc.__unknown__.deleted', function(event) { console.log('EVENT: unknown delete event, type - ' + event.type + ', w/ id - ' + event.doc._id); });
changesFeed.listen()

