// Implement google retail product update/creation
import 'dotenv/config'

import {getCategory} from './ct-category.mjs'
import {productServiceClient} from './gProductServiceClient.mjs'

const projectId = process.env.PROJECT_ID
const location = process.env.LOCATION
const catalog = process.env.CATALOG
const branch = process.env.BRANCH



// Build Google Retail Product (with Variants) based on the commercetools Product (Fashion Product including custom arguments)
// https://cloud.google.com/retail/docs/reference/rpc/google.cloud.retail.v2#product

export  async function productMapper(ctProduct){
    const product = {};
    const masterVariant = ctProduct.productProjection.masterVariant
    const masterSKU = masterVariant.sku
     
    // Build a productName path 
     const productName = productServiceClient.productPath(projectId, location, catalog,branch,masterSKU)

    product.language_code = process.env.LANGUAGE_CODE;
    product.name = productName // 'projects/'+projectId+'/locations/'+location+'/catalogs/'+catalog+'/branches/'+branch+'/products/'+masterSKU
    product.uri = process.env.PRODUCT_URL+masterSKU
    product.id = masterSKU
    product.type =  "PRIMARY" 
    product.primaryProductId = masterSKU
    product.brands = [];
    product.attributes = {};
    product.tags = [];

    product.title = ctProduct.productProjection.name[process.env.LANGUAGE];
    product.description = ctProduct.productProjection.description[process.env.LANGUAGE];

    
   
    // Keywords (only build if not empty for the catalog language)
    if(ctProduct.productProjection.searchKeywords[process.env.LANGUAGE] && ctProduct.productProjection.searchKeywords[process.env.LANGUAGE].length !== 0 ){
        product.attributes.keywords= {};
        product.attributes.keywords.text= [];
        for(const keyword of ctProduct.productProjection.searchKeywords[process.env.LANGUAGE]){
            product.attributes.keywords.text.push(keyword.text)  
        }
        product.tags = product.attributes.keywords.text;  
    }
    
    // Prices
    if(masterVariant.prices.length !== 0){
        for (const priceRow of masterVariant.prices) {
            if(priceRow.value.currencyCode ===  process.env.CURRENCY){
                product.priceInfo = {
                    currencyCode: 'AUD',
                    price: parseFloat(priceRow.value.centAmount)/100,
                    originalPrice: parseFloat(priceRow.value.centAmount)/100,
                    cost: (parseFloat(priceRow.value.centAmount) * 0.1)/100
                  };
            }
        }
    }

    // Images
    if(masterVariant.images.length !== 0){
        product.images = [];
        let image = {}
        image.uri = masterVariant.images[0].url;
        image.height = 320;
        image.width = 320; 
        product.images.push(image)
    }

    // Availability
    if(masterVariant.availability){
        if(masterVariant.availability.isOnStock){
            product.availableQuantity =  {value: masterVariant.availability.availableQuantity };
            product.availability = "IN_STOCK";
        }
    }else{
        product.availableQuantity = 1000;
    }

    //TODO: pull category name from ct and build path
    product.categories = [];
    await buildCategories(ctProduct,product)
   
   

    fillCustomAttributes(masterVariant.attributes,product)

    // build variants array
    let productVariant = {};
    product.variants =[];
    if(ctProduct.productProjection.variants.length !== 0){
        for(const ctVariant of ctProduct.productProjection.variants){
            productVariant = buildGoogleProductVariant(product,ctVariant)
            product.variants.push(productVariant)
        }
    }
    
    return product
  }

  // Returns google retail product without master attributes based on on variant data from ct
  // & copies all attributes from MasterVariant, replace the variant specific to buld another full Product object for Google
  function buildGoogleProductVariant(gProduct,ctVariant){
    
    const googleProduct = JSON.parse(JSON.stringify(gProduct));
    googleProduct.variants =[];
    googleProduct.type = "VARIANT"

    const sku = ctVariant.sku
    const productName = productServiceClient.productPath(projectId, location, catalog,branch,sku)
   
    googleProduct.language_code = process.env.LANGUAGE_CODE;
    googleProduct.name = productName
    googleProduct.uri = process.env.PRODUCT_URL+sku
    googleProduct.id = sku

    if(ctVariant.prices.length !== 0){
        for (const priceRow of ctVariant.prices) {
            if(priceRow.value.currencyCode ===  process.env.CURRENCY){
                googleProduct.priceInfo = {
                    currencyCode: 'AUD',
                    price: parseFloat(priceRow.value.centAmount)/100,
                    originalPrice: parseFloat(priceRow.value.centAmount)/100,
                    cost: (parseFloat(priceRow.value.centAmount) * 0.1)/100
                  };
            }
        }
    }
    

    if(ctVariant.images.length !== 0){
        googleProduct.images = [];
        let image = {}
        image.uri = ctVariant.images[0].url;
        image.height = 320;
        image.width = 320; 
        googleProduct.images.push(image)
    }

    const ctAttributeMap = ctVariant.attributes
    fillCustomAttributes(ctAttributeMap,googleProduct)

    if(ctVariant.availability){
        if(ctVariant.availability.isOnStock){
            googleProduct.availableQuantity =  {value: ctVariant.availability.availableQuantity };
            googleProduct.availability = "IN_STOCK";
        }
    }else{
        googleProduct.availableQuantity = 1000;
    }

    return googleProduct
  }

  // Function to ill custom attributes 
  // TODO: refracto to loop over all custom attributes and build it dynamically
  function fillCustomAttributes(ctAttributeMap,googleProduct){
    let brand;

    if(ctAttributeMap.length !== 0){
        let text = []
        for(const attr of ctAttributeMap){
            switch(attr.name) {
                case "fp_size":
                    text = []
                    text.push(attr.value.label)
                    googleProduct.attributes['size'] = {text};
                    break;
                 case "fp_color":
                    text = []
                    text.push(attr.value.label[process.env.LANGUAGE])   
                    googleProduct.attributes['color'] = {text};
                    let colors = text
                    const gColorInfo = {colors}
                    googleProduct.colorInfo = gColorInfo
                    break;
                case "fp_manufacturer":
                    text = []
                    text.push(attr.value.label)  
                    googleProduct.attributes['brand'] = {text};
                    brand = attr.value.label;
                    break;
                case "gender":
                    text = []
                    text.push(attr.value.label)  
                    googleProduct.attributes['gender'] = {text};
                    break;    
                case "season":
                    text = []
                    text.push(attr.value.label)  
                    googleProduct.attributes['season'] ={text};           
                    break;     
            }
        }
    
    }
    // Brands filled with manafacturer attribute
    if(brand && googleProduct.brands.length === 0 ){
        googleProduct.brands.push(brand)
    }

  }


