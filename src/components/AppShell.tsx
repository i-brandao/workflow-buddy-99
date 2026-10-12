import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, Briefcase, Users, Building2, Wallet, TrendingUp, Lightbulb, ShieldCheck } from "lucide-react";
import { useStore, type Perfil } from "@/lib/store";

const nav = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/vagas", label: "Vagas", icon: Briefcase },
  { to: "/estagiarios", label: "Estagiários", icon: Users },
  { to: "/instituicoes", label: "Instituições", icon: Building2 },
  { to: "/financeiro", label: "Financeiro", icon: Wallet, gestao: true },
  { to: "/contratacoes", label: "Contratações", icon: TrendingUp },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/auditoria", label: "Auditoria", icon: ShieldCheck, gestao: true },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { perfil, setPerfil } = useStore();
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex print:hidden">
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary font-extrabold text-sidebar-primary-foreground">GE</div>
          <div className="leading-tight">
            <div className="font-bold">Gestão de Estágios</div>
            <div className="text-xs opacity-70">Complexo Hospitalar</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.filter((n) => !("gestao" in n) || perfil === "Gestão e coordenação").map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary" }}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <label className="text-xs uppercase tracking-wider opacity-60">Perfil de acesso</label>
          <select value={perfil} onChange={(e) => setPerfil(e.target.value as Perfil)}
            className="mt-1 w-full rounded-md bg-sidebar-accent px-2 py-2 text-sm text-sidebar-accent-foreground">
            <option>Gestão e coordenação</option><option>Chefia de setor</option><option>Instituição de ensino</option>
          </select>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="flex gap-2 overflow-x-auto bg-sidebar p-2 md:hidden">
          {nav.map((n) => <Link key={n.to} to={n.to} className="whitespace-nowrap rounded px-3 py-1.5 text-sm text-sidebar-foreground" activeProps={{ className: "bg-sidebar-primary" }} activeOptions={{ exact: n.to === "/" }}>{n.label}</Link>)}
        </div>
        <main className="mx-auto max-w-7xl p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{title}</h1>
      </div>
      <div className="flex flex-wrap gap-2 print:hidden">{children}</div>
    </div>
  );
}

export function Stat({ label, value, hint, tone = "default" }: { label: string; value: ReactNode; hint?: string; tone?: "default" | "primary" }) {
  return (
    <div className={`rounded-xl border p-5 ${tone === "primary" ? "bg-hero text-secondary-foreground border-transparent" : "bg-card"}`}>
      <div className={`text-xs font-semibold uppercase tracking-wider ${tone === "primary" ? "opacity-80" : "text-muted-foreground"}`}>{label}</div>
      <div className="mt-2 text-3xl font-extrabold">{value}</div>
      {hint && <div className={`mt-1 text-xs ${tone === "primary" ? "opacity-70" : "text-muted-foreground"}`}>{hint}</div>}
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border bg-card p-5 ${className}`}>
      <h2 className="mb-4 font-bold">{title}</h2>
      {children}
    </section>
  );
}

const tones: Record<string, string> = {
  demanda: "bg-warning/20 text-foreground", solicitada: "bg-accent text-accent-foreground",
  selecao: "bg-chart-3/20 text-foreground", ativa: "bg-success/20 text-foreground", encerrada: "bg-muted text-muted-foreground",
  ok: "bg-success/20 text-foreground", alerta: "bg-warning/25 text-foreground", erro: "bg-primary/15 text-primary",
};
export function Pill({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone] ?? tones.encerrada}`}>{children}</span>;
}
