import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Pill } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ESTADOS, estadoLabel, fmt, setores, type EstadoVaga, type Tipo, type Vaga } from "@/lib/data";
import { useScoped, INST_PORTAL, SETOR_CHEFIA } from "@/lib/scope";

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

const input = "w-full rounded-md border bg-card px-3 py-2 text-sm";
export const MAX_CARGA_SEMANAL = 30; // Lei 11.788/2008, ensino superior

function Vagas() {
  const { vagas, instituicoes, update, perfil } = useScoped();
  const [filtro, setFiltro] = useState<EstadoVaga | "">("");
  const [open, setOpen] = useState(false);
  const lista = vagas.filter((v) => !filtro || v.estado === filtro);
  const isInst = perfil === "Instituição de ensino";

  const mudarEstado = (v: Vaga, estado: EstadoVaga) => {
    const hoje = new Date().toISOString().slice(0, 10);
    update((s) => ({ ...s, vagas: s.vagas.map((x) => x.id === v.id ? { ...x, estado, solicitadaEm: estado === "solicitada" ? hoje : x.solicitadaEm, alocadaEm: estado === "ativa" ? hoje : x.alocadaEm } : x) }), `Vaga ${v.id}: ${estadoLabel(estado)}`);
    toast.success(`Vaga movida para "${estadoLabel(estado)}"`);
  };

  const salvar = (f: FormData) => {
    const carga = Number(f.get("carga"));
    if (carga > MAX_CARGA_SEMANAL) { toast.error(`Carga horária acima de ${MAX_CARGA_SEMANAL}h semanais (Lei do Estágio).`); return; }
    const v: Vaga = {
      id: `v${Date.now()}`, setorId: perfil === "Chefia de setor" ? SETOR_CHEFIA : String(f.get("setor")), tipo: f.get("tipo") as Tipo,
      curso: String(f.get("curso")), quantidade: Number(f.get("qtd")), inicio: String(f.get("inicio")), fim: String(f.get("fim")),
      cargaHoraria: carga, preceptor: String(f.get("preceptor")),
      estado: isInst ? "solicitada" : "demanda", instituicaoId: isInst ? INST_PORTAL : undefined,
      solicitadaEm: isInst ? new Date().toISOString().slice(0, 10) : undefined,
    };
    update((s) => ({ ...s, vagas: [v, ...s.vagas] }), `Nova vaga: ${v.curso}`);
    setOpen(false); toast.success(isInst ? "Solicitação enviada" : "Vaga cadastrada");
  };

  return (
    <>
      <PageHeader eyebrow={isInst ? "Portal da instituição" : "Cadastro de vagas"} title={isInst ? "Minhas solicitações" : "Vagas e ciclo de estados"}>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus /> {isInst ? "Nova solicitação" : "Nova vaga"}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{isInst ? "Nova solicitação" : "Cadastrar vaga"}</DialogTitle></DialogHeader>
            <form action={salvar} className="grid grid-cols-2 gap-3 text-sm">
              <label className="col-span-2">Setor<select name="setor" required className={input}>{setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}</select></label>
              <label>Tipo<select name="tipo" className={input}><option>Estágio</option><option>Prática</option></select></label>
              <label>Curso exigido<input name="curso" required className={input} /></label>
              <label>Quantidade<input name="qtd" type="number" min={1} defaultValue={1} required className={input} /></label>
              <label>Carga semanal (h)<input name="carga" type="number" min={1} defaultValue={20} required className={input} /></label>
              <label>Início<input name="inicio" type="date" required className={input} /></label>
              <label>Fim<input name="fim" type="date" required className={input} /></label>
              <label className="col-span-2">Preceptor responsável<input name="preceptor" required className={input} /></label>
              <Button type="submit" className="col-span-2 mt-2">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" variant={filtro === "" ? "secondary" : "outline"} onClick={() => setFiltro("")}>Todas ({vagas.length})</Button>
        {ESTADOS.map((e) => <Button key={e.id} size="sm" variant={filtro === e.id ? "secondary" : "outline"} onClick={() => setFiltro(e.id)}>{e.label} ({vagas.filter((v) => v.estado === e.id).length})</Button>)}
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr>{["Setor", "Tipo", "Curso", "Período", "Carga", "Preceptor", "Instituição", "Estado"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {lista.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="px-4 py-3 font-medium">{setores.find((s) => s.id === v.setorId)?.nome}</td>
                <td className="px-4 py-3">{v.tipo}</td><td className="px-4 py-3">{v.curso}</td>
                <td className="px-4 py-3 whitespace-nowrap">{fmt(v.inicio)} – {fmt(v.fim)}</td>
                <td className="px-4 py-3">{v.cargaHoraria}h</td><td className="px-4 py-3">{v.preceptor}</td>
                <td className="px-4 py-3">{instituicoes.find((i) => i.id === v.instituicaoId)?.nome ?? "—"}</td>
                <td className="px-4 py-3">
                  {isInst ? <Pill tone={v.estado}>{estadoLabel(v.estado)}</Pill> :
                    <select value={v.estado} onChange={(e) => mudarEstado(v, e.target.value as EstadoVaga)} className="rounded-md border bg-card px-2 py-1 text-xs">
                      {ESTADOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
                    </select>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
