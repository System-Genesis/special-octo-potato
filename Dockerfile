FROM node:13.12-alpine as BUILD
WORKDIR /
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent --progress=false
COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "serve"]
