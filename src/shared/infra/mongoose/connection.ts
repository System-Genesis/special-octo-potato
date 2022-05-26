import mongoose, { ConnectOptions } from "mongoose";
import config from "config";


const opts: ConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  poolSize: Number(config.get('db.mongo.poolSize')),
};

const connString: string = config.get('db.mongo.connectionString');

const conn = mongoose.createConnection();

export const connect = async () => {
  await conn.openUri(connString, opts);
}

export default conn;
