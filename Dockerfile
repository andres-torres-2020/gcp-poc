FROM node:20-alpine3.19
EXPOSE 8080
COPY package.json .
RUN npm install --only=production --omit=dev
COPY . .
ENTRYPOINT ["npm", "run", "start"]
