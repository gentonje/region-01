import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This function runs on a schedule to check for expired products
// and update their status to 'draft' when they expire
Deno.serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date().toISOString();
    
    // Find all published products that have expired
    const { data, error } = await supabaseClient
      .from("products")
      .select("id")
      .eq("product_status", "published")
      .lt("expires_at", now);
      
    if (error) {
      console.error("Error checking expired products:", error);
      return new Response(JSON.stringify({ error: 'Error checking expired products' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    if (data && data.length > 0) {
      // Update status of expired products to unpublished
      const productIds = data.map(product => product.id);
      const { error: updateError } = await supabaseClient
        .from("products")
        .update({ product_status: "draft" })
        .in("id", productIds);
        
      if (updateError) {
        console.error("Error unpublishing expired products:", updateError);
        return new Response(JSON.stringify({ error: 'Error unpublishing expired products' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 500
        });
      }
      
      console.log(`Unpublished ${data.length} expired products`);
      return new Response(JSON.stringify({ message: `Unpublished ${data.length} expired products` }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ message: 'No expired products found' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: 'Function error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
})
