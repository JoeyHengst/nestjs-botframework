interface IEnvironment {
  bot: {
    storage: {
      collection: string;
      database: string;
      uri: string;
    };
  };
  dialogFlow: {
    authorizationFile: string;
    projectId: string;
  };
  env: string;
  port: number;
}

export const environment = {
  bot: {
    storage: {
      collection: process.env.BOT_STORAGE_COLLECTION,
      database: process.env.BOT_STORAGE_DATABASE,
      uri: process.env.BOT_STORAGE_URI
    }
  },
  env: process.env.NODE_ENV,
  port: Number(process.env.PORT) || 3000
} as IEnvironment;
