import { db, settingsTable, icd10CodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ICD10_SEED = [
  { code: "F00", title: "Démence dans la maladie d'Alzheimer", description: "Démence survenant dans la maladie d'Alzheimer.", risks: "Risque de perte d'autonomie, errance, troubles du comportement." },
  { code: "F10", title: "Troubles mentaux et du comportement liés à l'utilisation d'alcool", description: "Intoxication aiguë, usage nocif, syndrome de dépendance, état de sevrage.", risks: "Risque de rechute, complications somatiques, isolement social." },
  { code: "F20", title: "Schizophrénie", description: "Troubles schizophréniques caractérisés par des distorsions fondamentales et caractéristiques de la pensée et de la perception.", risks: "Risque de passage à l'acte hétéro/auto-agressif, désinsertion sociale." },
  { code: "F31", title: "Trouble affectif bipolaire", description: "Trouble caractérisé par au moins deux épisodes où l'humeur et le niveau d'activité du patient sont profondément perturbés.", risks: "Risque suicidaire élevé, conduites à risque (achats, sexualité)." },
  { code: "F32", title: "Épisodes dépressifs", description: "Le patient souffre d'un abaissement de l'humeur, d'une réduction de l'énergie et d'une diminution de l'activité.", risks: "Risque suicidaire, isolement, dénutrition." },
  { code: "F41", title: "Autres troubles anxieux", description: "Troubles dans lesquels la manifestation d'anxiété est le symptôme principal.", risks: "Attaques de panique, évitement social, risque de dépendance aux anxiolytiques." },
  { code: "F60", title: "Troubles spécifiques de la personnalité", description: "Troubles sévères de la constitution caractérielle et des tendances comportementales de l'individu.", risks: "Instabilité relationnelle, auto-mutilation, passages à l'acte." },
];

async function seedIcd10Codes() {
  const existing = await db.select().from(icd10CodesTable).limit(1);
  if (existing.length > 0) return;
  await db.insert(icd10CodesTable).values(
    ICD10_SEED.map((entry) => ({ ...entry, isFavorite: true }))
  );
}

export async function seedDatabase() {
  await seedIcd10Codes();

  const defaults: Record<string, string[]> = {
    casemanagers: [],
    psychiatrists: [],
    medecinsfamille: [],
    articles: ["Article 71", "Article 72", "Article 73", "CAPL"],
    curatelles: ["Curatelle totale", "Curatelle partielle", "Tutelle", "Sauvegarde de justice"],
  };

  for (const [key, value] of Object.entries(defaults)) {
    const existing = await db.select().from(settingsTable)
      .where(eq(settingsTable.key, key))
      .limit(1);

    if (!existing[0]) {
      await db.insert(settingsTable).values({ key, value: JSON.stringify(value) });
    }
  }
}
