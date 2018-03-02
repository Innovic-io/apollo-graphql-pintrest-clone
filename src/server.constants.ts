export const PORT = process.env.PORT;
export const API_VERSION = process.env.API_VERSION;
export const API_NAME = process.env.RESOURCE_NAME;

export const API_ENDPOINT = `/${API_VERSION}/${API_NAME}`;

export const DB_NAME = process.env.DB_NAME;
export const DB_PORT = process.env.MONGO_PORT;
export const DB_VOLUME_LOCATION = process.env.DB_VOLUME_LOCATION;
export const DATABASE_TOKEN = 'DbMongoToken';
export const DATABASE_URI = `mongodb://mongo:${DB_PORT}/${DB_NAME}`;

export const MONITOR_NAME = 'Monitor';
export const PM2_PORT = 4545;

export const privateKey = '?TM!A%ibGacO4->l:Q`YIXh/N!c,45Kh>V1#eg6fbJWAg~sg3Mo):}Gx$uW_|TO';
