import express from 'express'
import 'dotenv/config'

// point to lambda 
import {lambdaHandler} from '../hello-world/app.mjs'

const app = express()
app.use(express.json())


app.post('/lambda', async (req, res) => {


const eventData = req.body

const result = await lambdaHandler(
      eventData
  )
  console.log(result)
  return res.json(result) 

  })

app.listen(3000, () => console.log('listening on port: 3000'))