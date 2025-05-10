import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// We're using Gemini API now
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyCj6SIxmupgV2Fg0mlUB_-joeU7L44jpDI';
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Function to extract search criteria from user query with improved criteria extraction
const extractSearchCriteria = (query) => {
  console.log("Extracting search criteria from query:", query);
  
  try {
    // Enhanced price range extraction
    // Standard range: "between X and Y"
    let priceRangePattern = /between\s+(\d+,?\d*)\s+and\s+(\d+,?\d*)\s+([A-Z]{3}|dollars|usd|kes|ksh|ssp|etb|rwf|ugx)/i;
    let priceRangeMatch = query.match(priceRangePattern);
    
    // Handle "below X" or "under X" pattern
    const belowPricePattern = /(below|under|less than|lee than)\s+(\d+,?\d*)\s+([A-Z]{3}|dollars|usd|kes|ksh|ssp|etb|rwf|ugx)/i;
    const belowPriceMatch = query.match(belowPricePattern);
    
    // Handle "above X" or "over X" or "more than X" pattern
    const abovePricePattern = /(above|over|more than)\s+(\d+,?\d*)\s+([A-Z]{3}|dollars|usd|kes|ksh|ssp|etb|rwf|ugx)/i;
    const abovePriceMatch = query.match(abovePricePattern);
    
    let minPrice = null;
    let maxPrice = null;
    let currency = null;
    
    if (priceRangeMatch) {
      // Regular price range
      minPrice = parseFloat(priceRangeMatch[1].replace(/,/g, ''));
      maxPrice = parseFloat(priceRangeMatch[2].replace(/,/g, ''));
      currency = normalizeCurrency(priceRangeMatch[3]);
    } else if (belowPriceMatch) {
      // Below a certain price
      minPrice = 0; // Start from zero
      maxPrice = parseFloat(belowPriceMatch[2].replace(/,/g, ''));
      currency = normalizeCurrency(belowPriceMatch[3]);
    } else if (abovePriceMatch) {
      // Above a certain price
      minPrice = parseFloat(abovePriceMatch[2].replace(/,/g, ''));
      maxPrice = 9999999; // A very high upper limit
      currency = normalizeCurrency(abovePriceMatch[3]);
    }
    
    // Country/location extraction
    const countryPattern = /in\s+([a-zA-Z\s]+?)(?:\s+between|\s+under|\s+over|$|\s+from|\s+with|\s+that|\s+and|\s+which)/i;
    const countryMatch = query.match(countryPattern);
    let country = null;
    
    if (countryMatch) {
      country = countryMatch[1].trim().toLowerCase();
      // Map common country names to our country IDs
      if (country.includes('kenya')) {
        country = '1'; // Kenya country_id
      } else if (country.includes('uganda')) {
        country = '2'; // Uganda country_id
      } else if (country.includes('south sudan') || country === 'juba') {
        country = '3'; // South Sudan country_id
      } else if (country.includes('ethiopia')) {
        country = '4'; // Ethiopia country_id 
      } else if (country.includes('rwanda')) {
        country = '5'; // Rwanda country_id
      }
    }
    
    // Region/district extraction - new!
    const regionPattern = /(?:in|from|at)\s+([a-zA-Z\s]+?)\s+(?:region|district|area|county)/i;
    const regionMatch = query.match(regionPattern);
    let region = null;
    
    if (regionMatch) {
      region = regionMatch[1].trim().toLowerCase();
    }
    
    // Date range extraction - new!
    let dateRange = null;
    
    if (query.toLowerCase().includes('today')) {
      dateRange = 'today';
    } else if (query.toLowerCase().includes('yesterday')) {
      dateRange = 'yesterday';
    } else if (query.toLowerCase().includes('this week')) {
      dateRange = 'this_week';
    } else if (query.toLowerCase().includes('last week')) {
      dateRange = 'last_week';
    } else if (query.toLowerCase().includes('this month')) {
      dateRange = 'this_month';
    } else if (query.toLowerCase().includes('last month')) {
      dateRange = 'last_month';
    }
    
    // "On offer" detection - new!
    const isOnOffer = /on\s+offer|special\s+offer|discount|sale/i.test(query);
    
    // Enhanced category extraction with multiple categories
    const categoryMapping = {
      'electronics': 'Electronics',
      'mobile': 'Electronics',
      'phone': 'Electronics',
      'smartphone': 'Electronics',
      'laptop': 'Electronics',
      'computer': 'Electronics',
      'tablet': 'Electronics',
      'tv': 'Electronics',
      'television': 'Electronics',
      'clothing': 'Clothing',
      'clothes': 'Clothing',
      'fashion': 'Clothing',
      'shoes': 'Clothing',
      'apparel': 'Clothing',
      'home': 'Home & Garden',
      'furniture': 'Home & Garden',
      'garden': 'Home & Garden',
      'kitchen': 'Home & Garden',
      'books': 'Books',
      'book': 'Books',
      'sports': 'Sports & Outdoors',
      'outdoor': 'Sports & Outdoors',
      'toys': 'Toys & Games',
      'games': 'Toys & Games',
      'health': 'Health & Beauty',
      'beauty': 'Health & Beauty',
      'personal care': 'Health & Beauty',
      'car': 'Automotive',
      'cars': 'Automotive',
      'vehicle': 'Automotive',
      'vehicles': 'Automotive',
      'automotive': 'Automotive',
      'food': 'Food & Beverages',
      'grocery': 'Food & Beverages',
      'drink': 'Food & Beverages',
      'beverage': 'Food & Beverages'
    };
    
    let category = null;
    
    // Check query words against our category mapping
    const queryWords = query.toLowerCase().split(' ');
    for (const word of queryWords) {
      if (categoryMapping[word]) {
        category = categoryMapping[word];
        break;
      }
    }
    
    // If no direct match found, try more complex phrases
    if (!category) {
      for (const [key, value] of Object.entries(categoryMapping)) {
        if (query.toLowerCase().includes(key)) {
          category = value;
          break;
        }
      }
    }
    
    // Extract product title specific keywords
    const titleKeywords = [];
    const productNames = [
      'iPhone', 'Samsung', 'Nokia', 'Huawei', 'Xiaomi', 'Tecno', 'Infinix', 
      'Sony', 'LG', 'Panasonic', 'Hisense', 'Dell', 'HP', 'Lenovo', 'Asus',
      'Toyota', 'Honda', 'Nissan', 'Mazda', 'Hyundai', 'Kia'
    ];
    
    for (const name of productNames) {
      if (query.toLowerCase().includes(name.toLowerCase())) {
        titleKeywords.push(name);
      }
    }
    
    console.log("Extracted search criteria:", { 
      minPrice, maxPrice, currency, country, region, category, 
      dateRange, isOnOffer, titleKeywords 
    });
    
    return { 
      minPrice, 
      maxPrice, 
      currency, 
      country, 
      region, 
      category, 
      dateRange,
      isOnOffer,
      titleKeywords
    };
  } catch (error) {
    console.error("Error extracting search criteria:", error);
    return { 
      minPrice: null, 
      maxPrice: null, 
      currency: null, 
      country: null, 
      region: null, 
      category: null,
      dateRange: null,
      isOnOffer: false,
      titleKeywords: []
    };
  }
};

