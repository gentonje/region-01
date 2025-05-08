
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// We're using Gemini API now
const GEMINI_API_KEY = 'AIzaSyCj6SIxmupgV2Fg0mlUB_-joeU7L44jpDI';
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Function to extract search criteria from user query
const extractSearchCriteria = (query) => {
  console.log("Extracting search criteria from query:", query);
  
  // Price extraction
  const pricePattern = /between\s+(\d+,?\d*)\s+and\s+(\d+,?\d*)\s+([A-Z]{3}|dollars|usd|kes)/i;
  const priceMatch = query.match(pricePattern);
  let minPrice = null;
  let maxPrice = null;
  let currency = null;
  
  if (priceMatch) {
    minPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
    maxPrice = parseFloat(priceMatch[2].replace(/,/g, ''));
    
    // Normalize currency
    if (priceMatch[3].toLowerCase() === 'dollars' || priceMatch[3].toLowerCase() === 'usd') {
      currency = 'USD';
    } else if (priceMatch[3].toLowerCase() === 'kes') {
      currency = 'KES';
    } else {
      currency = priceMatch[3].toUpperCase();
    }
  }
  
  // Country/location extraction
  const countryPattern = /in\s+([a-zA-Z\s]+?)(?:\s+between|\s+under|\s+over|$)/i;
  const countryMatch = query.match(countryPattern);
  let country = null;
  
  if (countryMatch) {
    country = countryMatch[1].trim().toLowerCase();
    // Map common country names to our country IDs
    if (country.includes('kenya')) {
      country = '1'; // Kenya country_id
    } else if (country.includes('rwanda')) {
      country = '2'; // Rwanda country_id
    } else if (country.includes('south sudan')) {
      country = '3'; // South Sudan country_id
    } else if (country.includes('uganda')) {
      country = '4'; // Uganda country_id
    }
  }
  
  // Category extraction
  const categories = [
    'electronics', 'clothing', 'home & garden', 'books', 'sports & outdoors', 
    'toys & games', 'health & beauty', 'automotive', 'food & beverages', 'cars', 'vehicles'
  ];
  
  let category = null;
  
  // Check for categories in the query
  for (const cat of categories) {
    if (query.toLowerCase().includes(cat)) {
      // Map common category variations
      if (cat === 'cars' || cat === 'vehicles') {
        category = 'Automotive';
      } else {
        // Capitalize first letter of each word
        category = cat.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
      break;
    }
  }
  
  console.log("Extracted search criteria:", { 
    minPrice, maxPrice, currency, country, category 
  });
  
  return { minPrice, maxPrice, currency, country, category };
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

// Function to format product results into a nice response
const formatProductResults = (supabaseClient, products, originalCurrency) => {
  if (!products || products.length === 0) {
    return { 
      text: "I couldn't find any products matching your criteria. Could you try a different search or provide more details?",
      images: []
    };
  }
  
  // Start building a formatted response
  let response = `I found ${products.length} products matching your criteria:`;
  const imageUrls = [];
  
  products.forEach((product, index) => {
    // Format price based on the product's currency
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'USD',
      maximumFractionDigits: 0
    }).format(product.price);
    
    response += `\n\n${product.title}`;
    if (product.description) {
      response += `\n${product.description}`;
    }
    response += `\nPrice: ${formattedPrice}`;
    if (product.category) {
      response += `\nCategory: ${product.category}`;
    }
    if (product.shipping_info) {
      response += `\nShipping: ${product.shipping_info}`;
    }
    if (product.average_rating) {
      response += `\nRating: ${product.average_rating} stars`;
    }
    
    // Add availability info
    response += product.in_stock ? "\nStatus: In Stock" : "\nStatus: Out of Stock";
    
    // Get product image if available
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
        }
      }
    }
    
    // Add separator between products except for the last one
    if (index < products.length - 1) {
      response += "\n---";
    }
  });
  
  // Add a final note if we found products
  if (products.length > 0) {
    response += "\n\nWould you like more information about any of these products?";
  }
  
  return { 
    text: response,
    images: imageUrls
  };
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
    
    const { query, messageHistory } = body;
    
    if (!query || typeof query !== 'string') {
      console.error("Invalid query in request:", query);
      return new Response(
        JSON.stringify({ error: "Query is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
    
    // Check if this is a product search query
    const productSearchPatterns = [
      /car/i, /product/i, /item/i, /buy/i, /price/i, /cost/i, /how much/i, 
      /looking for/i, /search/i, /find/i, /where/i, /available/i, /stock/i,
      /between.*and/i, /under/i, /below/i, /cheaper/i, /expensive/i,
      /show me/i, /display/i, /pictures?/i, /images?/i, /photos?/i
    ];
    
    const isProductSearch = productSearchPatterns.some(pattern => pattern.test(query));
    
    // If this appears to be a product search, handle it directly
    if (isProductSearch) {
      console.log("Detected product search query, processing directly...");
      
      // Extract search criteria from the query
      const { minPrice, maxPrice, currency, country, category } = extractSearchCriteria(query);
      
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
      
      if (country) {
        productQuery = productQuery.eq("country_id", parseInt(country));
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
      const { data: products, error: productsError } = await productQuery.limit(5);
      
      if (productsError) {
        console.error("Error fetching products:", productsError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch product data" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        );
      }
      
      console.log(`Fetched ${products?.length || 0} matching products`);
      
      // Format the products into a nice response with images
      const formattedResponse = formatProductResults(supabaseClient, products, currency);
      
      console.log("Formatted response with images:", {
        textLength: formattedResponse.text.length,
        imagesCount: formattedResponse.images.length
      });
      
      // Return the formatted response with images
      return new Response(
        JSON.stringify({ 
          response: formattedResponse.text,
          images: formattedResponse.images 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
    
    // For non-product search queries, proceed with Gemini API as before
    
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
      console.error("Error fetching products:", productsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch product data" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
    
    console.log(`Fetched ${productData?.length || 0} products`);
    
    // Get categories for context
    const { data: categories, error: categoriesError } = await supabaseClient
      .from("categories")
      .select("name")
      .limit(10);
    
    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
    } else {
      console.log(`Fetched ${categories?.length || 0} categories`);
    }

    // Get country information
    const { data: countries, error: countriesError } = await supabaseClient
      .from("countries")
      .select("id, name, code")
      .limit(10);
    
    if (countriesError) {
      console.error("Error fetching countries:", countriesError);
    } else {
      console.log(`Fetched ${countries?.length || 0} countries`);
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

    // Create the prompt for Gemini
    console.log("Preparing prompt for Gemini...");
    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `You are a helpful shopping assistant for our e-commerce marketplace. 
              Use ONLY the following product information to answer customer questions.
              If the user asks to see products or images, make sure to mention specific products from the list so they will be shown.
              If you don't know the answer based on the given product information, say "I don't have enough information about that".
              
              YOUR GOAL: Always provide beautifully formatted responses with clear product details, properly aligned text, and good organization. DO NOT use markdown, just use clean text formatting with proper spacing and separators.
              
              IMPORTANT: Always display prices in the product's original currency, not converted.
              
              PRODUCT INFORMATION:
              ${productContext}
              
              ${categoriesContext}
              
              ${countriesContext}
              
              PREVIOUS CONVERSATION:
              ${historyContext}
              
              USER QUERY: ${query}
              
              Remember to format your response beautifully, without using markdown syntax!
              If the user is asking about specific products, mention the exact product names so that I can display their images.`
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
      return new Response(
        JSON.stringify({ error: "Failed to generate response from Gemini API" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    const result = await response.json();
    console.log("Gemini API response received");
    
    // The text is located in a different path in the newer Gemini API
    const assistantResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
    console.log("Assistant response:", assistantResponse.substring(0, 100) + "...");

    // Extract product names from the response to find relevant images
    const productNames = productData.map(p => p.title?.toLowerCase());
    const responseImages = [];
    
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
        images: responseImages.length > 0 ? responseImages : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});
