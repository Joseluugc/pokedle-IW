import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import { createServiceClient } from "@/libs/supabase/service";
import SettingsClient from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

type PerfilRow = {
  username: string;
  email: string;
  racha_actual: number | null;
  racha_maxima: number | null;
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const service = createServiceClient();
  const { data: perfil } = await service
    .from("perfiles")
    .select("username, email, racha_actual, racha_maxima")
    .eq("id", user.id)
    .maybeSingle<PerfilRow>();

  const identities = user.identities ?? [];
  const hasPasswordProvider = identities.some((identity) => identity.provider === "email");
  const oauthProviders = identities
    .filter((identity) => identity.provider !== "email")
    .map((identity) => identity.provider);

  return (
    <SettingsClient
      initialUsername={perfil?.username ?? user.email?.split("@")[0] ?? "Trainer"}
      email={perfil?.email ?? user.email ?? ""}
      rachaActual={perfil?.racha_actual ?? 0}
      rachaMaxima={perfil?.racha_maxima ?? 0}
      hasPasswordProvider={hasPasswordProvider}
      oauthProviders={oauthProviders}
    />
  );
}
