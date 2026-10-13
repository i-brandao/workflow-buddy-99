import type { Estagiario, Instituicao, Vaga } from "./data";
export type Perfil = "Gestão e coordenação" | "Chefia de setor" | "Instituição de ensino" | "Interessado no estágio";
export const SETOR_CHEFIA = "s1";
export const INST_PORTAL = "i1";
export function scopeData(perfil: Perfil, vagas: Vaga[], estagiarios: Estagiario[], instituicoes: Instituicao[]) {
  if (perfil === "Interessado no estágio") return { vagas: vagas.filter(v => v.estado === "solicitada" || v.estado === "selecao"), estagiarios: [], instituicoes: [] };
  if (perfil === "Instituição de ensino") {
    const own = estagiarios.filter(e => e.instituicaoId === INST_PORTAL);
    return { vagas: vagas.filter(v => v.instituicaoId === INST_PORTAL && !estagiarios.some(e => e.vagaId === v.id && e.instituicaoId !== INST_PORTAL)), estagiarios: own, instituicoes: instituicoes.filter(i => i.id === INST_PORTAL) };
  }
  if (perfil === "Chefia de setor") return { vagas: vagas.filter(v => v.setorId === SETOR_CHEFIA), estagiarios: estagiarios.filter(e => e.setorId === SETOR_CHEFIA), instituicoes };
  return { vagas, estagiarios, instituicoes };
}
export function canViewPage(perfil: Perfil, path: string) {
  if (path === "/vagas") return perfil === "Interessado no estágio";
  if (perfil === "Interessado no estágio") return false;
  if (["/", "/financeiro", "/insights", "/contratacoes", "/auditoria"].includes(path)) return perfil === "Gestão e coordenação";
  return true;
}