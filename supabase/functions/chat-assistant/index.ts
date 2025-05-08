
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = 'AIzaSyCj6SIxmupgV2Fg0mlUB_-joeU7L44jpDI';
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { query, messageHistory } = await req.json();
    
    // Get relevant product data from Supabase
    const { data: productData, error: productsError } = await supabaseClient
      .from("products")
      .select(`
        id, 
        title, 
        description, 
        price, 
        category, 
        shipping_info, 
        average_rating
      `)
      .limit(15);
      
    if (productsError) {
      console.error("Error fetching products:", productsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch product data" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
    
    // Get categories for context
    const { data: categories, error: categoriesError } = await supabaseClient
      .from("categories")
      .select("name")
      .limit(10);
    
    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
    }

    // Create context from the product data
    const productContext = productData.map(p => `
      Product: ${p.title}
      Description: ${p.description || 'No description available'}
      Price: $${p.price}
      Category: ${p.category}
      Rating: ${p.average_rating || 'No ratings yet'}
    `).join('\n\n');
    
    const categoriesContext = categories ? 
      `Available categories: ${categories.map(c => c.name).join(', ')}` : 
      '';

    // Prepare chat history context
    const historyContext = messageHistory && messageHistory.length > 0 ? 
      messageHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n') : 
      '';

    // Create the prompt for Gemini
    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `You are a helpful shopping assistant for our e-commerce marketplace. 
              Use ONLY the following product information to answer customer questions.
              If you don't know the answer based on the given product information, say "I don't have enough information about that".
              
              PRODUCT INFORMATION:
              ${productContext}
              
              ${categoriesContext}
              
              PREVIOUS CONVERSATION:
              ${historyContext}
              
              USER QUERY: ${query}`
            }
          ],
          role: "user"
        }
      ]
    };

    // Call the Gemini API
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
        JSON.stringify({ error: "Failed to generate response from Gemini" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    const result = await response.json();
    const assistantResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});
