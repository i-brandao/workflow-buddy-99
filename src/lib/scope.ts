import { useStore } from "./store";
import { scopeData } from "./access";
export { SETOR_CHEFIA, INST_PORTAL } from "./access";

export function useScoped() {
  const s = useStore();
  return { ...s, ...scopeData(s.perfil, s.vagas, s.estagiarios, s.instituicoes), verFinanceiro: s.perfil === "Gestão e coordenação" };
}
