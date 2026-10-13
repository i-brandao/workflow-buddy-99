import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, Briefcase, Users, Building2, Wallet, TrendingUp, Lightbulb, ShieldCheck } from "lucide-react";
import { useStore, type Perfil } from "@/lib/store";
import { canViewPage } from "@/lib/access";
import logo from "@/assets/up-logo.jpeg.asset.json";
import { Button } from "@/components/ui/button";

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
  const location = useLocation();
  const links = nav.filter(n => canViewPage(perfil, n.to));
  const allowed = canViewPage(perfil, location.pathname);
  const profileSelect = <select aria-label="Perfil de acesso" value={perfil} onChange={e => setPerfil(e.target.value as Perfil)} className="mt-1 w-full rounded-md bg-sidebar-accent px-2 py-2 text-sm text-sidebar-accent-foreground"><option>Gestão e coordenação</option><option>Chefia de setor</option><option>Instituição de ensino</option><option>Interessado no estágio</option></select>;
  return (
    <div className="flex min-h-screen" data-area={perfil === "Gestão e coordenação" ? "management" : "user"}>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-navigation text-sidebar-foreground md:flex print:hidden">
        <div className="px-6 py-6">
          <div className="mb-4 overflow-hidden rounded-md bg-card"><img src={logo.url} alt="UP+" className="brand-logo" /></div>
          <div className="leading-tight">
            <div className="font-bold">Gestão de Estágios</div>
            <div className="text-xs opacity-70">Complexo Hospitalar</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {links.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary" }}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <label className="text-xs uppercase tracking-wider opacity-60">Perfil de acesso</label>
          {profileSelect}
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="bg-navigation p-3 text-sidebar-foreground md:hidden">
          <div className="flex items-center gap-3"><div className="w-24 overflow-hidden rounded bg-card"><img src={logo.url} alt="UP+" className="brand-logo" /></div><div className="min-w-0 flex-1">{profileSelect}</div></div>
          <nav className="mt-2 flex gap-2 overflow-x-auto">{links.map((n) => <Link key={n.to} to={n.to} className="whitespace-nowrap rounded px-3 py-1.5 text-sm text-sidebar-foreground" activeProps={{ className: "bg-sidebar-primary" }} activeOptions={{ exact: n.to === "/" }}>{n.label}</Link>)}</nav>
        </div>
        <main className="mx-auto max-w-7xl p-6 md:p-8">{allowed ? children : <><PageHeader eyebrow={perfil} title={perfil === "Interessado no estágio" ? "Oportunidades de estágio" : "Acompanhamento de estagiários"} /><Button asChild><Link to={perfil === "Interessado no estágio" ? "/vagas" : "/estagiarios"}>{perfil === "Interessado no estágio" ? "Consultar vagas" : "Ver estagiários"}</Link></Button></>}</main>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</div>
        <h1 className="mt-1 text-3xl font-extrabold">{title}</h1>
      </div>
      <div className="flex flex-wrap gap-2 print:hidden">{children}</div>
    </div>
  );
}

export function Stat({ label, value, hint, tone = "default" }: { label: string; value: ReactNode; hint?: string; tone?: "default" | "primary" }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-extrabold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
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
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone] ?? tones["encerrada"]}`}>{children}</span>;
}