// Helper function to normalize currency codes
const normalizeCurrency = (currencyStr) => {
  if (!currencyStr) return null;
  
  const normalized = currencyStr.toLowerCase();
  
  if (normalized === 'dollars' || normalized === 'usd') {
    return 'USD';
  } else if (normalized === 'kes' || normalized === 'ksh') {
    return 'KES';
  } else if (normalized === 'ssp') {
    return 'SSP';
  } else if (normalized === 'etb') {
    return 'ETB';
  } else if (normalized === 'rwf') {
    return 'RWF';
  } else if (normalized === 'ugx') {
    return 'UGX';
  }
  
  return currencyStr.toUpperCase();
};

// Helper function to get image URL from storage path
const getImageUrl = (supabaseClient, storagePath) => {
  if (!storagePath) return null;
  
  try {
    const { data } = supabaseClient.storage
      .from("images")
      .getPublicUrl(storagePath);
    
    return data?.publicUrl || null;
  } catch (error) {
    console.error("Error getting image URL:", error);
    return null;
  }
};

// Function to format product results into a nice response with detailed product information
const formatProductResults = (supabaseClient, products, originalCurrency, countryName = null) => {
  if (!products || products.length === 0) {
    // Provide brief response when no products are found
    let noResultsMessage = "Sorry, I don't have that item in stock at the moment. Would you like to see similar products instead?";
    return { 
      text: noResultsMessage,
      images: [],
      productDetails: []
    };
  }
  
  // Start building a formatted response - now much more concise
  let response = `Found ${products.length} products:`;
  const imageUrls = [];
  const productDetails = [];
  
  products.forEach((product) => {
    // Build product details object for the UI to use
    const productDetail = {
      id: product.id,
      title: product.title || "Unnamed product",
      price: product.price || 0,
      currency: product.currency || "USD",
      location: product.county || product.country_name || "Unknown location",
      inStock: product.in_stock !== false
    };
    
    // Get product image if available (just the main image)
    if (product.product_images && product.product_images.length > 0) {
      const mainImages = product.product_images
        .filter(img => img.is_main || img.display_order === 0)
        .sort((a, b) => (a.display_order || 99) - (b.display_order || 99));
      
      // Get the main image or first image
      const imageToShow = mainImages.length > 0 ? mainImages[0] : product.product_images[0];
      
      if (imageToShow?.storage_path) {
        const imageUrl = getImageUrl(supabaseClient, imageToShow.storage_path);
        if (imageUrl) {
          imageUrls.push(imageUrl);
          productDetails.push(productDetail);
        }
      }
    }
  });
  
  // Add very brief final note
  if (products.length > 0) {
    response += " Click on any product to see details.";
  }
  
  return { 
    text: response,
    images: imageUrls,
    productDetails: productDetails
  };
};

