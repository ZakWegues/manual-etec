import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FeedbackRequest {
  name: string;
  email: string;
  type: "bug" | "suggestion" | "compliment" | "other";
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: 'Autenticação necessária' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with user's token for auth verification
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Client for auth verification (with user token)
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // Client for database operations (bypasses RLS after auth is verified)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: 'Autenticação inválida' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Authenticated user:", user.id);

    const { name, email, type, message }: FeedbackRequest = await req.json();

    console.log("Received feedback request:", { name, email, type, messageLength: message.length });

    // Validate required fields
    if (!name || !email || !type || !message) {
      console.error("Missing required fields:", { name: !!name, email: !!email, type: !!type, message: !!message });
      return new Response(
        JSON.stringify({ error: "Todos os campos são obrigatórios" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate field types
    if (typeof name !== 'string' || typeof email !== 'string' || typeof type !== 'string' || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: "Dados inválidos" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate name length
    if (name.length > 200) {
      return new Response(
        JSON.stringify({ error: "Nome muito longo. Máximo de 200 caracteres." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email length
    if (email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Email muito longo. Máximo de 255 caracteres." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate message length
    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Mensagem muito longa. Máximo de 5000 caracteres." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate feedback type
    const validTypes = ['bug', 'suggestion', 'compliment', 'other'];
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: "Tipo de feedback inválido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Insert feedback into database using the authenticated client
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .insert({
        name,
        email,
        type,
        message,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting feedback:", error);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar feedback no banco de dados" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Feedback saved successfully:", data.id);

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-feedback function:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao enviar feedback" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
