FROM node:alpine

EXPOSE 8080
ENV PORT=8080

WORKDIR /workspace

COPY . /workspace
RUN npm update

CMD ["node", "index.js"]
# ENTRYPOINT ["npm", "run", "runapp"]