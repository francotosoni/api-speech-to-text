const fs = require('fs').promises;

const opcionesFecha = {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };
  
const logger = (options) =>
async (req, res, next) => { 
  const timestamp = new Date().toLocaleString('es-AR', opcionesFecha);
    const { method, url, ip } = req; 
    const log = `${timestamp} | ${method} ${url} | ${ip} | `
        await fs.appendFile('logs.txt', log);
        next(); 
  }; 

module.exports = logger;  