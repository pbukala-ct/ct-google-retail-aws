import 'dotenv/config'
import { ctpClient } from "./ct-client.mjs";
import {
  ApiRoot,
  createApiBuilderFromCtpClient,
} from '@commercetools/platform-sdk';

// Create apiRoot from the imported ClientBuilder and include your Project key
const apiRoot = createApiBuilderFromCtpClient(ctpClient)
  .withProjectKey({ projectKey: process.env.CTP_PROJECT_KEY });


export async function getCategory(categoryId) {
    try {
      const category = await apiRoot
          .categories()
          .withId({ ID: categoryId })
          .get()
          .execute()
      return category.body
    } catch (err) {
      if (err.statusCode === 404) {
          return null
      }
      throw err
    }
  }


  