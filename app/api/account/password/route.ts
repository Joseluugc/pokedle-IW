import { NextResponse } from "next/server";
import { createClient as createSupabaseAnonClient } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user || !user.email) {
      return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
    }

    const identities = user.identities ?? [];
    const hasPasswordProvider = identities.some((identity) => identity.provider === "email");

    if (!hasPasswordProvider) {
      return NextResponse.json(
        {
          ok: false,
          error: "Tu cuenta utiliza inicio de sesión externo (Google). No puedes cambiar la contraseña aquí.",
        },
        { status: 400 }
      );
    }

    const body = (await req.json().catch((): unknown => null)) as
      | { currentPassword?: unknown; newPassword?: unknown }
      | null;
    const currentPassword =
      typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { ok: false, error: "Debes indicar la contraseña actual y la nueva." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { ok: false, error: "La nueva contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { ok: false, error: "La nueva contraseña debe ser distinta a la actual." },
        { status: 400 }
      );
    }

    // Verificar la contraseña actual en un cliente independiente para no afectar a la sesión activa.
    const verifierClient = createSupabaseAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { error: signInError } = await verifierClient.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { ok: false, error: "La contraseña actual no es correcta." },
        { status: 400 }
      );
    }

    const { error: updateError } = await authClient.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw new Error(`Error actualizando contraseña: ${updateError.message}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error actualizando contraseña:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo actualizar la contraseña." },
      { status: 500 }
    );
  }
}
