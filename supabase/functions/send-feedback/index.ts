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
    const { name, email, type, message }: FeedbackRequest = await req.json();

    console.log("Received feedback request:", { name, email, type, messageLength: message.length });

    // Validate required fields
    if (!name || !email || !type || !message) {
      console.error("Missing required fields:", { name: !!name, email: !!email, type: !!type, message: !!message });
      throw new Error("Todos os campos são obrigatórios");
    }

    // Insert feedback into database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
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
      throw new Error("Erro ao salvar feedback no banco de dados");
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
      JSON.stringify({ error: error.message || "Erro ao enviar feedback" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
