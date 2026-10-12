import { describe, it, expect } from "vitest";
import { conversao, lacuna } from "@/lib/indicadores";
import type { Estagiario, Vaga } from "@/lib/data";

describe("indicadores", () => {
  it("conversão = contratados ÷ encerrados", () => {
    const es = [{ desfecho: "contratado" }, { desfecho: "concluído" }, { desfecho: null }] as Estagiario[];
    expect(conversao(es)).toEqual({ encerrados: 2, contratados: 1, taxa: 50 });
  });
  it("lacuna desconta vagas solicitadas, em seleção e ativas", () => {
    const vs = [{ setorId: "s", estado: "ativa", quantidade: 2 }, { setorId: "s", estado: "demanda", quantidade: 1 }] as Vaga[];
    expect(lacuna({ id: "s", nome: "", unidade: "", necessidade: 5 }, vs)).toBe(3);
  });
});
