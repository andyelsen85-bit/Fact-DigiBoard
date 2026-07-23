import type { Dict, Lang } from "../index";

// ─── Structured questionnaire content ────────────────────────────────────────
// FR: version used in the app (I.ROC version française / HoNOS glossaire FR)
// EN: original instruments (Penumbra I.ROC / RCPsych HoNOS)
// DE: HoNOS-D (ANQ) wording; I.ROC translated faithfully (no official DE version)
// NL: HoNOS Dutch (Trimbos) wording; I.ROC translated faithfully (no official NL version)

export interface IrocQuestion {
  domain: string;
  subdomain: string;
  label: string;
}

export interface HonosQuestion {
  label: string;
  include: string;
  exclude: string;
}

export const IROC_QUESTIONS: Record<Lang, IrocQuestion[]> = {
  fr: [
    { domain: "DOMICILE", subdomain: "SANTÉ MENTALE", label: "À quelle fréquence vous êtes-vous senti mentalement et émotionnellement en bonne santé, heureux et bien ?" },
    { domain: "DOMICILE", subdomain: "COMPÉTENCE DE VIE", label: "À quelle fréquence avez-vous eu le sentiment d'avoir les compétences nécessaires pour prendre soin de vous ?" },
    { domain: "DOMICILE", subdomain: "SÉCURITÉ ET CONFORT", label: "À quelle fréquence vous êtes-vous senti en sécurité et confortable chez vous et dans les alentours ?" },
    { domain: "OPPORTUNITÉ", subdomain: "SANTÉ PHYSIQUE", label: "À quelle fréquence vous êtes-vous en bonne santé physique ?" },
    { domain: "OPPORTUNITÉ", subdomain: "EXERCICE ET ACTIVITÉ", label: "À quelle fréquence diriez-vous que vous avez été actif ou avez fait de l'exercice de façon régulière ?" },
    { domain: "OPPORTUNITÉ", subdomain: "OBJECTIF ET ORIENTATION", label: "À quelle fréquence diriez-vous que vous vous êtes senti occupé de manière intentionnelle ?" },
    { domain: "PERSONNES", subdomain: "ENTOURAGE", label: "À quelle fréquence avez-vous eu le sentiment d'avoir des personnes / amis / proches pouvant vous soutenir si vous en aviez besoin ?" },
    { domain: "PERSONNES", subdomain: "RÉSEAU SOCIAL", label: "À quelle fréquence avez-vous participé à des activités communautaires / de groupe ?" },
    { domain: "PERSONNES", subdomain: "SE VALORISER", label: "À quelle fréquence avez-vous eu le sentiment d'avoir été capable de vous valoriser et de vous respecter ?" },
    { domain: "AUTONOMISATION", subdomain: "PARTICIPATION ET CONTRÔLE", label: "À quelle fréquence vous êtes-vous senti impliqué dans les décisions qui affectent votre vie ?" },
    { domain: "AUTONOMISATION", subdomain: "AUTOGESTION", label: "À quelle fréquence vous êtes-vous senti en contrôle et capable de gérer votre vie ?" },
    { domain: "AUTONOMISATION", subdomain: "ESPOIR D'AVENIR", label: "À quelle fréquence avez-vous eu de l'espoir pour l'avenir ?" },
  ],
  en: [
    { domain: "HOME", subdomain: "MENTAL HEALTH", label: "How often have you felt mentally and emotionally healthy, happy and well?" },
    { domain: "HOME", subdomain: "LIFE SKILLS", label: "How often have you felt you had the skills you need to take care of yourself?" },
    { domain: "HOME", subdomain: "SAFE AND COMFORTABLE", label: "How often have you felt safe and comfortable in your home and surroundings?" },
    { domain: "OPPORTUNITY", subdomain: "PHYSICAL HEALTH", label: "How often have you been in good physical health?" },
    { domain: "OPPORTUNITY", subdomain: "EXERCISE AND ACTIVITY", label: "How often would you say you have been active or exercised on a regular basis?" },
    { domain: "OPPORTUNITY", subdomain: "PURPOSE AND DIRECTION", label: "How often would you say you have felt purposefully occupied?" },
    { domain: "PEOPLE", subdomain: "PEOPLE YOU CAN RELY ON", label: "How often have you felt there were people / friends / family who could support you if you needed it?" },
    { domain: "PEOPLE", subdomain: "SOCIAL NETWORK", label: "How often have you taken part in community / group activities?" },
    { domain: "PEOPLE", subdomain: "VALUING YOURSELF", label: "How often have you felt able to value and respect yourself?" },
    { domain: "EMPOWERMENT", subdomain: "PARTICIPATION AND CONTROL", label: "How often have you felt involved in the decisions that affect your life?" },
    { domain: "EMPOWERMENT", subdomain: "SELF-MANAGEMENT", label: "How often have you felt in control and able to manage your life?" },
    { domain: "EMPOWERMENT", subdomain: "HOPE FOR THE FUTURE", label: "How often have you felt hopeful about the future?" },
  ],
  de: [
    { domain: "ZUHAUSE", subdomain: "PSYCHISCHE GESUNDHEIT", label: "Wie oft haben Sie sich mental und emotional gesund, glücklich und wohl gefühlt?" },
    { domain: "ZUHAUSE", subdomain: "LEBENSKOMPETENZ", label: "Wie oft hatten Sie das Gefühl, über die nötigen Fähigkeiten zu verfügen, um für sich selbst zu sorgen?" },
    { domain: "ZUHAUSE", subdomain: "SICHERHEIT UND KOMFORT", label: "Wie oft haben Sie sich zu Hause und in Ihrer Umgebung sicher und wohl gefühlt?" },
    { domain: "CHANCEN", subdomain: "KÖRPERLICHE GESUNDHEIT", label: "Wie oft waren Sie körperlich gesund?" },
    { domain: "CHANCEN", subdomain: "BEWEGUNG UND AKTIVITÄT", label: "Wie oft würden Sie sagen, dass Sie regelmäßig aktiv waren oder Sport getrieben haben?" },
    { domain: "CHANCEN", subdomain: "ZIEL UND ORIENTIERUNG", label: "Wie oft würden Sie sagen, dass Sie sich sinnvoll beschäftigt gefühlt haben?" },
    { domain: "MENSCHEN", subdomain: "UMFELD", label: "Wie oft hatten Sie das Gefühl, Menschen / Freunde / Angehörige zu haben, die Sie bei Bedarf unterstützen könnten?" },
    { domain: "MENSCHEN", subdomain: "SOZIALES NETZWERK", label: "Wie oft haben Sie an Gemeinschafts- / Gruppenaktivitäten teilgenommen?" },
    { domain: "MENSCHEN", subdomain: "SELBSTWERTSCHÄTZUNG", label: "Wie oft hatten Sie das Gefühl, sich selbst wertschätzen und respektieren zu können?" },
    { domain: "SELBSTBESTIMMUNG", subdomain: "TEILHABE UND KONTROLLE", label: "Wie oft haben Sie sich in die Entscheidungen einbezogen gefühlt, die Ihr Leben betreffen?" },
    { domain: "SELBSTBESTIMMUNG", subdomain: "SELBSTMANAGEMENT", label: "Wie oft hatten Sie das Gefühl, die Kontrolle zu haben und Ihr Leben bewältigen zu können?" },
    { domain: "SELBSTBESTIMMUNG", subdomain: "HOFFNUNG FÜR DIE ZUKUNFT", label: "Wie oft hatten Sie Hoffnung für die Zukunft?" },
  ],
  nl: [
    { domain: "THUIS", subdomain: "GEESTELIJKE GEZONDHEID", label: "Hoe vaak voelde u zich mentaal en emotioneel gezond, gelukkig en goed?" },
    { domain: "THUIS", subdomain: "LEVENSVAARDIGHEDEN", label: "Hoe vaak had u het gevoel dat u de vaardigheden had om voor uzelf te zorgen?" },
    { domain: "THUIS", subdomain: "VEILIGHEID EN COMFORT", label: "Hoe vaak voelde u zich veilig en comfortabel thuis en in uw omgeving?" },
    { domain: "KANSEN", subdomain: "LICHAMELIJKE GEZONDHEID", label: "Hoe vaak was u in goede lichamelijke gezondheid?" },
    { domain: "KANSEN", subdomain: "BEWEGING EN ACTIVITEIT", label: "Hoe vaak zou u zeggen dat u regelmatig actief bent geweest of aan lichaamsbeweging heeft gedaan?" },
    { domain: "KANSEN", subdomain: "DOEL EN RICHTING", label: "Hoe vaak zou u zeggen dat u zich zinvol bezig heeft gevoeld?" },
    { domain: "MENSEN", subdomain: "STEUNNETWERK", label: "Hoe vaak had u het gevoel dat er mensen / vrienden / naasten waren die u konden steunen als dat nodig was?" },
    { domain: "MENSEN", subdomain: "SOCIAAL NETWERK", label: "Hoe vaak heeft u deelgenomen aan gemeenschaps- / groepsactiviteiten?" },
    { domain: "MENSEN", subdomain: "ZELFWAARDERING", label: "Hoe vaak had u het gevoel dat u uzelf kon waarderen en respecteren?" },
    { domain: "ZELFBESCHIKKING", subdomain: "PARTICIPATIE EN CONTROLE", label: "Hoe vaak voelde u zich betrokken bij de beslissingen die uw leven beïnvloeden?" },
    { domain: "ZELFBESCHIKKING", subdomain: "ZELFMANAGEMENT", label: "Hoe vaak voelde u zich in controle en in staat om uw leven te beheren?" },
    { domain: "ZELFBESCHIKKING", subdomain: "HOOP VOOR DE TOEKOMST", label: "Hoe vaak had u hoop voor de toekomst?" },
  ],
};

