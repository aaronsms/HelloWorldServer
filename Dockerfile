FROM node:lts

WORKDIR /app
COPY ./package*.json ./
RUN npm ci
COPY . .
RUN chown node:node /app -R
USER node

EXPOSE 3000
CMD npm start
