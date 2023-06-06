import 'dotenv/config'

import {productMapper} from './productConverter.mjs'
import {productServiceClient} from './gProductServiceClient.mjs'




// TODO:
// category call to CT API
// tags - fill with categories
// new product vs update flow
// Only react on product published


export const lambdaHandler = async (event) => {

    if(event.type !== "ProductPublished") {
        return {
            'statusCode': 200,
            'body': 'This event is being ignored: ' + event.type
        }       
    }

    try {

        const response = await updateProduct(event);

        return {
            'statusCode': 200,
            'body': JSON.stringify({
                product:  response,
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }
};


async function updateProduct(eventData) {


    // Build Google Product out of CT product
    const gProduct =  await productMapper(eventData)

    console.log("");
    console.log("************");
    console.log("");
    // console.log(JSON.stringify(eventData))
   // console.log(JSON.stringify(gProduct));
    console.log("");
  
    // Create a product update/create request, allow for creating new products
    const request = {
      product: gProduct,
      allowMissing: true
    };
  
    try {
      console.log("*** Google Retail Catalog Product update/create request with product ID: " + gProduct.id);
      const [newProduct] = await productServiceClient.updateProduct(request);
      console.log('Product updated/created succesfully' + newProduct.name );
      return newProduct
    } catch (err) {
      console.error('Error updating product:', err);
      return false
    }
  }

  