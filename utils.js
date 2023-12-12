const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function writeToLog(dataToLog, code){
    if(!code){
        throw new Error('req havent logCode')
    }

    const logCode = await db.EventCode.findUnique({
        where:{
            code: Number(code)
        }
    })

    dataToLog.message = logCode.description
    const pushTitle = dataToLog.sensorName
    const substringsToChange = ['sensorName','shelldueName','roomName']
    substringsToChange.forEach(substring =>{
        console.log(`${substring}: ${dataToLog[substring]}`)
        console.log(Boolean(logCode.description.indexOf(`{${substring}}`)))
        console.log(logCode.description.indexOf(`{${substring}}`) && dataToLog[substring] != undefined)
        if (logCode.description.indexOf(`{${substring}}`) && dataToLog[substring] != undefined){
            logCode.description.replace(`{${substring}}`, dataToLog[substring]);
            dataToLog.message = logCode.description 
            delete dataToLog[substring]
        }
    })
    
    if(dataToLog.dataId){
        const lastSensorData = await db.data.findUnique({
            where:{
                id: dataToLog.dataId
            }
        })
        const lastSensorDataKeys = Object.keys(lastSensorData.value) 
        lastSensorDataKeys.forEach(field=>{
            if (logCode.description.indexOf(`{${field}}`)){
                dataToLog.message = logCode.description.replace(`{${field}}`, lastSensorData.value[field]);
            }
        })
    }
    
    dataToLog.codeId = logCode.id
    const pushBody = dataToLog.message
    
    dataToLog.sendPush? postPushMessage(dataToLog.userId, pushTitle, pushBody):
                        console.log("push wasn't sended. sendPush: false")

    delete dataToLog.sendPush
    const eLog = await db.EventLog.create({
        data:dataToLog
    })
    console.log(eLog.message)
    
    const user = await db.User.findUnique({
        where:{
            id: dataToLog.userId
        }
    })
    console.log(`User ${user.email} can see it soon`)
}

async function postPushMessage(userId, title, body){
    try{
      const user = await db.user.findUnique({
        where:{
          id:userId
        }
      })
        if(!user.get_push){
            throw new Error(`User ${user.email} don't wont to get push messages`)
        }
        const push = {
            to: user.token,
            title: title,
            body: body,
          };
        const postData = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
    
        //make sure to serialize your JSON body
            body: JSON.stringify({
                push: push
            })
        }
        await fetch(`http://${process.env.PUSH_HOST}:${process.env.PUSH_PORT}/api/push`, postData)
        .then(async (res) => {console.log(`Message sended at push service. ${user.email} can see it soon`)})
        .catch(err => {console.log(err)})
    
    }
    catch(err){
        console.log(err)
    }
  }
  

module.exports = {
    writeToLog
}