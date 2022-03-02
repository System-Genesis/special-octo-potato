import mongoose, { ConnectOptions } from "mongoose";
import config from "config";


const opts: ConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  poolSize: Number(config.get('db.mongo.poolSize')),
};

const conn = mongoose.createConnection();

export const connect = async (connString: string) => {
  await conn.openUri(connString, opts);
}

export default conn;
