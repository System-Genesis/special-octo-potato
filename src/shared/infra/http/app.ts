import express from "express";
import morgan from "morgan";
import { json, urlencoded } from "body-parser";
import diRouter from "../../../modules/digitalIdentity/infra/http/router";
import roleRouter from "../../../modules/Role/infra/http/router";
import groupRouter from "../../../modules/group/infra/http/router";
import entityRouter from "../../../modules/entity/infra/http/router";
import config from "config";


export const app = express();
app.use(json());
app.use(morgan("dev"));
app.use(urlencoded({ extended: false }));
app.use('/api/digitalIdentities', diRouter);
app.use('/api/groups', groupRouter);
app.use('/api/entities', entityRouter);
app.use('/api/roles', roleRouter);

const PORT = Number(config.get('server.port')) || 3000;


export const start = () => {
  return app.listen(PORT, () => {
    console.log(`app listening on port ${PORT}`);
  });
}