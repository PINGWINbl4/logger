const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function writeToLog(data, code){

    const logCode = await db.EventCode.findUnique({
        where:{
            code: Number(code)
        }
    })
    data.message = logCode.description
    if (logCode.description.indexOf('{sensorName}') && data.sensorName !== undefined){
        data.message = logCode.description.replace('{sensorName}', data.sensorName);
        logCode.description = data.message
        delete data.sensorName
    }
    if (logCode.description.indexOf('{shelldueName}') && data.shelldueName !== undefined){
        data.message = logCode.description.replace('{shelldueName}', data.shelldueName);
        logCode.description = data.message
        delete data.shelldueName
    }
    if (logCode.description.indexOf('{roomName}') && data.roomName !== undefined){
        data.message = logCode.description.replace('{roomName}', data.roomName);
        logCode.description = data.message
        delete data.roomName
    }
    data.codeId = logCode.id
    console.log(data)
    const eLog = await db.EventLog.create({
        data:data
    })
    return eLog
}

module.exports = {
    writeToLog
}