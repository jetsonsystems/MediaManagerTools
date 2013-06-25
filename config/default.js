//
//  Default APP configuraiton. Composed of the following attributes:
//    app: application configuration.
//    db: database configuration.
//    services: REST API and notifications services.
//    logging: logging configuraiton.
//

//
//  appConfig:
//
var appConfig = {
  id: undefined,
  name: undefined
};

//
//  dbConfig: Database configuration.
//
var dbConfig = { 
  database: "plm-media-manager",
  local: {
    execPath: './MediaManagerTouchServer.app/Contents/MacOS/MediaManagerTouchServ',
    port: "59840",
    updateSeq: undefined
  },
  remote: {
    host: "72.52.106.218",
    port: undefined
  }
};

//
// servicesConfig: REST API and notificaitons API.
//
var servicesConfig = {
  restAPI: {
    host: "localhost",
    port: "9001",
    pathPrefix: '/api/media-manager',
    version: "v0"
  },
  notifAPI: {
    host: "localhost",
    port: "9002"
  }
};

//
// storageConfig: Config related to storage sub-modules.
//
var storageConfig = {
  gdrive: {
    persistDir: './var/data/storage/gdrive',
    account: {
      type: 'gdrive',
      user: 'marek@jetsonsys.com'
    },
    logOnly: true,
    locations: {
      originals: {
        assetType: "original",
        root: "appdata",
        basePath: "/media/images/originals/",
        folderId: undefined
      }
    }
  }
};

//
//
// linkedAccountsConfig: Config for external accounts which are linked to PLM.
//
var linkedAccountsConfig = {
  "test-google-account": {
    type: 'gdrive',
    name: 'test-google-account',
    user: undefined,
    code: undefined,
    clientId: undefined,
    clientSecret: undefined,
    accessToken: undefined,
    refreshToken: undefined
  }
};

var config = {
  app: appConfig,
  db: dbConfig,
  services: servicesConfig,
  storage: storageConfig,
  linkedAccounts: linkedAccountsConfig
};

module.exports = config;