export const IROC_LABELS: Record<Lang, string[]> = {
  fr: ["Jamais", "Presque jamais", "Parfois", "Souvent", "La plupart du temps", "Tout le temps"],
  en: ["Never", "Almost never", "Sometimes", "Often", "Most of the time", "All the time"],
  de: ["Nie", "Fast nie", "Manchmal", "Oft", "Meistens", "Immer"],
  nl: ["Nooit", "Bijna nooit", "Soms", "Vaak", "Meestal", "Altijd"],
};

export const HONOS_QUESTIONS: Record<Lang, HonosQuestion[]> = {
  fr: [
    { label: "Comportement hyperactif, agressif, perturbateur ou agité", include: "Toute agression quelle qu'en soit la cause · Désinhibition sexuelle · Résistance active ou agressive", exclude: "Comportement étrange (→ item 6)" },
    { label: "Auto-agressivité / risque de passage à l'acte", include: "Suicidalité · Lésions auto-infligées intentionnelles", exclude: "Blessures accidentelles · Atteintes dues directement à alcool/drogues" },
    { label: "Troubles liés à la consommation d'alcool ou de drogues", include: "Consommation incontrôlée · Abus de médicaments", exclude: "Prise de médicaments prescrits correctement · Agressivité liée (→ item 1)" },
    { label: "Troubles cognitifs", include: "Mémoire, orientation, pensée · Compréhension, langage, reconnaissance", exclude: "Troubles mentaux sans atteinte cognitive" },
    { label: "Maladie physique ou handicap", include: "Maladie/handicap limitant l'activité · Douleur, effets secondaires", exclude: "Troubles mentaux" },
    { label: "Hallucinations et délires", include: "Hallucinations, délires · Comportements bizarres associés", exclude: "Agressivité (→ item 1)" },
    { label: "Humeur dépressive", include: "Humeur dépressive · Culpabilité, dévalorisation", exclude: "Suicidalité (→ item 2) · Psychose (→ item 6)" },
    { label: "Autres troubles mentaux (principal)", include: "Trouble principal non couvert par les items 1–7", exclude: "Plusieurs troubles simultanés" },
    { label: "Relations sociales", include: "Retrait social · Relations négatives ou destructrices", exclude: "—" },
    { label: "Activités de la vie quotidienne", include: "Soins personnels · Tâches complexes", exclude: "Limites environnementales seules" },
    { label: "Conditions de vie (logement)", include: "Qualité du logement", exclude: "Handicap fonctionnel" },
    { label: "Occupation et activités", include: "Accès aux activités de jour", exclude: "Capacités personnelles" },
  ],
  en: [
    { label: "Overactive, aggressive, disruptive or agitated behaviour", include: "Any aggression whatever the cause · Sexual disinhibition · Active or aggressive resistance", exclude: "Bizarre behaviour (→ item 6)" },
    { label: "Non-accidental self-injury", include: "Suicidality · Deliberate self-inflicted injury", exclude: "Accidental injuries · Harm directly due to alcohol/drugs" },
    { label: "Problem drinking or drug-taking", include: "Uncontrolled use · Misuse of medication", exclude: "Correctly taken prescribed medication · Related aggression (→ item 1)" },
    { label: "Cognitive problems", include: "Memory, orientation, thinking · Comprehension, language, recognition", exclude: "Mental disorders without cognitive impairment" },
    { label: "Physical illness or disability problems", include: "Illness/disability limiting activity · Pain, side effects", exclude: "Mental disorders" },
    { label: "Problems associated with hallucinations and delusions", include: "Hallucinations, delusions · Associated bizarre behaviour", exclude: "Aggression (→ item 1)" },
    { label: "Problems with depressed mood", include: "Depressed mood · Guilt, self-deprecation", exclude: "Suicidality (→ item 2) · Psychosis (→ item 6)" },
    { label: "Other mental and behavioural problems (main)", include: "Main problem not covered by items 1–7", exclude: "Several simultaneous disorders" },
    { label: "Problems with relationships", include: "Social withdrawal · Negative or destructive relationships", exclude: "—" },
    { label: "Problems with activities of daily living", include: "Personal care · Complex tasks", exclude: "Environmental limitations alone" },
    { label: "Problems with living conditions", include: "Quality of accommodation", exclude: "Functional disability" },
    { label: "Problems with occupation and activities", include: "Access to daytime activities", exclude: "Personal abilities" },
  ],
  de: [
    { label: "Überaktives, aggressives, Unruhe stiftendes oder agitiertes Verhalten", include: "Jede Aggression unabhängig von der Ursache · Sexuelle Enthemmung · Aktiver oder aggressiver Widerstand", exclude: "Bizarres Verhalten (→ Item 6)" },
    { label: "Absichtliche Selbstverletzung", include: "Suizidalität · Absichtlich selbst zugefügte Verletzungen", exclude: "Unfallbedingte Verletzungen · Schäden direkt durch Alkohol/Drogen" },
    { label: "Problematischer Alkohol- oder Drogenkonsum", include: "Unkontrollierter Konsum · Medikamentenmissbrauch", exclude: "Korrekt eingenommene verschriebene Medikamente · Damit verbundene Aggression (→ Item 1)" },
    { label: "Kognitive Probleme", include: "Gedächtnis, Orientierung, Denken · Verständnis, Sprache, Erkennen", exclude: "Psychische Störungen ohne kognitive Beeinträchtigung" },
    { label: "Probleme durch körperliche Erkrankung oder Behinderung", include: "Krankheit/Behinderung mit Aktivitätseinschränkung · Schmerzen, Nebenwirkungen", exclude: "Psychische Störungen" },
    { label: "Probleme durch Halluzinationen und Wahnvorstellungen", include: "Halluzinationen, Wahn · Damit verbundenes bizarres Verhalten", exclude: "Aggression (→ Item 1)" },
    { label: "Probleme durch depressive Stimmung", include: "Depressive Stimmung · Schuldgefühle, Selbstabwertung", exclude: "Suizidalität (→ Item 2) · Psychose (→ Item 6)" },
    { label: "Andere psychische und verhaltensbezogene Probleme (Hauptproblem)", include: "Hauptproblem, das nicht durch die Items 1–7 abgedeckt ist", exclude: "Mehrere gleichzeitige Störungen" },
    { label: "Probleme mit Beziehungen", include: "Sozialer Rückzug · Negative oder destruktive Beziehungen", exclude: "—" },
    { label: "Probleme mit alltäglichen Aktivitäten", include: "Körperpflege · Komplexe Aufgaben", exclude: "Nur umgebungsbedingte Einschränkungen" },
    { label: "Probleme durch Wohnbedingungen", include: "Qualität der Wohnsituation", exclude: "Funktionelle Beeinträchtigung" },
    { label: "Probleme mit Beschäftigung und Aktivitäten", include: "Zugang zu Tagesaktivitäten", exclude: "Persönliche Fähigkeiten" },
  ],
  nl: [
    { label: "Hyperactief, agressief, destructief of geagiteerd gedrag", include: "Elke agressie ongeacht de oorzaak · Seksuele ontremming · Actief of agressief verzet", exclude: "Vreemd gedrag (→ item 6)" },
    { label: "Opzettelijke zelfverwonding", include: "Suïcidaliteit · Opzettelijk zelf toegebracht letsel", exclude: "Accidenteel letsel · Schade direct door alcohol/drugs" },
    { label: "Problematisch alcohol- of drugsgebruik", include: "Ongecontroleerd gebruik · Medicatiemisbruik", exclude: "Correct ingenomen voorgeschreven medicatie · Gerelateerde agressie (→ item 1)" },
    { label: "Cognitieve problemen", include: "Geheugen, oriëntatie, denken · Begrip, taal, herkenning", exclude: "Psychische stoornissen zonder cognitieve beperking" },
    { label: "Lichamelijke problemen of handicaps", include: "Ziekte/handicap die activiteit beperkt · Pijn, bijwerkingen", exclude: "Psychische stoornissen" },
    { label: "Problemen als gevolg van hallucinaties en waanvoorstellingen", include: "Hallucinaties, wanen · Bijbehorend vreemd gedrag", exclude: "Agressie (→ item 1)" },
    { label: "Problemen met depressieve stemming", include: "Depressieve stemming · Schuldgevoelens, zelfdepreciatie", exclude: "Suïcidaliteit (→ item 2) · Psychose (→ item 6)" },
    { label: "Overige psychische en gedragsproblemen (hoofdprobleem)", include: "Hoofdprobleem dat niet door items 1–7 wordt gedekt", exclude: "Meerdere gelijktijdige stoornissen" },
    { label: "Problemen met relaties", include: "Sociale terugtrekking · Negatieve of destructieve relaties", exclude: "—" },
    { label: "Problemen met algemene dagelijkse levensverrichtingen", include: "Persoonlijke verzorging · Complexe taken", exclude: "Alleen omgevingsbeperkingen" },
    { label: "Problemen met woonomstandigheden", include: "Kwaliteit van de huisvesting", exclude: "Functionele beperking" },
    { label: "Problemen met dagbesteding en activiteiten", include: "Toegang tot dagactiviteiten", exclude: "Persoonlijke vaardigheden" },
  ],
};

