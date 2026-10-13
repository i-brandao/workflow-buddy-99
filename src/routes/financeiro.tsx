import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Panel, Stat } from "@/components/AppShell";
import { brl, setores } from "@/lib/data";
import { useScoped } from "@/lib/scope";
import { financeTotals } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

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

const input = "block w-full rounded-md border bg-card px-3 py-2 text-sm";

function Financeiro() {
  const { budgets, payments, update, verFinanceiro } = useScoped();
  const [setor, setSetor] = useState("");
  const [ano, setAno] = useState(new Date().getFullYear());
  const [open, setOpen] = useState(false);
  if (!verFinanceiro) return <p className="text-muted-foreground">Seu perfil não tem acesso aos dados financeiros.</p>;
  const inicio = `${ano}-01`, fim = `${ano}-12`;
  const totals = financeTotals(budgets, payments, inicio, fim, setor);
  const visible = setores.filter(s => !setor || s.id === setor);
  const porSetor = visible.map(s => { const t = financeTotals(budgets, payments, inicio, fim, s.id); return { setor: s.nome, Orçamento: t.orcamento, Realizado: t.realizado }; });
  const porMes = Array.from({ length: 12 }, (_, i) => {
    const mes = `${ano}-${String(i + 1).padStart(2, "0")}`;
    const t = financeTotals(budgets, payments, mes, mes, setor);
    return { mes: new Date(ano, i, 1).toLocaleDateString("pt-BR", { month: "short" }), Orçamento: t.orcamento, Realizado: t.realizado, ...Object.fromEntries(visible.map(s => [s.id, financeTotals(budgets, payments, mes, mes, s.id).realizado])) };
  });
  const records = payments.filter(p => p.mes >= inicio && p.mes <= fim && (!setor || p.setorId === setor));

  return (
    <>
      <PageHeader eyebrow="Financeiro" title="Orçamento e gastos com bolsas">
        <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus /> Novo lançamento</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Lançamento financeiro</DialogTitle></DialogHeader>
          <form className="grid gap-3" action={f => {
            const valor = Number(f.get("valor")); const mes = String(f.get("mes")); const setorId = String(f.get("setor"));
            if (!Number.isFinite(valor) || valor <= 0 || !/^\d{4}-\d{2}$/.test(mes) || !setores.some(s => s.id === setorId)) return;
            const isBudget = f.get("tipo") === "orcamento";
            update(s => isBudget ? { ...s, budgets: [...s.budgets.filter(b => !(b.mes === mes && b.setorId === setorId)), { mes, setorId, valor }] } : { ...s, payments: [...s.payments, { id: crypto.randomUUID(), mes, setorId, valor }] }, isBudget ? "Orçamento mensal definido" : "Pagamento registrado");
            setOpen(false); toast.success(isBudget ? "Orçamento atualizado" : "Pagamento registrado");
          }}>
            <label>Tipo<select name="tipo" className={input}><option value="pagamento">Pagamento realizado</option><option value="orcamento">Orçamento mensal do setor</option></select></label>
            <label>Setor<select name="setor" className={input}>{setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select></label>
            <label>Mês<input type="month" name="mes" required defaultValue={new Date().toISOString().slice(0, 7)} className={input} /></label>
            <label>Valor (R$)<input type="number" name="valor" min="0.01" step="0.01" required className={input} /></label>
            <Button type="submit">Salvar lançamento</Button>
          </form>
        </DialogContent></Dialog>
      </PageHeader>
      <div className="mb-5 flex flex-wrap gap-3"><label className="text-xs text-muted-foreground">Ano<input aria-label="Ano financeiro" type="number" min="2000" max="2100" value={ano} onChange={e => setAno(Number(e.target.value))} className={input} /></label><label className="text-xs text-muted-foreground">Setor<select aria-label="Setor financeiro" value={setor} onChange={e => setSetor(e.target.value)} className={input}><option value="">Todos os setores</option>{setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select></label></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Orçamento disponível" value={brl(totals.orcamento)} hint={`Orçamento informado · ${ano}`} />
        <Stat label="Gasto realizado" value={brl(totals.realizado)} hint="Pagamentos registrados" />
        <Stat label={totals.saldo < 0 ? "Acima do orçamento" : "Saldo disponível"} value={brl(Math.abs(totals.saldo))} />
        <Stat label="Execução do orçamento" value={totals.orcamento ? `${Math.round(totals.realizado / totals.orcamento * 100)}%` : "—"} hint={totals.orcamento ? "Realizado ÷ orçamento" : "Orçamento não informado"} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Orçamento × realizado por setor"><ResponsiveContainer width="100%" height={280}><BarChart data={porSetor}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="setor" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(v: number) => brl(v)} /><Legend /><Bar dataKey="Orçamento" fill="var(--chart-1)" radius={[4, 4, 0, 0]} /><Bar dataKey="Realizado" fill="var(--success)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Panel>
        <Panel title="Orçamento × realizado por mês"><ResponsiveContainer width="100%" height={280}><BarChart data={porMes}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="mes" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(v: number) => brl(v)} /><Legend /><Bar dataKey="Orçamento" fill="var(--chart-1)" radius={[4, 4, 0, 0]} /><Bar dataKey="Realizado" fill="var(--success)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Panel>
        <Panel title="Gasto por setor ao longo do tempo" className="lg:col-span-2"><ResponsiveContainer width="100%" height={300}><LineChart data={porMes}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="mes" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(v: number) => brl(v)} /><Legend />{visible.map((s, i) => <Line key={s.id} name={s.nome} dataKey={s.id} stroke={`var(--${i === 5 ? "state-closed" : `chart-${i + 1}`})`} strokeWidth={2} />)}</LineChart></ResponsiveContainer></Panel>
      </div>
      <section className="mt-6"><h2 className="mb-3 font-bold">Pagamentos registrados</h2>{records.length ? <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th className="py-2">Mês</th><th>Setor</th><th>Valor</th><th /></tr></thead><tbody>{records.map(p => <tr key={p.id} className="border-t"><td className="py-3">{p.mes.split("-").reverse().join("/")}</td><td>{setores.find(s => s.id === p.setorId)?.nome}</td><td>{brl(p.valor)}</td><td><Button variant="ghost" size="sm" onClick={() => { if (window.confirm("Excluir este pagamento?")) update(s => ({ ...s, payments: s.payments.filter(x => x.id !== p.id) }), "Pagamento excluído"); }}>Excluir</Button></td></tr>)}</tbody></table></div> : <p className="text-sm text-muted-foreground">Nenhum pagamento registrado neste período.</p>}</section>
    </>
  );
}
