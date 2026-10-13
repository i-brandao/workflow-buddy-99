import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { seedEstagiarios, seedInstituicoes, seedVagas, type Estagiario, type Instituicao, type Vaga } from "./data";
import type { Perfil } from "./access";
import type { Budget, Payment } from "./finance";
export type { Perfil } from "./access";

export interface Audit { quando: string; usuario: string; acao: string }

interface State { vagas: Vaga[]; estagiarios: Estagiario[]; instituicoes: Instituicao[]; audit: Audit[]; budgets: Budget[]; payments: Payment[] }
interface Ctx extends State {
  perfil: Perfil; setPerfil: (p: Perfil) => void;
  update: (fn: (s: State) => State, acao: string) => void;
}
const StoreCtx = createContext<Ctx | null>(null);
const KEY = "gestao-estagios-v1";
const initial: State = { vagas: seedVagas, estagiarios: seedEstagiarios, instituicoes: seedInstituicoes, audit: [], budgets: [], payments: [] };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [perfil, setPerfil] = useState<Perfil>("Gestão e coordenação");
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) try { setState({ ...initial, ...JSON.parse(raw) }); } catch { /* ignore */ }
  }, []);
  const update = (fn: (s: State) => State, acao: string) =>
    setState((s) => {
      const n = fn(s);
      n.audit = [{ quando: new Date().toISOString(), usuario: perfil, acao }, ...s.audit].slice(0, 200);
      localStorage.setItem(KEY, JSON.stringify(n));
      return n;
    });
  return <StoreCtx.Provider value={{ ...state, perfil, setPerfil, update }}>{children}</StoreCtx.Provider>;
}

export const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
};