export const HONOS_LABELS: Record<Lang, string[]> = {
  fr: ["Aucun", "Minime", "Léger", "Modéré", "Grave"],
  en: ["None", "Minor", "Mild", "Moderate", "Severe"],
  de: ["Kein", "Gering", "Leicht", "Mittel", "Schwer"],
  nl: ["Geen", "Gering", "Licht", "Matig", "Ernstig"],
};

// ─── Flat UI strings for the evaluation modal & related views ────────────────

const evaluations: Dict = {
  fr: {
    title: "Évaluation {type}",
    evalDate: "Date de l'évaluation",
    last3Months: "Au cours des 3 derniers mois…",
    include: "Saisir :",
    exclude: "Exclure :",
    generalNotes: "Notes générales",
    totalScore: "Score total",
  },
  en: {
    title: "{type} Assessment",
    evalDate: "Assessment date",
    last3Months: "Over the last 3 months…",
    include: "Include:",
    exclude: "Exclude:",
    generalNotes: "General notes",
    totalScore: "Total score",
  },
  de: {
    title: "{type}-Bewertung",
    evalDate: "Datum der Bewertung",
    last3Months: "In den letzten 3 Monaten…",
    include: "Einschließen:",
    exclude: "Ausschließen:",
    generalNotes: "Allgemeine Notizen",
    totalScore: "Gesamtpunktzahl",
  },
  nl: {
    title: "{type}-beoordeling",
    evalDate: "Datum van beoordeling",
    last3Months: "In de afgelopen 3 maanden…",
    include: "Meetellen:",
    exclude: "Uitsluiten:",
    generalNotes: "Algemene notities",
    totalScore: "Totaalscore",
  },
};

export default evaluations;
