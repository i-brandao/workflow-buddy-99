import type { Estagiario, Setor, Vaga } from "./data";

/** Conversão = contratados ÷ estagiários com estágio encerrado (qualquer desfecho). */
export function conversao(es: Estagiario[]) {
  const encerrados = es.filter((e) => e.desfecho).length;
  const contratados = es.filter((e) => e.desfecho === "contratado").length;
  return { encerrados, contratados, taxa: encerrados ? Math.round((contratados / encerrados) * 100) : 0 };
}

/** Lacuna = necessidade do setor − vagas já em andamento (solicitada, seleção ou ativa). */
export function lacuna(setor: Setor, vagas: Vaga[]) {
  const cobertas = vagas.filter((v) => v.setorId === setor.id && ["solicitada", "selecao", "ativa"].includes(v.estado)).reduce((a, v) => a + v.quantidade, 0);
  return Math.max(0, setor.necessidade - cobertas);
}

/** Dias entre solicitação e alocação. */
export function tempoCiclo(v: Vaga) {
  if (!v.solicitadaEm || !v.alocadaEm) return null;
  return Math.round((new Date(v.alocadaEm).getTime() - new Date(v.solicitadaEm).getTime()) / 86400000);
}
