import { useStore } from "./store";

/** Demo scoping: Chefia de setor sees only "UTI Adulto"; Instituição sees only "Universidade de Pernambuco". */
export const SETOR_CHEFIA = "s1";
export const INST_PORTAL = "i1";

export function useScoped() {
  const s = useStore();
  let vagas = s.vagas, estagiarios = s.estagiarios;
  if (s.perfil === "Chefia de setor") {
    vagas = vagas.filter((v) => v.setorId === SETOR_CHEFIA);
    estagiarios = estagiarios.filter((e) => e.setorId === SETOR_CHEFIA);
  } else if (s.perfil === "Instituição de ensino") {
    vagas = vagas.filter((v) => v.instituicaoId === INST_PORTAL);
    estagiarios = estagiarios.filter((e) => e.instituicaoId === INST_PORTAL);
  }
  return { ...s, vagas, estagiarios, verFinanceiro: s.perfil === "Gestão e coordenação" };
}
