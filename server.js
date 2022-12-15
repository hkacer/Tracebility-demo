require('dotenv').config()

const express = require('express')
const app = express()
const path = require('path')
const cors=require('cors')
const {ROLLBAR_KEY}=process.env

app.use(express.json())
app.use(cors())

var Rollbar = require('rollbar')
var rollbar = new Rollbar({
  accessToken: ROLLBAR_KEY,
  captureUncaught: true,
  captureUnhandledRejections: true,
})

// record a generic message and send it to Rollbar
rollbar.log('Hello world!')

const students = ['Jimmy', 'Timothy', 'Jimothy']

app.get('/', (req, res) => {
    rollbar.info('somone got a list of students')
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/students', (req, res) => {
    res.status(200).send(students)
})

app.post('/api/students', (req, res) => {
   let {name} = req.body

   const index = students.findIndex(student => {
       return student === name
   })

   try {
       if (index === -1 && name !== '') {
           students.push(name)
           res.status(200).send(students)
       } else if (name === ''){
        rollbar.error('someone entered blank student')
           res.status(400).send('You must enter a name.')
       } else {
        rollbar.error('student already exist')
           res.status(400).send('That student already exists.')
       }
   } catch (err) {
    rollbar.error(err)
       console.log(err)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    rollbar.critical(`someone deleted ${students[targetIndex]} `)
    students.splice(targetIndex, 1)
    res.status(200).send(students)
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
