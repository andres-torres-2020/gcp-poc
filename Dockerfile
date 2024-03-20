FROM node:alpine

EXPOSE 8080
ENV PORT=8080

WORKDIR /workspace

COPY . /workspace
RUN npm update && npm install @google-cloud/functions-framework

CMD ["functions-framework", "--target", "FunctionFrameworkDemo"]