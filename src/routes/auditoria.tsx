import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/auditoria")({
  head: () => ({
    meta: [
      { title: "Trilha de auditoria · Estágios e Práticas" },
      { name: "description", content: "Registro de quem alterou o quê e quando na plataforma." },
      { property: "og:title", content: "Trilha de auditoria" },
      { property: "og:description", content: "Todas as alterações registradas por perfil." },
    ],
  }),
  component: Auditoria,
});

function Auditoria() {
  const { audit } = useStore();
  return (
    <>
      <PageHeader eyebrow="LGPD" title="Trilha de auditoria" />
      <div className="rounded-xl border bg-card">
        {audit.length === 0 ? <p className="p-6 text-sm text-muted-foreground">Nenhuma alteração registrada ainda. Altere uma vaga, documento ou desfecho para ver o registro aqui.</p> :
          <table className="w-full text-sm"><thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Data e hora</th><th>Usuário</th><th>Ação</th></tr></thead>
            <tbody>{audit.map((a, i) => <tr key={i} className="border-t"><td className="px-4 py-3">{new Date(a.quando).toLocaleString("pt-BR")}</td><td>{a.usuario}</td><td>{a.acao}</td></tr>)}</tbody></table>}
      </div>
    </>
  );
}
