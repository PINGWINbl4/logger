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

    console.log(dataToLog)
    const substringsToChange = ['sensorName','shelldueName','roomName']
    substringsToChange.forEach(substring =>{
        console.log(logCode.description.indexOf(`{${substring}}`))
        console.log(dataToLog[substring])
        if (logCode.description.indexOf(`{${substring}}`) && dataToLog[substring] !== undefined){
            logCode.description = logCode.description.replace(`{${substring}}`, dataToLog[substring]);
            console.log(dataToLog[substring])
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
                logCode.description = dataToLog.message
            }
        })
    }
    dataToLog.codeId = logCode.id
    const eLog = await db.EventLog.create({
        data:dataToLog
    })
    console.log("done")
}

module.exports = {
    writeToLog
}