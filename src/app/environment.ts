import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment
dotenv.config();
dotenv.config({
  path: path.join(process.cwd(), 'environments', `${process.env.NODE_ENV || 'development'}.env`)
});
process.env.GOOGLE_APPLICATION_CREDENTIALS =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || './google.json';

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
  dialogFlow: {
    authorizationFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    projectId: 'studderagent'
  },
  env: process.env.NODE_ENV,
  port: Number(process.env.PORT) || 3000
} as IEnvironment;
