import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Panel, Stat } from "@/components/AppShell";
import { brl, monthsBetween, setores } from "@/lib/data";
import { useScoped } from "@/lib/scope";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro · Estágios e Práticas" },
      { name: "description", content: "Gasto com bolsas por setor, mês e vínculo, custo médio e projeção." },
      { property: "og:title", content: "Financeiro · Estágios e Práticas" },
      { property: "og:description", content: "Quanto se gasta com bolsas e qual a projeção." },
    ],
  }),
  component: Financeiro,
});

const BOLSA_MEDIA_PROJECAO = 1000;

function Financeiro() {
  const { estagiarios, vagas, verFinanceiro } = useScoped();
  if (!verFinanceiro) return <p className="text-muted-foreground">Seu perfil não tem acesso aos dados financeiros.</p>;
  const custo = (e: (typeof estagiarios)[number]) => e.bolsa * monthsBetween(e.inicio, e.fim);
  const total = estagiarios.reduce((a, e) => a + custo(e), 0);
  const bolsistas = estagiarios.filter((e) => e.vinculo === "Bolsista");
  const mensalAtivo = estagiarios.filter((e) => !e.desfecho).reduce((a, e) => a + e.bolsa, 0);
  const solicitadas = vagas.filter((v) => ["solicitada", "selecao"].includes(v.estado)).length;
  const porSetor = setores.map((s) => ({ setor: s.nome, Gasto: estagiarios.filter((e) => e.setorId === s.id).reduce((a, e) => a + custo(e), 0) }));
  const meses = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - 5 + i); return d; });
  const porMes = meses.map((m) => ({ mes: m.toLocaleDateString("pt-BR", { month: "short" }), Gasto: estagiarios.filter((e) => new Date(e.inicio) <= m && new Date(e.fim) >= m).reduce((a, e) => a + e.bolsa, 0) }));

  return (
    <>
      <PageHeader eyebrow="Financeiro" title="Gastos com bolsas" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat tone="primary" label="Gasto total" value={brl(total)} hint="Soma das bolsas no período dos vínculos" />
        <Stat label="Custo médio por estagiário" value={brl(bolsistas.length ? total / bolsistas.length : 0)} hint={`${bolsistas.length} bolsistas · ${estagiarios.length - bolsistas.length} voluntários`} />
        <Stat label="Folha mensal atual" value={brl(mensalAtivo)} hint="Estagiários ativos" />
        <Stat label="Projeção próximos 6 meses" value={brl((mensalAtivo + solicitadas * BOLSA_MEDIA_PROJECAO) * 6)} hint={`Ativos + ${solicitadas} solicitadas (bolsa média ${brl(BOLSA_MEDIA_PROJECAO)})`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Gasto por setor"><ResponsiveContainer width="100%" height={260}><BarChart data={porSetor}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="setor" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(v: number) => brl(v)} /><Bar dataKey="Gasto" fill="var(--chart-1)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Panel>
        <Panel title="Gasto por mês"><ResponsiveContainer width="100%" height={260}><BarChart data={porMes}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="mes" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(v: number) => brl(v)} /><Bar dataKey="Gasto" fill="var(--chart-2)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Panel>
      </div>
    </>
  );
}
