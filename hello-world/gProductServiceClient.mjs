import 'dotenv/config'
import { ProductServiceClient } from '@google-cloud/retail'


// Create a new instance of the Google ProductServiceClient

export const productServiceClient = new ProductServiceClient(
    { projectId: process.env.PROJECT_ID, credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY
  }});