// Helper function to apply date range filters
const applyDateFilter = (query, dateRange) => {
  if (!dateRange) return query;
  
  const now = new Date();
  let startDate, endDate;
  
  switch (dateRange) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date();
      break;
    case 'yesterday':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'this_week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date();
      break;
    case 'last_week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - startDate.getDay() - 7);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() - endDate.getDay() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date();
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    default:
      return query;
  }
  
  return query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Chat assistant function called");
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let body;
    try {
      body = await req.json();
      console.log("Request body:", JSON.stringify(body));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
    
    const { query, messageHistory, userInfo } = body;
    
    if (!query || typeof query !== 'string') {
      console.error("Invalid query in request:", query);
      return new Response(
        JSON.stringify({ error: "Query is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
    
    // Get countries data for better context and display
    const { data: countries, error: countriesError } = await supabaseClient
      .from("countries")
      .select("id, name, code");
    
    if (countriesError) {
      console.error("Error fetching countries:", countriesError);
      // Continue with the process even if countries fetch fails
    }
    
    // Check if this is a product search query
    const productSearchPatterns = [
      /product/i, /item/i, /buy/i, /price/i, /cost/i, /how much/i, 
      /looking for/i, /search/i, /find/i, /where/i, /available/i, /stock/i,
      /between.*and/i, /under/i, /below/i, /cheaper/i, /expensive/i,
      /show me/i, /display/i, /picture/i, /image/i, /photo/i,
      /car/i, /mobile/i, /phone/i, /tv/i, /laptop/i, /electronics/i,
      /less than/i, /lee than/i, /juba/i, /from/i, /region/i, /district/i,
      /today/i, /yesterday/i, /this week/i, /last week/i, /offer/i, /discount/i
    ];
    
    const isProductSearch = productSearchPatterns.some(pattern => pattern.test(query));
    
    // If this appears to be a product search, handle it directly
    if (isProductSearch) {
      console.log("Detected product search query, processing directly...");
      
      // Extract search criteria from the query
      const { 
        minPrice, 
        maxPrice, 
        currency, 
        country, 
        region, 
        category,
        dateRange,
        isOnOffer, 
        titleKeywords 
      } = extractSearchCriteria(query);
      
      // Get country name for better error messages
      let countryName = null;
      if (country && countries) {
        const countryObj = countries.find(c => c.id.toString() === country);
        countryName = countryObj?.name;
      }
      
      try {
        // Start building the Supabase query
        console.log("Fetching product data from Supabase based on extracted criteria...");
        let productQuery = supabaseClient
          .from("products")
          .select(`
            id, 
            title, 
            description, 
            price, 
            category, 
            shipping_info, 
            average_rating,
            in_stock,
            currency,
            country_id,
            county,
            product_images (
              id,
              storage_path,
              is_main,
              display_order
            )
          `)
          .eq("product_status", "published");
        
        // Apply filters based on extracted criteria
        if (category) {
          productQuery = productQuery.eq("category", category);
        }
        
        // Apply title keyword search if available
        if (titleKeywords && titleKeywords.length > 0) {
          titleKeywords.forEach(keyword => {
            productQuery = productQuery.ilike('title', `%${keyword}%`);
          });
        }
        
        // Search for "Juba" specifically - common use case
        if (query.toLowerCase().includes('juba')) {
          productQuery = productQuery.eq("country_id", 3); // South Sudan ID
        } else if (country) {
          productQuery = productQuery.eq("country_id", parseInt(country));
        }
        
        // Apply region/district filter if available
        if (region) {
          productQuery = productQuery.ilike("county", `%${region}%`);
        }
        
        // Apply date range filter if specified
        if (dateRange) {
          productQuery = applyDateFilter(productQuery, dateRange);
        }
        
        // Handle price filtering (use original price in product's currency)
        if (minPrice !== null && maxPrice !== null && currency) {
          if (currency === 'USD') {
            // We need to convert USD range to the product's local currency for comparison
            const { data: currencyRates } = await supabaseClient
              .from('currencies')
              .select('code, rate')
              .eq('status', 'active');
            
            if (currencyRates && currencyRates.length > 0) {
              // Get USD rate
              const usdRate = currencyRates.find(c => c.code === 'USD')?.rate || 1;
              
              // Find products with prices in the range based on comparison in their native currency
              // This is a simplified approach - ideally we would do currency conversion properly
              productQuery = productQuery
                .gte('price', minPrice / (usdRate || 1) * 0.8) // Adding buffer for conversion variations
                .lte('price', maxPrice / (usdRate || 1) * 1.2);
            } else {
              // Fallback if we can't get rates
              productQuery = productQuery
                .gte('price', minPrice * 0.8)
                .lte('price', maxPrice * 1.2);
            }
          } else {
            // Direct comparison if using local currency
            productQuery = productQuery
              .gte('price', minPrice)
              .lte('price', maxPrice);
          }
        }
        
        // Get the matching products
        let { data: products, error: productsError } = await productQuery.limit(10);
        
        if (productsError) {
          throw productsError;
        }
        
        // Add country names for better display
        if (products && products.length > 0 && countries) {
          products = products.map(product => {
            const country = countries.find(c => c.id === product.country_id);
            return {
              ...product,
              country_name: country?.name || null
            };
          });
        }
        
        console.log(`Fetched ${products?.length || 0} matching products`);
        
        // Format the products into a nice response with images and product details
        const formattedResponse = formatProductResults(supabaseClient, products, currency, countryName);
        
        console.log("Formatted response:", {
          textLength: formattedResponse.text.length,
          imagesCount: formattedResponse.images.length,
          detailsCount: formattedResponse.productDetails.length
        });
        
        // Return the formatted response with images
        return new Response(
          JSON.stringify({ 
            response: formattedResponse.text,
            images: formattedResponse.images,
            productDetails: formattedResponse.productDetails
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        );
      } catch (err) {
        console.error("Error processing product search:", err);
        return new Response(
          JSON.stringify({
            response: "I'm having trouble finding products right now. Could you try again later or rephrase your question?",
            error: err.message || "Unknown error processing search"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        );
      }
    }
    
    // For non-product search queries, proceed with Gemini API
    try {
      // Get relevant product data from Supabase
      console.log("Fetching product data from Supabase...");
      const { data: productData, error: productsError } = await supabaseClient
        .from("products")
        .select(`
          id, 
          title, 
          description, 
          price, 
          category, 
          shipping_info, 
          average_rating,
          currency,
          country_id,
          product_images (
            id,
            storage_path,
            is_main,
            display_order
          )
        `)
        .limit(15);
        
      if (productsError) {
        throw productsError;
      }
      
      console.log(`Fetched ${productData?.length || 0} products`);
      
      // Get categories for context
      const { data: categories, error: categoriesError } = await supabaseClient
        .from("categories")
        .select("name")
        .limit(10);
      
      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        // Continue even if categories fail
      } else {
        console.log(`Fetched ${categories?.length || 0} categories`);
      }

      // Create context from the product data
      const productContext = productData.map(p => {
        // Format price with the product's native currency
        const formattedPrice = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: p.currency || 'SSP',
          maximumFractionDigits: 0
        }).format(p.price);
        
        // Get country name if available
        const countryName = countries?.find(c => c.id === p.country_id)?.name || 'Unknown location';
        
        // Get image URL if available
        const hasImages = p.product_images && p.product_images.length > 0;
        const imageInfo = hasImages ? 
          `Image URL: ${getImageUrl(supabaseClient, p.product_images[0].storage_path)}` : 
          'No image available';
        
        return `
        Product: ${p.title}
        Description: ${p.description || 'No description available'}
        Price: ${formattedPrice}
        Category: ${p.category}
        Country: ${countryName}
        Rating: ${p.average_rating || 'No ratings yet'}
        ${imageInfo}
      `}).join('\n\n');
      
      const categoriesContext = categories ? 
        `Available categories: ${categories.map(c => c.name).join(', ')}` : 
        '';
        
      const countriesContext = countries ?
        `Available countries: ${countries.map(c => c.name).join(', ')}` :
        '';

      // Prepare chat history context
      const historyContext = messageHistory && messageHistory.length > 0 ? 
        messageHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n') : 
        '';

      // Add user greeting if available
      const userGreeting = userInfo && userInfo.userName ? 
        `The user's name is ${userInfo.userName}. Always refer to them by name in a friendly manner when appropriate.` :
        '';

      // Create the prompt for Gemini with instructions to keep responses brief
      console.log("Preparing prompt for Gemini...");
      const prompt = {
        contents: [
          {
            parts: [
              {
                text: `You are a helpful, friendly and professional shopping assistant. 
                Use ONLY the product information provided to answer customer questions.
                If the user asks to see products or images, mention specific products from the list.
                
                ${userGreeting}
                
                VERY IMPORTANT INSTRUCTIONS:
                1. Keep your responses EXTREMELY brief - under 100 tokens (about 25 words).
                2. Focus on showing products rather than explaining them in detail.
                3. Always display prices in the product's original currency.
                4. Don't use markdown formatting, just simple text.
                5. If you don't know something, just say briefly "I don't have that information."
                
                PRODUCT INFORMATION:
                ${productContext}
                
                ${categoriesContext}
                
                ${countriesContext}
                
                PREVIOUS CONVERSATION:
                ${historyContext}
                
                USER QUERY: ${query}
                
                Remember to keep your response under 100 tokens / 25 words.
                If mentioning products, use their exact names so I can display them.`
              }
            ],
            role: "user"
          }
        ]
      };

      // Call the Gemini API with the correct model name
      console.log("Calling Gemini API...");
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(prompt)
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error("Gemini API error:", errorResponse);
        throw new Error("Failed to generate response from Gemini API: " + errorResponse);
      }

      const result = await response.json();
      console.log("Gemini API response received");
      
      // The text is located in a different path in the newer Gemini API
      let assistantResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
      
      // Enforce the token limit by truncating if needed (roughly 100 tokens)
      if (assistantResponse.length > 200) {
        assistantResponse = assistantResponse.substring(0, 200) + "...";
      }
      
      console.log("Assistant response:", assistantResponse.substring(0, 100) + "...");

      // Extract product names from the response to find relevant images and build product details
      const productNames = productData.map(p => p.title?.toLowerCase());
      const responseImages = [];
      const responseProductDetails = [];
      
      // Check if any product names are mentioned in the response
      for (const product of productData) {
        if (!product.title || !product.product_images || product.product_images.length === 0) continue;
        
        if (assistantResponse.toLowerCase().includes(product.title.toLowerCase())) {
          // Get main images first, fallback to any image
          const mainImages = product.product_images.filter(img => img.is_main || img.display_order === 0);
          const imageToUse = mainImages.length > 0 ? mainImages[0] : product.product_images[0];
          
          if (imageToUse?.storage_path) {
            const imageUrl = getImageUrl(supabaseClient, imageToUse.storage_path);
            if (imageUrl && !responseImages.includes(imageUrl)) {
              responseImages.push(imageUrl);
              
              // Add product details
              const countryName = countries?.find(c => c.id === product.country_id)?.name || 'Unknown location';
              
              responseProductDetails.push({
                id: product.id,
                title: product.title,
                price: product.price || 0,
                currency: product.currency || "USD", 
                location: countryName,
                inStock: product.in_stock !== false
              });
              
              // Limit to 4 images maximum
              if (responseImages.length >= 4) break;
            }
          }
        }
      }
      
      console.log(`Found ${responseImages.length} relevant product images to include in response`);

      return new Response(
        JSON.stringify({ 
          response: assistantResponse,
          images: responseImages.length > 0 ? responseImages : undefined,
          productDetails: responseProductDetails.length > 0 ? responseProductDetails : undefined
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    } catch (err) {
      console.error("Error in Gemini API process:", err);
      return new Response(
        JSON.stringify({ 
          response: "I'm sorry, but I'm having trouble connecting to my knowledge base right now. Could you try asking again in a moment?",
          error: err.message || "Error processing with Gemini API" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ 
        response: "I'm sorry, I encountered an unexpected error. Please try again later.",
        error: error.message || "An unknown error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});
