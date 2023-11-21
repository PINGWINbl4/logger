const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function writeToLog(dataToLog, code){
    const logCode = await db.EventCode.findUnique({
        where:{
            code: Number(code)
        }
    })
    const lastSensorData = await db.data.findUnique({
        where:{
            id: dataToLog.dataId
        }
    })
    dataToLog.message = logCode.description


    const substringsToChange = ['sensorName','shelldueName','roomName']
    substringsToChange.forEach(substring =>{
        if (logCode.description.indexOf(`{${substring}}`) && dataToLog[substring] !== undefined){
            logCode.description = logCode.description.replace(`{${substring}}`, dataToLog[substring]);
            delete dataToLog[substring]
        }
    })
    const lastSensorDataKeys = Object.keys(lastSensorData.value) 
    lastSensorDataKeys.forEach(field=>{
        if (logCode.description.indexOf(`{${field}}`)){
            dataToLog.message = logCode.description.replace(`{${field}}`, lastSensorData.value[field]);
            logCode.description = dataToLog.message
        }
    })
    dataToLog.codeId = logCode.id
    const eLog = await db.EventLog.create({
        data:dataToLog
    })
    return eLog
}

module.exports = {
    writeToLog
}