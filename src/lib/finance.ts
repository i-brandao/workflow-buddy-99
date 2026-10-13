export interface Budget { mes: string; setorId: string; valor: number }
export interface Payment extends Budget { id: string }
export function financeTotals(budgets: Budget[], payments: Payment[], inicio: string, fim: string, setorId = "") {
  const included = (r: Budget) => r.mes >= inicio && r.mes <= fim && (!setorId || r.setorId === setorId);
  const orcamento = budgets.filter(included).reduce((a, r) => a + r.valor, 0);
  const realizado = payments.filter(included).reduce((a, r) => a + r.valor, 0);
  return { orcamento, realizado, saldo: orcamento - realizado };
}