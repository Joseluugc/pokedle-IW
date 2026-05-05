import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/libs/supabase/server";
import config from "@/config";
import { createClient as createSupabaseClient, type User } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

async function ensureProfileExists(user: User) {
  if (!user.email) return;

  const username =
    user.user_metadata?.username ??
    user.user_metadata?.preferred_username ??
    user.user_metadata?.user_name ??
    user.user_metadata?.name ??
    user.user_metadata?.full_name ??
    user.email;

  const profilePayload = {
    id: user.id,
    email: user.email,
    username,
  };

  // Preferimos service role para evitar bloqueos por RLS en inserción.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceRoleKey) {
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    const { error } = await adminSupabase
      .from("perfiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (error) {
      console.error("Error guardando perfil (service role):", error.message);
    }

    return;
  }

  // Fallback si no existe service role en entorno.
  const supabase = await createClient();
  const { error } = await supabase
    .from("perfiles")
    .upsert(profilePayload, { onConflict: "id" });

  if (error) {
    console.error("Error guardando perfil:", error.message);
  }
}

// This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await ensureProfileExists(user);
      }
    } else {
      console.error("Error intercambiando code por sesión:", error.message);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + config.auth.callbackUrl);
}
