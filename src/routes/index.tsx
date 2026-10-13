import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Printer } from "lucide-react";
import { PageHeader, Panel, Stat } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ESTADOS, setores } from "@/lib/data";
import { useScoped } from "@/lib/scope";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel de gestão · Estágios e Práticas" },
      { name: "description", content: "Visão consolidada de vagas ofertadas, ocupadas, solicitadas e em demanda no complexo hospitalar." },
      { property: "og:title", content: "Painel de gestão · Estágios e Práticas" },
      { property: "og:description", content: "Oferta, demanda e ocupação de vagas de estágio e prática em um só lugar." },
    ],
  }),
  component: Painel,
});

const sel = "rounded-md border bg-card px-3 py-2 text-sm";

function Painel() {
  const { vagas: all, instituicoes } = useScoped();
  const [setor, setSetor] = useState(""); const [tipo, setTipo] = useState(""); const [inst, setInst] = useState("");
  const vagas = useMemo(() => all.filter((v) => (!setor || v.setorId === setor) && (!tipo || v.tipo === tipo) && (!inst || v.instituicaoId === inst)), [all, setor, tipo, inst]);
  const count = (e: string) => vagas.filter((v) => v.estado === e).reduce((a, v) => a + v.quantidade, 0);
  const ofertadas = vagas.filter((v) => v.estado !== "demanda").length;

  const porSetor = setores.map((s) => {
    const vs = vagas.filter((v) => v.setorId === s.id);
    return { setor: s.nome, Oferta: vs.filter((v) => v.estado !== "demanda").length, Demanda: s.necessidade, Ocupadas: vs.filter((v) => v.estado === "ativa").length };
  }).filter((r) => !setor || r.setor === setores.find((s) => s.id === setor)?.nome);

  const meses = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - 5 + i); return d; });
  const ocupacao = meses.map((m) => ({
    mes: m.toLocaleDateString("pt-BR", { month: "short" }),
    Ocupadas: vagas.filter((v) => ["ativa", "encerrada"].includes(v.estado) && new Date(v.inicio) <= m && new Date(v.fim) >= m).length,
  }));
  const colors = ["demand", "request", "selection", "active", "closed"];
  const funil = ESTADOS.map((e, i) => ({ estado: e.label, total: count(e.id), color: `var(--state-${colors[i]})` }));

  return (
    <>
      <PageHeader eyebrow="Painel de gestão" title="O que temos, o que nos pedem e o que falta pedir">
        <Button variant="outline" onClick={() => window.print()}><Printer /> Exportar PDF</Button>
      </PageHeader>
      <div className="mb-6 flex flex-wrap gap-2 print:hidden">
        <select className={sel} value={setor} onChange={(e) => setSetor(e.target.value)}><option value="">Todos os setores</option>{setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}</select>
        <select className={sel} value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="">Estágio e prática</option><option>Estágio</option><option>Prática</option></select>
        <select className={sel} value={inst} onChange={(e) => setInst(e.target.value)}><option value="">Todas as instituições</option>{instituicoes.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}</select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat tone="primary" label="Vagas ofertadas" value={ofertadas} hint="Solicitadas, em seleção, ativas e encerradas" />
        <Stat label="Ocupadas" value={count("ativa")} hint={`${ofertadas ? Math.round((count("ativa") / ofertadas) * 100) : 0}% das ofertadas`} />
        <Stat label="Solicitadas" value={count("solicitada") + count("selecao")} hint="Aguardando resposta ou em alocação" />
        <Stat label="Em demanda" value={count("demanda")} hint="Precisam ser solicitadas" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Oferta × demanda por setor" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={porSetor}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="setor" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Legend />
              <Bar dataKey="Demanda" fill="var(--chart-2)" radius={[4, 4, 0, 0]} /><Bar dataKey="Oferta" fill="var(--chart-1)" radius={[4, 4, 0, 0]} /><Bar dataKey="Ocupadas" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Ocupação ao longo do tempo">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={ocupacao}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="mes" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip />
              <Line dataKey="Ocupadas" stroke="var(--chart-2)" strokeWidth={3} dot={{ r: 4 }} /></LineChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Funil de estados">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={funil} layout="vertical" margin={{ left: 40 }}><XAxis type="number" allowDecimals={false} fontSize={12} /><YAxis type="category" dataKey="estado" width={130} fontSize={12} /><Tooltip />
              <Bar name="Vagas" dataKey="total" radius={[0, 4, 4, 0]}>{funil.map((r) => <Cell key={r.estado} fill={r.color} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </>
  );
}
