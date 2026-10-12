import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/AppShell";
import { brl, daysUntil, fmt, monthsBetween, setores } from "@/lib/data";
import { conversao, lacuna, tempoCiclo } from "@/lib/indicadores";
import { useScoped } from "@/lib/scope";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights e alertas · Estágios e Práticas" },
      { name: "description", content: "Lacunas, vagas a vencer, tempo de ciclo, mapa de calor e alertas automáticos." },
      { property: "og:title", content: "Insights e alertas" },
      { property: "og:description", content: "Cruzamento de dados para decidir com indicadores." },
    ],
  }),
  component: Insights,
});

function Insights() {
  const { vagas, estagiarios, instituicoes, verFinanceiro } = useScoped();

  const alertas: { tone: string; texto: string }[] = [];
  instituicoes.forEach((i) => { const d = daysUntil(i.convenioAte); if (d <= 60) alertas.push({ tone: d < 0 ? "erro" : "alerta", texto: d < 0 ? `Convênio com ${i.nome} vencido` : `Convênio com ${i.nome} vence em ${d} dias` }); });
  estagiarios.filter((e) => !e.desfecho).forEach((e) => {
    const p = e.documentos.filter((d) => !d.entregue).length; if (p) alertas.push({ tone: "erro", texto: `${e.nome}: ${p} documento(s) pendente(s)` });
    const d = daysUntil(e.fim); if (d >= 0 && d <= 30) alertas.push({ tone: "alerta", texto: `Estágio de ${e.nome} termina em ${d} dias` });
  });
  vagas.filter((v) => v.estado === "demanda").forEach((v) => alertas.push({ tone: "alerta", texto: `Vaga de ${v.curso} em ${setores.find((s) => s.id === v.setorId)?.nome} sem solicitação` }));

  const ativos = estagiarios.filter((e) => !e.desfecho);
  const faixas = [30, 60, 90].map((n, i, a) => ({ n, lista: ativos.filter((e) => { const d = daysUntil(e.fim); return d >= (i ? a[i - 1]! + 1 : 0) && d <= n; }) }));

  const ciclos = vagas.map(tempoCiclo).filter((x): x is number => x !== null);
  const medio = ciclos.length ? Math.round(ciclos.reduce((a, b) => a + b, 0) / ciclos.length) : 0;
  const parados = vagas.filter((v) => v.estado === "solicitada" && v.solicitadaEm).map((v) => daysUntil(v.solicitadaEm!) * -1);

  const meses = Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - 6 + i); return d; });
  const heat = setores.map((s) => ({ s, vals: meses.map((m) => { const oc = vagas.filter((v) => v.setorId === s.id && ["ativa", "encerrada"].includes(v.estado) && new Date(v.inicio) <= m && new Date(v.fim) >= m).length; return Math.min(1, oc / s.necessidade); }) }));

  return (
    <>
      <PageHeader eyebrow="Indicadores e insights" title="Cruzando os dados" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Alertas automáticos" className="lg:row-span-2">
          <ul className="max-h-[520px] space-y-2 overflow-auto">{alertas.map((a, i) => <li key={i} className="flex items-start gap-2 text-sm"><Bell className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="flex-1">{a.texto}</span><Pill tone={a.tone}>{a.tone === "erro" ? "Urgente" : "Atenção"}</Pill></li>)}</ul>
        </Panel>
        <Panel title="Alerta de lacuna" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">{setores.map((s) => { const g = lacuna(s, vagas); return (
            <div key={s.id} className={`rounded-lg border p-3 ${g ? "border-primary/40 bg-primary/5" : ""}`}><div className="text-sm font-semibold">{s.nome}</div><div className="text-xs text-muted-foreground">Necessidade: {s.necessidade}</div>
              <div className="mt-1 text-sm">{g ? <>Solicitar <b className="text-primary">{g}</b> vaga(s)</> : "Coberto"}</div></div>); })}</div>
        </Panel>
        <Panel title="Vagas a vencer" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">{faixas.map((f) => (
            <div key={f.n}><div className="mb-2 text-sm font-semibold">Até {f.n} dias <span className="text-muted-foreground">({f.lista.length})</span></div>
              <ul className="space-y-1 text-sm">{f.lista.map((e) => <li key={e.id}><Link to="/estagiarios/$id" params={{ id: e.id }} className="hover:text-primary">{e.nome}</Link><div className="text-xs text-muted-foreground">{fmt(e.fim)} · {f.n === 30 ? "Abrir nova solicitação" : "Avaliar renovação"}</div></li>)}</ul></div>))}</div>
        </Panel>
        <Panel title="Tempo do ciclo">
          <div className="text-4xl font-extrabold">{medio} <span className="text-base font-medium text-muted-foreground">dias</span></div>
          <p className="mt-1 text-sm text-muted-foreground">Média entre solicitação e alocação.</p>
          <p className="mt-3 text-sm">Gargalo: <b>{parados.length}</b> solicitações aguardando resposta, a mais antiga há <b>{parados.length ? Math.max(...parados) : 0}</b> dias.</p>
        </Panel>
        <Panel title="Mapa de calor de ocupação" className="lg:col-span-2">
          <div className="overflow-x-auto"><table className="text-xs"><thead><tr><th />{meses.map((m, i) => <th key={i} className="px-1 font-medium text-muted-foreground">{m.toLocaleDateString("pt-BR", { month: "short" })}</th>)}</tr></thead>
            <tbody>{heat.map(({ s, vals }) => <tr key={s.id}><td className="pr-2 whitespace-nowrap">{s.nome}</td>{vals.map((v, i) => <td key={i} className="p-0.5"><div title={`${Math.round(v * 100)}%`} className="h-6 w-9 rounded bg-primary" style={{ opacity: 0.08 + v * 0.92 }} /></td>)}</tr>)}</tbody></table></div>
        </Panel>
        {verFinanceiro && <Panel title="Custo por vaga × conversão" className="lg:col-span-3">
          <table className="w-full text-sm"><thead className="text-left text-xs uppercase text-muted-foreground"><tr><th className="py-2">Setor</th><th>Custo médio por estagiário</th><th>Conversão</th><th>Retorno</th></tr></thead>
            <tbody>{setores.map((s) => { const es = estagiarios.filter((e) => e.setorId === s.id); const c = es.length ? es.reduce((a, e) => a + e.bolsa * monthsBetween(e.inicio, e.fim), 0) / es.length : 0; const t = conversao(es).taxa;
              return <tr key={s.id} className="border-t"><td className="py-2 font-medium">{s.nome}</td><td>{brl(c)}</td><td>{t}%</td><td>{t >= 50 ? <Pill tone="ok">Alto</Pill> : t > 0 ? <Pill tone="alerta">Médio</Pill> : <Pill tone="encerrada">Sem dados</Pill>}</td></tr>; })}</tbody></table>
        </Panel>}
      </div>
    </>
  );
}
