import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_QUESTS = [
  {
    titulo: 'Derrotar Dragão Ancião',
    descricao: 'Raid semanal no covil das montanhas geladas',
    xp: 5000,
    concluida: false,
  },
  {
    titulo: 'Coletar 10 Cristais Mágicos',
    descricao: 'Encontrar cristais nas minas abandonadas',
    xp: 500,
    concluida: true,
  },
  {
    titulo: 'Limpar Masmorra Sombria',
    descricao: 'Eliminar todos os esqueletos do calabouço',
    xp: 2000,
    concluida: false,
  },
  {
    titulo: 'Salvar a Princesa',
    descricao: 'Resgate no castelo do Rei Demônio',
    xp: 3000,
    concluida: false,
  },
  {
    titulo: 'Investigar Ruínas Antigas',
    descricao: 'Decifrar os pergaminhos dos ancestrais',
    xp: 1500,
    concluida: true,
  },
  {
    titulo: 'Forjar Espada Lendária',
    descricao: 'Reunir materiais raros e levar ao ferreiro élfico',
    xp: 2500,
    concluida: false,
  },
  {
    titulo: 'Treinar com o Mestre',
    descricao: 'Subir de level com a orientação do sensei',
    xp: 800,
    concluida: true,
  },
  {
    titulo: 'Caçar 50 Lobos Sombrios',
    descricao: 'Limpar a floresta corrompida',
    xp: 1200,
    concluida: false,
  },
];

async function main(): Promise<void> {
  const existing = await prisma.quest.count();
  if (existing > 0) {
    console.log(`Banco ja possui ${existing} quest(s). Seed ignorado.`);
    console.log('Para resetar: npm run db:reset-seed');
    return;
  }

  for (const data of SAMPLE_QUESTS) {
    await prisma.quest.create({ data });
  }

  console.log(`Seed concluido: ${SAMPLE_QUESTS.length} quests criadas.`);
  console.log('  - Pendentes:', SAMPLE_QUESTS.filter((q) => !q.concluida).length);
  console.log('  - Concluidas:', SAMPLE_QUESTS.filter((q) => q.concluida).length);
}

main()
  .catch((error) => {
    console.error('Erro no seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
