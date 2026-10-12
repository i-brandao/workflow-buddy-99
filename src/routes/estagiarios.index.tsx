import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Pill } from "@/components/AppShell";
import { brl, daysUntil, fmt, setores } from "@/lib/data";
import { useScoped } from "@/lib/scope";

export const Route = createFileRoute("/estagiarios/")({
  head: () => ({
    meta: [
      { title: "Estagiários · Estágios e Práticas" },
      { name: "description", content: "Lista de estagiários com vínculo, setor, documentos e desfecho." },
      { property: "og:title", content: "Estagiários · Estágios e Práticas" },
      { property: "og:description", content: "Fichas individuais dos estagiários do complexo hospitalar." },
    ],
  }),
  component: Lista,
});

function Lista() {
  const { estagiarios, instituicoes, verFinanceiro } = useScoped();
  return (
    <>
      <PageHeader eyebrow="Fichas individuais" title="Estagiários" />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr>{["Nome", "Setor", "Instituição", "Vínculo", "Término", "Documentos", "Situação"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {estagiarios.map((e) => {
              const pend = e.documentos.filter((d) => !d.entregue).length; const d = daysUntil(e.fim);
              return (
                <tr key={e.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3 font-semibold"><Link to="/estagiarios/$id" params={{ id: e.id }} className="text-secondary hover:text-primary">{e.nome}</Link><div className="text-xs font-normal text-muted-foreground">{e.curso}</div></td>
                  <td className="px-4 py-3">{setores.find((s) => s.id === e.setorId)?.nome}</td>
                  <td className="px-4 py-3">{instituicoes.find((i) => i.id === e.instituicaoId)?.nome}</td>
                  <td className="px-4 py-3">{e.vinculo}{verFinanceiro && e.bolsa > 0 && <div className="text-xs text-muted-foreground">{brl(e.bolsa)}/mês</div>}</td>
                  <td className="px-4 py-3">{fmt(e.fim)}</td>
                  <td className="px-4 py-3">{pend ? <Pill tone="erro">{pend} pendente(s)</Pill> : <Pill tone="ok">Completos</Pill>}</td>
                  <td className="px-4 py-3">{e.desfecho ? <Pill tone={e.desfecho === "contratado" ? "ok" : "encerrada"}>{e.desfecho}</Pill> : d <= 30 ? <Pill tone="alerta">Termina em {d}d</Pill> : <Pill tone="ativa">Ativo</Pill>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
