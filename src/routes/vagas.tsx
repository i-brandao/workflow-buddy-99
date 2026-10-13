import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Pill } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ESTADOS, estadoLabel, fmt, setores, type EstadoVaga } from "@/lib/data";
import { useScoped } from "@/lib/scope";

export const Route = createFileRoute("/vagas")({
  head: () => ({
    meta: [
      { title: "Vagas · Estágios e Práticas" },
      { name: "description", content: "Cadastro e ciclo de vida das vagas de estágio e prática por setor." },
      { property: "og:title", content: "Vagas · Estágios e Práticas" },
      { property: "og:description", content: "Cadastre vagas e acompanhe cada uma do pedido ao encerramento." },
    ],
  }),
  component: Vagas,
});

export const MAX_CARGA_SEMANAL = 30; // Lei 11.788/2008, ensino superior

function Vagas() {
  const { vagas } = useScoped();
  const [filtro, setFiltro] = useState<EstadoVaga | "">("");
  const lista = vagas.filter((v) => !filtro || v.estado === filtro);

  return (
    <>
      <PageHeader eyebrow="Oportunidades" title="Vagas de estágio e prática" />
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" variant={filtro === "" ? "secondary" : "outline"} onClick={() => setFiltro("")}>Todas ({vagas.length})</Button>
        {ESTADOS.filter(e => ["solicitada", "selecao"].includes(e.id)).map((e) => <Button key={e.id} size="sm" variant={filtro === e.id ? "secondary" : "outline"} onClick={() => setFiltro(e.id)}>{e.label} ({vagas.filter((v) => v.estado === e.id).length})</Button>)}
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr>{["Setor", "Tipo", "Curso", "Período", "Carga", "Preceptor", "Estado"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {lista.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="px-4 py-3 font-medium">{setores.find((s) => s.id === v.setorId)?.nome}</td>
                <td className="px-4 py-3">{v.tipo}</td><td className="px-4 py-3">{v.curso}</td>
                <td className="px-4 py-3 whitespace-nowrap">{fmt(v.inicio)} – {fmt(v.fim)}</td>
                <td className="px-4 py-3">{v.cargaHoraria}h</td><td className="px-4 py-3">{v.preceptor}</td>
                <td className="px-4 py-3">
                   <Pill tone={v.estado}>{estadoLabel(v.estado)}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
