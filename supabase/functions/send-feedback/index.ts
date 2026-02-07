import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fallback emails if we can't fetch admins
const FALLBACK_EMAILS = ["zaksduwe@gmail.com"];

interface FeedbackRequest {
  name: string;
  email: string;
  type: "bug" | "suggestion" | "compliment" | "other";
  message: string;
}

const feedbackTypeLabels = {
  bug: "🐛 Bug / Problema",
  suggestion: "💡 Sugestão de Melhoria",
  compliment: "⭐ Elogio",
  other: "📝 Outro",
};

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

    // Get admin emails from database
    let adminEmails: string[] = [];
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get admin user IDs first
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminRoles && adminRoles.length > 0) {
        const adminUserIds = adminRoles.map(r => r.user_id);
        
        // Get emails from profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email')
          .in('user_id', adminUserIds);

        if (profiles && profiles.length > 0) {
          adminEmails = profiles.map(p => p.email).filter(Boolean) as string[];
        }
      }
    } catch (e) {
      console.error("Error fetching admin emails:", e);
    }

    // Use fallback if no admin emails found
    if (adminEmails.length === 0) {
      adminEmails = FALLBACK_EMAILS;
    }

    console.log("Sending feedback to admins:", adminEmails);

    const emailResponse = await resend.emails.send({
      from: "Manual ETEC <onboarding@resend.dev>",
      to: adminEmails,
      replyTo: email,
      subject: `[Manual ETEC] ${feedbackTypeLabels[type]} - Novo Feedback`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0A3D62 0%, #1E5F74 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #0A3D62; }
            .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border: 1px solid #eee; }
            .message-box { white-space: pre-wrap; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📬 Novo Feedback Recebido</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Manual ETEC - Plataforma Educacional</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Tipo de Feedback:</div>
                <div class="value">${feedbackTypeLabels[type]}</div>
              </div>
              <div class="field">
                <div class="label">Nome:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Mensagem:</div>
                <div class="value message-box">${message}</div>
              </div>
            </div>
            <div class="footer">
              <p>Este email foi enviado automaticamente pelo sistema de feedback do Manual ETEC.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Feedback email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
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
