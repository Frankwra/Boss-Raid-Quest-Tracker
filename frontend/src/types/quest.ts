export interface Quest {
  id: string;
  titulo: string;
  descricao: string | null;
  xp: number;
  concluida: boolean;
  criadoEm: string;
  atualizadoEm: string;
  deletadoEm: string | null;
}
