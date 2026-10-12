import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Stat } from "@/components/AppShell";
import { setores } from "@/lib/data";
import { useScoped } from "@/lib/scope";
import { conversao } from "@/lib/indicadores";

export const Route = createFileRoute("/contratacoes")({
  head: () => ({
    meta: [
      { title: "Contratações · Estágios e Práticas" },
      { name: "description", content: "Taxa de conversão de estagiários em contratados, por setor e por curso." },
      { property: "og:title", content: "Contratações · Estágios e Práticas" },
      { property: "og:description", content: "Onde o estágio funciona como porta de entrada." },
    ],
  }),
  component: Contratacoes,
});

function Bars({ rows }: { rows: { nome: string; taxa: number; n: number }[] }) {
  return <ul className="space-y-3">{rows.map((r) => (
    <li key={r.nome} className="text-sm"><div className="mb-1 flex justify-between"><span>{r.nome}</span><span className="font-semibold">{r.taxa}% <span className="font-normal text-muted-foreground">({r.n} concluíram)</span></span></div>
      <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${r.taxa}%` }} /></div></li>
  ))}</ul>;
}

function Contratacoes() {
  const { estagiarios } = useScoped();
  const geral = conversao(estagiarios);
  const cursos = [...new Set(estagiarios.map((e) => e.curso))];
  const porSetor = setores.map((s) => { const c = conversao(estagiarios.filter((e) => e.setorId === s.id)); return { nome: s.nome, taxa: c.taxa, n: c.encerrados }; }).filter((r) => r.n);
  const porCurso = cursos.map((c) => { const x = conversao(estagiarios.filter((e) => e.curso === c)); return { nome: c, taxa: x.taxa, n: x.encerrados }; }).filter((r) => r.n);
  return (
    <>
      <PageHeader eyebrow="Contratações" title="O estágio como porta de entrada" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat tone="primary" label="Taxa de conversão" value={`${geral.taxa}%`} hint="Contratados ÷ estágios encerrados" />
        <Stat label="Contratados" value={geral.contratados} />
        <Stat label="Estágios encerrados" value={geral.encerrados} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Conversão por setor"><Bars rows={porSetor} /></Panel>
        <Panel title="Conversão por curso"><Bars rows={porCurso} /></Panel>
      </div>
    </>
  );
}
