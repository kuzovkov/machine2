FROM node:12
WORKDIR /usr/src/env
COPY . .
RUN npm install
EXPOSE 80
CMD ["node", "app/server_http.js"]
