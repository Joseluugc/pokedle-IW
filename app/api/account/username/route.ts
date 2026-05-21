import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { createServiceClient } from "@/libs/supabase/service";

export const dynamic = "force-dynamic";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export async function PATCH(req: Request) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
    }

    const body = (await req.json().catch((): unknown => null)) as
      | { username?: unknown }
      | null;
    const rawUsername =
      typeof body?.username === "string" ? body.username.trim() : "";

    if (!USERNAME_REGEX.test(rawUsername)) {
      return NextResponse.json(
        {
          ok: false,
          error: "El nombre de usuario debe tener entre 3 y 20 caracteres (letras, números o _).",
        },
        { status: 400 }
      );
    }

    const service = createServiceClient();

    const { data: existing, error: lookupError } = await service
      .from("perfiles")
      .select("id")
      .eq("username", rawUsername)
      .neq("id", user.id)
      .maybeSingle();

    if (lookupError) {
      throw new Error(`Error comprobando disponibilidad: ${lookupError.message}`);
    }

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Ese nombre de usuario ya está en uso." },
        { status: 409 }
      );
    }

    const { error: updateError } = await service
      .from("perfiles")
      .update({ username: rawUsername })
      .eq("id", user.id);

    if (updateError) {
      throw new Error(`Error actualizando perfil: ${updateError.message}`);
    }

    await authClient.auth.updateUser({ data: { username: rawUsername } });

    return NextResponse.json({ ok: true, username: rawUsername });
  } catch (error) {
    console.error("Error actualizando username:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo actualizar el nombre de usuario." },
      { status: 500 }
    );
  }
}
