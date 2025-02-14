import { supabase } from '../supabaseClient';

export async function fetchProducts() {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    if (error.message.includes('Refresh Token Not Found')) {
      // Redirect to login or notify the user to re-login
      window.location.href = '/login';
    }
    console.error('Error fetching products:', error);
  }
} 