import 'dotenv/config';
import fetch from 'node-fetch';
import {
  ClientBuilder,
} from '@commercetools/sdk-client-v2';


const projectKey = process.env.CTP_PROJECT_KEY;
const scopes = process.env.CTP_SCOPES;

// Configure authMiddlewareOptions
const authMiddlewareOptions = {
  host: process.env.CTP_AUTH_URL,
  projectKey: projectKey,
  credentials: {
    clientId: process.env.CTP_CLIENT_ID,
    clientSecret: process.env.CTP_CLIENT_SECRET,
  },
  fetch,
};

// Configure httpMiddlewareOptions
const httpMiddlewareOptions = {
  host: process.env.CTP_API_URL,
  fetch,
};

// Export the ClientBuilder
export const ctpClient = new ClientBuilder()
  .withProjectKey(projectKey) // .withProjectKey() is not required if the projectKey is included in authMiddlewareOptions
  .withClientCredentialsFlow(authMiddlewareOptions)
  .withHttpMiddleware(httpMiddlewareOptions)
  //.withLoggerMiddleware() // Include middleware for logging
  .build();