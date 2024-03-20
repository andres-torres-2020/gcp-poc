'use strict';

const functions = require('@google-cloud/functions-framework');

functions.http("FunctionFrameworkDemo", async (req, res) =>
{
  console.log(`FunctionFrameworkDemo-BEGIN: ${(new Date()).toString()}`)

  let toDos = [
    // await doStuff()
  ];

  Promise.allSettled(toDos)
  .then((values) => {
    console.log('FunctionFrameworkDemo-allSettled: ' + JSON.stringify(values));
    })
  .finally(() => {
    console.log(`FunctionFrameworkDemo-END: ${(new Date()).toString()}`);
    returnResults(true, res);
  });
});

function returnResults(status, response)
{
  response.writeHead(200, { "Content-Type": "text/json" });
  response.end(JSON.stringify({
      status: (status ? 'success' : 'fail'),
      message: "done!",
      data: null,
      completionTs: Date.now()
    }) );
}
