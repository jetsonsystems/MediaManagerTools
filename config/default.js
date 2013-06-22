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
var linkedAccountsConfig = [
  {
    type: 'gdrive',
    user: 'marek@jetsonsys.com',
    code: "4/XXRRfEVWt0IM6Cydw7GUDUKHvadJ.4kncK5inmIsRMqTmHjyTFGOi7OpxfgI",
    accessToken: "ya29.AHES6ZT8TDGk2Mr6295AVvGGqyBqPHl1bQUCRJSug261KA",
    refreshToken: "1/Ycm6I2NtZ_BG0tDtt0mvsW4_s3xSC3kDf_bysAUmawU"
  }
];

var config = {
  app: appConfig,
  db: dbConfig,
  services: servicesConfig,
  storage: storageConfig,
  linkedAccounts: linkedAccountsConfig
};

module.exports = config;
