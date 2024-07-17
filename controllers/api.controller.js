const fs = require('fs')
const path = require('path')

function getEndpoints(req,res) {
    const filePath = path.join(__dirname, '..', 'endpoints.json')

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading endpoints file:', err)
            return res.status(500).send({ error: 'Internal Server Error'})
        }

        try{
            const endpoints = JSON.parse(data)
            res.json(endpoints)
        } catch (error) {
            console.error('Error parsing JSON:', error)
            res.status(500).send({error: 'Internal Server Error'})
        }
    })
}

module.exports = {
    getEndpoints,
}