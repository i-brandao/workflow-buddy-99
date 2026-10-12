import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, Pill } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { brl, fmt, setores, type Desfecho } from "@/lib/data";
import { useScoped } from "@/lib/scope";

export const Route = createFileRoute("/estagiarios/$id")({
  head: () => ({
    meta: [
      { title: "Ficha do estagiário · Estágios e Práticas" },
      { name: "description", content: "Vínculo, dados acadêmicos, escala, documentos e desfecho do estagiário." },
      { property: "og:title", content: "Ficha do estagiário" },
      { property: "og:description", content: "Ficha individual completa do estagiário." },
    ],
  }),
  component: Ficha,
});

const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const horas = Array.from({ length: 13 }, (_, i) => 7 + i);

function Ficha() {
  const { id } = Route.useParams();
  const { estagiarios, instituicoes, update, verFinanceiro } = useScoped();
  const e = estagiarios.find((x) => x.id === id);
  if (!e) return <p>Estagiário não encontrado ou sem permissão de acesso. <Link to="/estagiarios" className="text-primary">Voltar</Link></p>;
  const setEst = (patch: Partial<typeof e>, acao: string) => update((s) => ({ ...s, estagiarios: s.estagiarios.map((x) => x.id === e.id ? { ...x, ...patch } : x) }), acao);
  const pct = Math.round((e.documentos.filter((d) => d.entregue).length / e.documentos.length) * 100);
  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => <div className="flex justify-between border-b py-2 text-sm last:border-0"><span className="text-muted-foreground">{k}</span><span className="font-medium text-right">{v}</span></div>;

  return (
    <>
      <Link to="/estagiarios" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Estagiários</Link>
      <PageHeader eyebrow={`${e.curso} · ${setores.find((s) => s.id === e.setorId)?.nome}`} title={e.nome}>
        {e.desfecho ? <Pill tone={e.desfecho === "contratado" ? "ok" : "encerrada"}>{e.desfecho}</Pill> : <Pill tone="ativa">Ativo</Pill>}
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Vínculo">
          <Row k="Tipo" v={e.vinculo} />
          {verFinanceiro && <Row k="Bolsa" v={e.bolsa ? brl(e.bolsa) + "/mês" : "—"} />}
          <Row k="Início" v={fmt(e.inicio)} /><Row k="Fim" v={fmt(e.fim)} />
          <Row k="Horas cumpridas" v={`${e.horasCumpridas}h`} />
        </Panel>
        <Panel title="Dados acadêmicos">
          <Row k="Instituição" v={instituicoes.find((i) => i.id === e.instituicaoId)?.nome} />
          <Row k="Curso" v={e.curso} /><Row k="Período" v={`${e.periodo}º`} /><Row k="Orientador" v={e.orientador} />
        </Panel>
        <Panel title="Função">
          <Row k="Setor" v={setores.find((s) => s.id === e.setorId)?.nome} /><Row k="Preceptor" v={e.preceptor} />
          <p className="mt-3 text-sm text-muted-foreground">{e.atividades}</p>
        </Panel>
        <Panel title="Escala semanal" className="lg:col-span-2">
          <div className="grid grid-cols-[40px_repeat(7,1fr)] text-xs">
            <div />{dias.map((d) => <div key={d} className="pb-2 text-center font-semibold">{d}</div>)}
            {horas.map((h) => (
              <div key={h} className="contents">
                <div className="pr-1 text-right text-muted-foreground">{h}h</div>
                {dias.map((_, di) => {
                  const on = e.escala.some((s) => s.dia === di && h >= parseInt(s.entrada) && h < parseInt(s.saida));
                  return <div key={di} className={`m-px h-5 rounded-sm ${on ? "bg-primary" : "bg-muted"}`} />;
                })}
              </div>
            ))}
          </div>
        </Panel>
        <Panel title={`Documentos · ${pct}%`}>
          <ul className="space-y-2">
            {e.documentos.map((d, i) => (
              <li key={d.tipo} className="flex items-center justify-between text-sm">
                {d.tipo}
                <button onClick={() => setEst({ documentos: e.documentos.map((x, j) => j === i ? { ...x, entregue: !x.entregue } : x) }, `${e.nome}: ${d.tipo} ${d.entregue ? "pendente" : "entregue"}`)}>
                  <Pill tone={d.entregue ? "ok" : "erro"}>{d.entregue ? "Entregue" : "Pendente"}</Pill>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Desfecho" className="lg:col-span-3">
          {e.desfecho === "contratado" ? <p className="text-sm">Contratado em <b>{fmt(e.contratadoEm)}</b> como <b>{e.cargoContratado}</b>.</p> : null}
          <form className="mt-2 flex flex-wrap items-end gap-3 text-sm" action={(f) => {
            const desfecho = (f.get("desfecho") as string) || null;
            setEst({ desfecho: desfecho as Desfecho, cargoContratado: String(f.get("cargo") || "") || undefined, contratadoEm: desfecho === "contratado" ? new Date().toISOString().slice(0, 10) : undefined }, `${e.nome}: desfecho ${desfecho ?? "removido"}`);
            update((s) => ({ ...s, vagas: s.vagas.map((v) => v.id === e.vagaId ? { ...v, estado: desfecho ? "encerrada" : "ativa" } : v) }), `Vaga ${e.vagaId} atualizada`);
            toast.success("Desfecho registrado");
          }}>
            <label>Desfecho<select name="desfecho" defaultValue={e.desfecho ?? ""} className="block rounded-md border bg-card px-3 py-2"><option value="">Em andamento</option><option>concluído</option><option>desligado</option><option>contratado</option><option>não renovado</option></select></label>
            <label>Cargo (se contratado)<input name="cargo" defaultValue={e.cargoContratado} className="block rounded-md border bg-card px-3 py-2" /></label>
            <Button type="submit">Salvar desfecho</Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
