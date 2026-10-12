export type EstadoVaga = "demanda" | "solicitada" | "selecao" | "ativa" | "encerrada";
export type Tipo = "Estágio" | "Prática";
export type Desfecho = "concluído" | "desligado" | "contratado" | "não renovado" | null;

export const ESTADOS: { id: EstadoVaga; label: string }[] = [
  { id: "demanda", label: "Em demanda" },
  { id: "solicitada", label: "Solicitada" },
  { id: "selecao", label: "Em seleção e alocação" },
  { id: "ativa", label: "Ativa" },
  { id: "encerrada", label: "Encerrada" },
];
export const estadoLabel = (e: EstadoVaga) => ESTADOS.find((x) => x.id === e)!.label;

export interface Setor { id: string; nome: string; unidade: string; necessidade: number }
export interface Instituicao { id: string; nome: string; contato: string; convenioAte: string }
export interface Vaga {
  id: string; setorId: string; tipo: Tipo; curso: string; quantidade: number;
  inicio: string; fim: string; cargaHoraria: number; preceptor: string; estado: EstadoVaga;
  instituicaoId?: string | undefined; solicitadaEm?: string | undefined; alocadaEm?: string | undefined;
}
export interface Escala { dia: number; entrada: string; saida: string }
export interface Documento { tipo: string; entregue: boolean }
export interface Estagiario {
  id: string; nome: string; vagaId: string; setorId: string; instituicaoId: string; curso: string;
  periodo: number; orientador: string; preceptor: string; vinculo: "Bolsista" | "Voluntário";
  bolsa: number; inicio: string; fim: string; atividades: string; escala: Escala[];
  documentos: Documento[]; desfecho: Desfecho; cargoContratado?: string | undefined; contratadoEm?: string | undefined;
  horasCumpridas: number;
}

export const DOCS = ["Termo de compromisso", "Plano de atividades", "Seguro", "Comprovante de matrícula", "Vacinação"];

export const setores: Setor[] = [
  { id: "s1", nome: "UTI Adulto", unidade: "Hospital Central", necessidade: 8 },
  { id: "s2", nome: "Pediatria", unidade: "Hospital Central", necessidade: 6 },
  { id: "s3", nome: "Farmácia", unidade: "Hospital Central", necessidade: 4 },
  { id: "s4", nome: "Emergência", unidade: "Pronto-Socorro", necessidade: 10 },
  { id: "s5", nome: "Laboratório", unidade: "Diagnóstico", necessidade: 5 },
  { id: "s6", nome: "Administrativo", unidade: "Sede", necessidade: 4 },
];

const plus = (d: number) => { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };

export const seedInstituicoes: Instituicao[] = [
  { id: "i1", nome: "Universidade de Pernambuco", contato: "estagios@upe.br", convenioAte: plus(25) },
  { id: "i2", nome: "UFPE", contato: "proext@ufpe.br", convenioAte: plus(300) },
  { id: "i3", nome: "Faculdade Pernambucana de Saúde", contato: "fps@fps.edu.br", convenioAte: plus(55) },
  { id: "i4", nome: "UNICAP", contato: "estagio@unicap.br", convenioAte: plus(-10) },
];

const cursos = ["Enfermagem", "Medicina", "Farmácia", "Biomedicina", "Administração", "Fisioterapia"];
const nomes = ["Ana Souza", "Bruno Lima", "Carla Mendes", "Diego Alves", "Elisa Rocha", "Felipe Costa", "Gabriela Nunes", "Heitor Ramos", "Isabela Freitas", "João Pedro Silva", "Larissa Melo", "Marcos Vieira", "Natália Barros", "Otávio Pinto", "Paula Cardoso", "Rafael Moura", "Sofia Araújo", "Tiago Cunha"];
const preceptores = ["Dra. Helena Castro", "Dr. Paulo Neves", "Enf. Márcia Leão", "Farm. Rui Teles", "Adm. Lúcia Prado"];

const estadosSeed: EstadoVaga[] = ["ativa", "ativa", "ativa", "encerrada", "solicitada", "selecao", "demanda", "ativa", "encerrada", "solicitada"];

export const seedVagas: Vaga[] = Array.from({ length: 30 }, (_, i) => {
  const estado = estadosSeed[i % estadosSeed.length]!;
  const s = setores[i % setores.length]!;
  return {
    id: `v${i + 1}`, setorId: s.id, tipo: i % 3 === 0 ? "Prática" : "Estágio", curso: cursos[i % cursos.length]!,
    quantidade: 1, inicio: plus(-150 + (i % 5) * 20), fim: plus(estado === "encerrada" ? -10 - i : 15 + i * 6),
    cargaHoraria: i % 2 ? 30 : 20, preceptor: preceptores[i % preceptores.length]!, estado,
    instituicaoId: estado === "demanda" ? undefined : seedInstituicoes[i % 4]!.id,
    solicitadaEm: estado === "demanda" ? undefined : plus(-200 + i * 3),
    alocadaEm: ["ativa", "encerrada"].includes(estado) ? plus(-200 + i * 3 + 12 + (i % 4) * 9) : undefined,
  };
});

const desfechos: Desfecho[] = ["contratado", "concluído", "contratado", "desligado", "não renovado"];
export const seedEstagiarios: Estagiario[] = seedVagas
  .filter((v) => v.estado === "ativa" || v.estado === "encerrada")
  .map((v, k) => {
    const bolsista = k % 4 !== 3;
    const desfecho = v.estado === "encerrada" ? desfechos[k % desfechos.length]! : null;
    return {
      id: `e${k + 1}`, nome: nomes[k % nomes.length]!, vagaId: v.id, setorId: v.setorId, instituicaoId: v.instituicaoId!,
      curso: v.curso, periodo: 5 + (k % 5), orientador: "Prof. " + ["Ribeiro", "Sales", "Moraes"][k % 3]!, preceptor: v.preceptor,
      vinculo: bolsista ? "Bolsista" : "Voluntário", bolsa: bolsista ? [800, 1000, 1200][k % 3]! : 0,
      inicio: v.inicio, fim: v.fim, atividades: "Apoio à rotina do setor, registros e acompanhamento supervisionado.",
      escala: [1, 2, 3, 4, 5].filter((d) => (d + k) % 5 !== 0).map((dia) => ({ dia, entrada: k % 2 ? "13:00" : "07:00", saida: k % 2 ? "19:00" : "13:00" })),
      documentos: DOCS.map((t, j) => ({ tipo: t, entregue: (j + k) % 6 !== 0 })),
      desfecho, cargoContratado: desfecho === "contratado" ? "Técnico(a) " + v.curso : undefined,
      contratadoEm: desfecho === "contratado" ? v.fim : undefined, horasCumpridas: 80 + k * 23,
    };
  });

export const daysUntil = (d: string) => Math.round((new Date(d).getTime() - Date.now()) / 86400000);
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmt = (d?: string) => (d ? new Date(d + "T12:00").toLocaleDateString("pt-BR") : "—");
export const monthsBetween = (a: string, b: string) => Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / (30 * 86400000)));
