# lambda-nodejs18.x




To start lambda locally with sam cli passing the event content from even.json file (in the events folders)
"sam local invoke -e events/event.json"



This project contains source code and supporting files for a serverless application that you can deploy with the SAM CLI. It includes the following files and folders.

- hello-world - Code for the application's Lambda function.
- events - Invocation events that you can use to invoke the function.
- hello-world/tests - Unit tests for the application code. 
- template.yaml - A template that defines the application's AWS resources.

## Deploy the sample application

```bash
sam build
sam deploy --guided
```


### Developing Lambda/GCP Function locally


Use the serverless template for passing the event data to the ngrok function
Important: Update  URL to your local ngrok server

**Start ngrok locally:**

**For express server (lambda)**
_ngrok % ngrok http 3000   

**For google function:**
_ngrok % ngrok http 8080


**For Lambda:**
Start the express server:

Localserver.zip
"nodemon dev-server.js"

It is importing lambda by 
import {lambdaHandler} from '../hello-world/app.mjs'
Change to point to your lambda whenever it is

Copy all needed .env variables into node/express folder as it will not pick up what’s in the lambda scope




