import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, Panel, Pill } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { daysUntil, fmt } from "@/lib/data";
import { useScoped } from "@/lib/scope";

export const Route = createFileRoute("/instituicoes")({
  head: () => ({
    meta: [
      { title: "Instituições e convênios · Estágios e Práticas" },
      { name: "description", content: "Instituições de ensino, validade dos convênios e alertas de vencimento." },
      { property: "og:title", content: "Instituições e convênios" },
      { property: "og:description", content: "Acompanhe convênios e solicitações por instituição de ensino." },
    ],
  }),
  component: Instituicoes,
});

const input = "rounded-md border bg-card px-3 py-2 text-sm";

function Instituicoes() {
  const { instituicoes, vagas, estagiarios, update } = useScoped();
  return (
    <>
      <PageHeader eyebrow="Convênios" title="Instituições de ensino" />
      <div className="grid gap-4 md:grid-cols-2">
        {instituicoes.map((i) => {
          const d = daysUntil(i.convenioAte);
          return (
            <div key={i.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div><h3 className="font-bold">{i.nome}</h3><p className="text-sm text-muted-foreground">{i.contato}</p></div>
                {d < 0 ? <Pill tone="erro">Convênio vencido</Pill> : d <= 60 ? <Pill tone="alerta">Vence em {d} dias</Pill> : <Pill tone="ok">Vigente</Pill>}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-muted p-2"><div className="text-xl font-bold">{vagas.filter((v) => v.instituicaoId === i.id && ["solicitada", "selecao"].includes(v.estado)).length}</div>Solicitações</div>
                <div className="rounded-lg bg-muted p-2"><div className="text-xl font-bold">{estagiarios.filter((e) => e.instituicaoId === i.id && !e.desfecho).length}</div>Ativos</div>
                <div className="rounded-lg bg-muted p-2"><div className="text-xl font-bold">{fmt(i.convenioAte)}</div>Validade</div>
              </div>
            </div>
          );
        })}
      </div>
      <Panel title="Cadastrar instituição" className="mt-6">
        <form className="flex flex-wrap gap-2" action={(f) => {
          update((s) => ({ ...s, instituicoes: [...s.instituicoes, { id: `i${Date.now()}`, nome: String(f.get("nome")), contato: String(f.get("contato")), convenioAte: String(f.get("ate")) }] }), `Nova instituição: ${f.get("nome")}`);
          toast.success("Instituição cadastrada");
        }}>
          <input name="nome" placeholder="Nome" required className={input} />
          <input name="contato" placeholder="E-mail de contato" required className={input} />
          <input name="ate" type="date" required className={input} />
          <Button type="submit">Adicionar</Button>
        </form>
      </Panel>
    </>
  );
}