// Builds and hierarchy of categories accordingly to below schema, also adding category name as Tag property entry
//   "categories": [
//     "Shoes & Accessories > Shoes",
//     "Sports & Fitness > Athletic Clothing > Shoes"
//   ]

  async function buildCategories(ctProduct,product){
    try{
        let ctCategories = ctProduct.productProjection.categories;

        // If no category on commercetools then assign Default
        if(!ctProduct.productProjection.categories){
            product.categories.push(process.env.CATEGORY_DEFAULT);
            return 
        }

        for(const category of ctCategories){
            let categoryPath = "";
            let catId = category.id;
            let ctCategory = await getCategory(catId);
            let catName = ctCategory.name[process.env.LANGUAGE];

            categoryPath = catName;
            product.tags.push(catName);

            if(ctCategory.ancestors.length !== 0){
              
                for (var i = ctCategory.ancestors.length - 1; i >= 0; i--) {

                       let ctAncCategory = await  getCategory(ctCategory.ancestors[i].id);
                        let parentName = ctAncCategory.name[process.env.LANGUAGE]
                        product.tags.push(parentName);
                        categoryPath = parentName + " > " + categoryPath
                        };
        
            }

            product.categories.push(categoryPath);
        }

       }catch(err) {
        console.log("Error pulling categories from commercetools " +err)
        product.categories.push(process.env.CATEGORY_DEFAULT);
        return 
       }
  }