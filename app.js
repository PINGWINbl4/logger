const express = require('express');
const app = express();
const http = require('http')
app.use(express.json());
const {writeToLog} = require('./utils')
app.post("/:code", async (req, res)=>{
    try{
        console.log(req.body)
        writeToLog(req.body.data, req.params.code)
        res.json("done")
    }
    catch(err){
        console.log(err)
    }
  })
  
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
      status: err.status || 500,
      message: err.message,
    });
  });
  
  const PORT = process.env.APP_PORT || 5282;
  const HOST = process.env.APP_HOST || "localhost"
  app.listen(PORT, HOST, () => console.log(`🚀 @ http://${HOST}:${PORT}`));