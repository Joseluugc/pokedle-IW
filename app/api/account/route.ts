import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { createServiceClient } from "@/libs/supabase/service";

export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    const authClient = await createClient();
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          ok: false,
          error: "El servidor no está configurado para eliminar cuentas. Falta SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 500 }
      );
    }

    const service = createServiceClient();

    // Eliminamos primero los datos derivados (las FKs no tienen ON DELETE CASCADE en perfiles).
    await service.from("perfiles").delete().eq("id", user.id);

    const { error: deleteError } = await service.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throw new Error(`Error eliminando usuario: ${deleteError.message}`);
    }

    await authClient.auth.signOut();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando cuenta:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo eliminar la cuenta." },
      { status: 500 }
    );
  }
}
