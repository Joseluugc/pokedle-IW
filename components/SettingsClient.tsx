"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type SettingsClientProps = {
  initialUsername: string;
  email: string;
  rachaActual: number;
  rachaMaxima: number;
  hasPasswordProvider: boolean;
  oauthProviders: string[];
};

const prettifyProvider = (provider: string) =>
  provider.charAt(0).toUpperCase() + provider.slice(1);

const SettingsClient = ({
  initialUsername,
  email,
  rachaActual,
  rachaMaxima,
  hasPasswordProvider,
  oauthProviders,
}: SettingsClientProps) => {
  const router = useRouter();

  const [username, setUsername] = useState(initialUsername);
  const [displayUsername, setDisplayUsername] = useState(initialUsername);
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUsernameSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || trimmed === displayUsername) return;

    setIsSavingUsername(true);
    try {
      const res = await fetch("/api/account/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.ok) {
        toast.error(payload?.error ?? "No se pudo actualizar el nombre de usuario.");
        return;
      }
      setDisplayUsername(payload.username);
      setUsername(payload.username);
      toast.success("Nombre de usuario actualizado.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.ok) {
        toast.error(payload?.error ?? "No se pudo actualizar la contraseña.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Contraseña actualizada.");
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDeleteText !== "ELIMINAR") {
      toast.error('Escribe "ELIMINAR" para confirmar.');
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok || !payload?.ok) {
        toast.error(payload?.error ?? "No se pudo eliminar la cuenta.");
        return;
      }
      toast.success("Cuenta eliminada. ¡Hasta pronto!");
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-yellow-100 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-yellow-300/80 hover:text-yellow-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z" clipRule="evenodd" />
              </svg>
              Inicio
            </Link>
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-yellow-300">
              Configuración de la cuenta
            </h1>
            <p className="mt-2 text-yellow-100/70">
              Gestiona tu perfil de entrenador{" "}
              <span className="font-semibold text-yellow-200">@{displayUsername}</span>{" "}
              <span className="text-yellow-100/40">· {email}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KpiCard
              label="Racha actual"
              value={rachaActual}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.546 3.75 3.75 0 013.255 3.718z" clipRule="evenodd" />
                </svg>
              }
              accent="from-orange-500/20 to-red-500/10 border-orange-400/40 text-orange-300"
            />
            <KpiCard
              label="Mejor racha"
              value={rachaMaxima}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15.75a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" />
                </svg>
              }
              accent="from-yellow-500/20 to-amber-500/10 border-yellow-400/40 text-yellow-300"
            />
          </div>
        </header>

        <SettingsCard
          title="Nombre de usuario"
          description="Tu @usuario es visible en el ranking y en las publicaciones del foro."
        >
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs uppercase tracking-wider text-yellow-200/60 mb-1">
                Nuevo nombre de usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                className="w-full rounded-lg border border-yellow-500/30 bg-black/40 px-4 py-2 text-yellow-100 focus:border-yellow-400 focus:outline-none transition-colors"
                placeholder="ash_ketchum"
              />
              <p className="mt-1 text-xs text-yellow-100/40">
                3–20 caracteres. Solo letras, números y guion bajo.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingUsername || username.trim() === displayUsername || !username.trim()}
                className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingUsername ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </SettingsCard>

        <SettingsCard
          title="Contraseña"
          description={
            hasPasswordProvider
              ? "Mantén tu cuenta segura usando una contraseña fuerte."
              : "Tu cuenta utiliza inicio de sesión externo, así que no necesitas contraseña."
          }
        >
          {hasPasswordProvider ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <PasswordInput
                id="current-password"
                label="Contraseña actual"
                value={currentPassword}
                onChange={setCurrentPassword}
                autoComplete="current-password"
              />
              <PasswordInput
                id="new-password"
                label="Nueva contraseña"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
              />
              <PasswordInput
                id="confirm-password"
                label="Confirma la nueva contraseña"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isSavingPassword ? "Actualizando…" : "Cambiar contraseña"}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-lg border border-yellow-500/20 bg-black/30 px-4 py-3 text-sm text-yellow-100/70">
              Inicias sesión con{" "}
              <span className="font-semibold text-yellow-200">
                {oauthProviders.length > 0
                  ? oauthProviders.map(prettifyProvider).join(", ")
                  : "un proveedor externo"}
              </span>
              . Gestiona tu contraseña desde el proveedor.
            </div>
          )}
        </SettingsCard>

        <SettingsCard
          title="Zona de peligro"
          description="Esta acción es irreversible. Se eliminarán tus rachas, partidas y comentarios."
          accent="danger"
        >
          <div className="space-y-4">
            <label htmlFor="confirm-delete" className="block text-xs uppercase tracking-wider text-red-300/70">
              Escribe <span className="font-bold text-red-200">ELIMINAR</span> para confirmar
            </label>
            <input
              id="confirm-delete"
              type="text"
              value={confirmDeleteText}
              onChange={(e) => setConfirmDeleteText(e.target.value)}
              className="w-full rounded-lg border border-red-500/30 bg-black/40 px-4 py-2 text-red-100 focus:border-red-400 focus:outline-none transition-colors"
              placeholder="ELIMINAR"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmDeleteText !== "ELIMINAR"}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? "Eliminando…" : "Eliminar cuenta"}
              </button>
            </div>
          </div>
        </SettingsCard>
      </div>
    </main>
  );
};

type KpiCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  accent: string;
};

const KpiCard = ({ label, value, icon, accent }: KpiCardProps) => (
  <div className={`rounded-xl border bg-gradient-to-br ${accent} p-5 shadow-lg backdrop-blur-sm`}>
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-wider text-yellow-100/70">{label}</span>
      <span className="opacity-80">{icon}</span>
    </div>
    <p className="mt-3 text-4xl font-extrabold tabular-nums">{value}</p>
  </div>
);

type SettingsCardProps = {
  title: string;
  description: string;
  accent?: "default" | "danger";
  children: ReactNode;
};

const SettingsCard = ({ title, description, accent = "default", children }: SettingsCardProps) => {
  const isDanger = accent === "danger";
  return (
    <section
      className={`rounded-2xl border p-6 shadow-xl backdrop-blur-sm ${
        isDanger
          ? "border-red-500/30 bg-red-950/30"
          : "border-yellow-500/20 bg-gray-900/60"
      }`}
    >
      <div className="mb-4">
        <h2
          className={`text-lg font-bold ${
            isDanger ? "text-red-300" : "text-yellow-300"
          }`}
        >
          {title}
        </h2>
        <p
          className={`mt-1 text-sm ${
            isDanger ? "text-red-100/70" : "text-yellow-100/60"
          }`}
        >
          {description}
        </p>
      </div>
      {children}
    </section>
  );
};

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (newValue: string) => void; // eslint-disable-line no-unused-vars
  autoComplete: string;
};

const PasswordInput = ({ id, label, value, onChange, autoComplete }: PasswordInputProps) => (
  <div>
    <label htmlFor={id} className="block text-xs uppercase tracking-wider text-yellow-200/60 mb-1">
      {label}
    </label>
    <input
      id={id}
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      className="w-full rounded-lg border border-yellow-500/30 bg-black/40 px-4 py-2 text-yellow-100 focus:border-yellow-400 focus:outline-none transition-colors"
    />
  </div>
);

export default SettingsClient;
