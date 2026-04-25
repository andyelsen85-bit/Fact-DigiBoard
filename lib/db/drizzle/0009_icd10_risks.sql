-- Migration 0009: Add clinical risk descriptions for ICD-10 codes that had none.
-- Style matches existing entries: concise French, 2-4 comma-separated risk items.

-- ─────────────────────────────────────────────
-- F00 Démences Alzheimer
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Errance, chutes, dénutrition, perte d''autonomie rapide.' WHERE code = 'F00.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Errance, chutes, dénutrition, perte d''autonomie progressive.' WHERE code = 'F00.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Errance, chutes, dénutrition, troubles du comportement.' WHERE code = 'F00.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Errance, chutes, dénutrition, perte d''autonomie.' WHERE code = 'F00.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F01 Démence vasculaire
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Risque de récidive vasculaire, chutes, troubles du comportement, dépendance.' WHERE code = 'F01' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Récidive AVC imminente, confusion aiguë, agitation, dépendance rapide.' WHERE code = 'F01.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Récidives multiples, détérioration cognitive par paliers, chutes.' WHERE code = 'F01.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles de la marche, incontinence, détérioration cognitive, chutes.' WHERE code = 'F01.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Détérioration cognitive progressive, chutes, dépendance.' WHERE code = 'F01.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Détérioration cognitive, chutes, dépendance croissante.' WHERE code = 'F01.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Détérioration cognitive, chutes, perte d''autonomie.' WHERE code = 'F01.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F02 Démence au cours d'autres maladies
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Perte d''autonomie, errance, troubles du comportement, dépendance.' WHERE code = 'F02' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement prononcés, désinhibition, dépendance rapide.' WHERE code = 'F02.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Évolution fatale rapide, agitation, confusion, risque de transmission.' WHERE code = 'F02.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Mouvements choréiques, chutes, troubles psychiatriques, risque suicidaire.' WHERE code = 'F02.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Chutes, hallucinations, fluctuations cognitives, dépendance.' WHERE code = 'F02.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles cognitifs, troubles du comportement, risque infectieux.' WHERE code = 'F02.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Perte d''autonomie, troubles du comportement selon pathologie sous-jacente.' WHERE code = 'F02.8' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F03-F09 Autres troubles organiques
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Perte d''autonomie, errance, chutes, troubles du comportement.' WHERE code = 'F03' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Fabulations, confabulations, vulnérabilité à l''exploitation, dépendance.' WHERE code = 'F04' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Agitation sévère, chutes, blessures, confusion persistante.' WHERE code = 'F05.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Aggravation de la démence sous-jacente, agitation, chutes.' WHERE code = 'F05.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Agitation, chutes, confusion, risque de complication médicale.' WHERE code = 'F05.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Agitation, chutes, confusion, risque de complication médicale.' WHERE code = 'F05.9' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement, impulsivité, risque de passages à l''acte.' WHERE code = 'F06' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Hallucinations vivaces, agitation, passages à l''acte possibles.' WHERE code = 'F06.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Rigidité, complications respiratoires, risques liés à l''immobilité.' WHERE code = 'F06.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Idées délirantes, hétéro-agressivité, isolement.' WHERE code = 'F06.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire, instabilité émotionnelle, décompensation.' WHERE code = 'F06.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Attaques de panique, évitement, retentissement fonctionnel.' WHERE code = 'F06.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Amnésie, dépersonnalisation, risque de fugues ou de mise en danger.' WHERE code = 'F06.5' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Labilité émotionnelle, épuisement, retentissement relationnel.' WHERE code = 'F06.6' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Difficultés d''apprentissage, risque professionnel, plaintes somatiques.' WHERE code = 'F06.7' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement selon lésion, impulsivité, isolement.' WHERE code = 'F06.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement, impulsivité, perte d''autonomie.' WHERE code = 'F06.9' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Impulsivité, désinhibition, troubles relationnels, passages à l''acte.' WHERE code = 'F07' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Désinhibition, agressivité, comportements socialement inadaptés.' WHERE code = 'F07.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement résiduels, irritabilité, labilité émotionnelle.' WHERE code = 'F07.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Céphalées chroniques, troubles cognitifs légers, risque dépressif.' WHERE code = 'F07.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement selon atteinte cérébrale, impulsivité.' WHERE code = 'F07.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement, impulsivité, retentissement social.' WHERE code = 'F07.9' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement, impulsivité, perte d''autonomie.' WHERE code = 'F09' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F10 Alcool (sous-codes)
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Traumatismes, comportements à risque, troubles de la vigilance.' WHERE code = 'F10.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Glissement vers dépendance, complications somatiques, problèmes sociaux.' WHERE code = 'F10.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Délirium tremens, crises convulsives, complications hépatiques, décès possible.' WHERE code = 'F10.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Urgence médicale, confusion sévère, risque vital, convulsions.' WHERE code = 'F10.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Agitation, hallucinations, hétéro-agressivité, instabilité.' WHERE code = 'F10.5' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Amnésie profonde, fabulations, dépendance totale, errance.' WHERE code = 'F10.6' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles cognitifs persistants, vulnérabilité à la rechute.' WHERE code = 'F10.7' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Rechute, complications somatiques multiples, isolement.' WHERE code = 'F10.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Rechute, complications somatiques, isolement social.' WHERE code = 'F10.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F11 Opioïdes (sous-codes)
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Surdosage fatal, dépression respiratoire, coma.' WHERE code = 'F11.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Glissement vers dépendance, infections, marginalisation.' WHERE code = 'F11.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Surdosage, infections (VIH, hépatites), criminalité, précarité.' WHERE code = 'F11.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Douleurs sévères, anxiété intense, rechute immédiate, complications médicales.' WHERE code = 'F11.3' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F12 Cannabinoïdes
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Épisodes psychotiques, désinvestissement social, démotivation.' WHERE code = 'F12' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Anxiété aiguë, attaque de panique, comportements imprévisibles.' WHERE code = 'F12.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Glissement vers dépendance, troubles cognitifs, démotivation.' WHERE code = 'F12.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Psychose cannabique, démotivation, isolement, troubles cognitifs.' WHERE code = 'F12.2' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F13 Sédatifs / hypnotiques
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Sédation excessive, chutes, dépendance, interactions médicamenteuses.' WHERE code = 'F13' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Sédation excessive, chutes, dépression respiratoire.' WHERE code = 'F13.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Glissement vers dépendance, sédation résiduelle, chutes.' WHERE code = 'F13.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Dépendance sévère, tolérance, difficultés de sevrage.' WHERE code = 'F13.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Crises convulsives, agitation sévère, urgence médicale.' WHERE code = 'F13.3' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F14 Cocaïne
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Cardiotoxicité, psychose cocaïnique, agressivité, précarité.' WHERE code = 'F14' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Infarctus du myocarde, AVC, agitation intense, hyperthermie.' WHERE code = 'F14.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Glissement vers dépendance, cardiotoxicité, ruine financière.' WHERE code = 'F14.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Psychose, cardiotoxicité, ruine financière, criminalité.' WHERE code = 'F14.2' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F15 Stimulants
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Psychose, cardiotoxicité, agressivité, insomnie sévère.' WHERE code = 'F15' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Hyperthermie, tachycardie, agitation, psychose.' WHERE code = 'F15.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Glissement vers dépendance, troubles du sommeil, troubles cardiovasculaires.' WHERE code = 'F15.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Psychose, agressivité, cardiovasculaire, insomnie chronique.' WHERE code = 'F15.2' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F16 Hallucinogènes
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Comportements imprévisibles, accidents, déclenchement psychose, flashbacks.' WHERE code = 'F16' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F17 Tabac
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Complications somatiques cardiovasculaires et pulmonaires à long terme.' WHERE code = 'F17' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Glissement vers dépendance, complications somatiques progressives.' WHERE code = 'F17.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Syndrome de sevrage, rechute, complications somatiques.' WHERE code = 'F17.2' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F18 Solvants volatils
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Neurotoxicité, mort subite par asphyxie, troubles cognitifs irréversibles.' WHERE code = 'F18' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F19 Polyconsommation
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Interactions médicamenteuses graves, surdosage, comorbidités multiples.' WHERE code = 'F19' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Surdosage, interactions imprévisibles, urgence médicale.' WHERE code = 'F19.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Cumul des risques, comorbidités psychiatriques, précarité.' WHERE code = 'F19.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Poly-dépendance sévère, somatiques multiples, isolement, criminalité.' WHERE code = 'F19.2' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F20 Schizophrénie (sous-codes)
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Passages à l''acte hétéro/auto-agressif, idées persécutoires intenses, désinsertion.' WHERE code = 'F20.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Désinsertion sociale rapide, négligence des soins, auto-abandon.' WHERE code = 'F20.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Complications liées à l''immobilité, automutilation, urgence psychiatrique.' WHERE code = 'F20.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passage à l''acte auto/hétéro-agressif, désinsertion, rechute fréquente.' WHERE code = 'F20.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire élevé, résignation, chronicisation.' WHERE code = 'F20.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Négligence des soins, isolement profond, rechute sur fond résiduel.' WHERE code = 'F20.5' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Désinsertion progressive, isolement, glissement vers forme chronique.' WHERE code = 'F20.6' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte, désinsertion, rechute imprévisible.' WHERE code = 'F20.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte, désinsertion, rechute, résistance au traitement.' WHERE code = 'F20.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F21-F29 Autres troubles psychotiques
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Glissement vers psychose franche, isolement, idées de référence.' WHERE code = 'F21' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Comportements médico-légaux, isolement, passage à l''acte.' WHERE code = 'F22' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Comportements médico-légaux, escalade délirante, passage à l''acte.' WHERE code = 'F22.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Comportements médico-légaux, isolement, passage à l''acte.' WHERE code = 'F22.9' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Agitation aiguë, passages à l''acte, nécessite souvent hospitalisation.' WHERE code = 'F23' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Agitation, confusion, passages à l''acte, urgence psychiatrique.' WHERE code = 'F23.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Agitation, passages à l''acte, risque de chronicisation schizophrénique.' WHERE code = 'F23.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Agitation, passages à l''acte, risque d''évolution schizophrénique.' WHERE code = 'F23.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Comportements médico-légaux, agitation, passages à l''acte.' WHERE code = 'F23.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Agitation, passages à l''acte, urgence psychiatrique.' WHERE code = 'F23.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Agitation, passages à l''acte, urgence psychiatrique.' WHERE code = 'F23.9' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Dépendance relationnelle pathologique, isolement, passages à l''acte.' WHERE code = 'F24' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire, passages à l''acte, désinsertion.' WHERE code = 'F25' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conduites à risque, hétéro-agressivité, passages à l''acte en phase maniaque.' WHERE code = 'F25.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire élevé en phase dépressive, rechute fréquente.' WHERE code = 'F25.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire, passages à l''acte, chronicisation.' WHERE code = 'F25.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire, passages à l''acte, désinsertion.' WHERE code = 'F25.9' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte, désinsertion, évolution imprévisible.' WHERE code = 'F28' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte, désinsertion, urgence psychiatrique possible.' WHERE code = 'F29' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F30 Épisode maniaque (sous-codes)
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Impulsivité, dépenses excessives, conduites à risque légères.' WHERE code = 'F30.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Autres épisodes maniaques, conduites à risque, passages à l''acte.' WHERE code = 'F30.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conduites à risque, hétéro-agressivité, nécessite souvent hospitalisation.' WHERE code = 'F30.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F31 Bipolaire (sous-codes)
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Impulsivité modérée, glissement vers manie franche.' WHERE code = 'F31.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conduites à risque, dépenses excessives, désinhibition.' WHERE code = 'F31.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Dangerosité élevée, urgence psychiatrique, hospitalisation nécessaire.' WHERE code = 'F31.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire modéré, isolement, ralentissement fonctionnel.' WHERE code = 'F31.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire élevé, isolement sévère, dénutrition.' WHERE code = 'F31.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Instabilité majeure, risque suicidaire, passages à l''acte.' WHERE code = 'F31.6' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque de rechute, importance de l''observance thérapeutique.' WHERE code = 'F31.7' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conduites à risque, risque suicidaire, rechute imprévisible.' WHERE code = 'F31.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conduites à risque, risque suicidaire, rechute imprévisible.' WHERE code = 'F31.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F32 Épisodes dépressifs (sous-codes)
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Risque suicidaire faible à modéré, isolement, absentéisme.' WHERE code = 'F32.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire modéré, isolement, dénutrition, arrêt de travail.' WHERE code = 'F32.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire modéré, isolement, dénutrition.' WHERE code = 'F32.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire, isolement, dénutrition.' WHERE code = 'F32.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F33 Dépression récurrente
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Risque suicidaire, chronicisation, isolement progressif.' WHERE code = 'F33' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire faible à modéré, rechute, absentéisme.' WHERE code = 'F33.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire modéré, rechute, isolement.' WHERE code = 'F33.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire élevé, rechute, dénutrition, nécessite hospitalisation.' WHERE code = 'F33.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire très élevé, urgence psychiatrique, rechute.' WHERE code = 'F33.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque de rechute élevé, importance de l''observance.' WHERE code = 'F33.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Rechute, risque suicidaire, isolement.' WHERE code = 'F33.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Rechute, risque suicidaire, isolement.' WHERE code = 'F33.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F34 Troubles de l'humeur persistants
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Instabilité émotionnelle chronique, conduites impulsives, risque dépressif.' WHERE code = 'F34' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Impulsivité, conduites à risque légères, oscillations prolongées.' WHERE code = 'F34.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire modéré chronique, isolement progressif, désinvestissement.' WHERE code = 'F34.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Instabilité de l''humeur chronique, risque dépressif, isolement.' WHERE code = 'F34.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Instabilité de l''humeur, risque dépressif, isolement.' WHERE code = 'F34.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F38-F39 Autres troubles de l'humeur
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Instabilité émotionnelle, risque dépressif, passages à l''acte.' WHERE code = 'F38' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Instabilité émotionnelle, risque dépressif imprévisible.' WHERE code = 'F38.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Rechutes répétées, risque dépressif cumulatif.' WHERE code = 'F38.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Instabilité de l''humeur, risque dépressif, passages à l''acte.' WHERE code = 'F38.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Instabilité de l''humeur, risque dépressif, passages à l''acte.' WHERE code = 'F39' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F40 Troubles anxieux phobiques
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Évitement généralisé, isolement progressif, impact professionnel et social.' WHERE code = 'F40' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Évitement de l''espace public, isolement, dépendance à l''accompagnant.' WHERE code = 'F40.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Évitement de l''espace public sans panique, isolement progressif.' WHERE code = 'F40.00' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Évitement de l''espace public avec crises de panique, isolement sévère.' WHERE code = 'F40.01' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Évitement social, isolement, impact professionnel majeur.' WHERE code = 'F40.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Évitement situationnel, retentissement fonctionnel, isolement.' WHERE code = 'F40.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Évitement, isolement, retentissement fonctionnel.' WHERE code = 'F40.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Évitement, isolement, retentissement fonctionnel.' WHERE code = 'F40.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F41 Autres troubles anxieux (sous-codes)
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Recours répétés aux urgences, évitement, dépendance aux anxiolytiques.' WHERE code = 'F41.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Épuisement chronique, somatisation, risque dépressif, absentéisme.' WHERE code = 'F41.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque dépressif, isolement, épuisement.' WHERE code = 'F41.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Instabilité anxieuse et dépressive, épuisement, isolement.' WHERE code = 'F41.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Épuisement, somatisation, retentissement professionnel.' WHERE code = 'F41.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Épuisement, somatisation, retentissement fonctionnel.' WHERE code = 'F41.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F42 TOC
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Paralysie fonctionnelle, isolement, épuisement, risque dépressif.' WHERE code = 'F42' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Ruminations invalidantes, risque dépressif, isolement.' WHERE code = 'F42.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Rituels chronophages, retentissement professionnel et social.' WHERE code = 'F42.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Rituels et ruminations, paralysie fonctionnelle, isolement.' WHERE code = 'F42.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement fonctionnel, épuisement, risque dépressif.' WHERE code = 'F42.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement fonctionnel, épuisement, risque dépressif.' WHERE code = 'F42.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F43 Réactions au stress et adaptation
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Passage à l''acte impulsif, dissociation, risque suicidaire transitoire.' WHERE code = 'F43.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles de l''adaptation, risque dépressif, isolement.' WHERE code = 'F43.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire modéré, épuisement, isolement transitoire.' WHERE code = 'F43.20' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire modéré, chronicisation dépressive, isolement.' WHERE code = 'F43.21' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque dépressif et anxieux, isolement, absentéisme.' WHERE code = 'F43.22' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Instabilité émotionnelle, impulsivité, retentissement relationnel.' WHERE code = 'F43.23' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte, conduites à risque, retentissement social.' WHERE code = 'F43.24' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte, instabilité émotionnelle, retentissement fonctionnel.' WHERE code = 'F43.25' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement fonctionnel, risque dépressif ou anxieux.' WHERE code = 'F43.28' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement fonctionnel, risque dépressif ou anxieux.' WHERE code = 'F43.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement fonctionnel, risque dépressif ou anxieux.' WHERE code = 'F43.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F44 Troubles dissociatifs
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Mise en danger, automutilation, fugues, vulnérabilité à l''exploitation.' WHERE code = 'F44' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Perte d''identité, vulnérabilité à l''exploitation, mise en danger.' WHERE code = 'F44.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Errance, mise en danger, vulnérabilité à l''exploitation.' WHERE code = 'F44.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Immobilité prolongée, complications somatiques, urgence diagnostique.' WHERE code = 'F44.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Comportements imprévisibles, mise en danger, vulnérabilité à l''exploitation.' WHERE code = 'F44.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Chutes, blessures, retentissement fonctionnel sévère.' WHERE code = 'F44.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Traumatismes liés aux convulsions, mise en danger, confusion.' WHERE code = 'F44.5' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Blessures non perçues, mise en danger, retentissement fonctionnel.' WHERE code = 'F44.6' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Mise en danger multiforme, vulnérabilité à l''exploitation.' WHERE code = 'F44.7' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Mise en danger, vulnérabilité à l''exploitation, passages à l''acte.' WHERE code = 'F44.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Simulation possible de symptômes, confusion identitaire.' WHERE code = 'F44.80' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conflits identitaires sévères, risque suicidaire, automutilation.' WHERE code = 'F44.81' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Mise en danger, vulnérabilité, passages à l''acte.' WHERE code = 'F44.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F45 Troubles somatoformes
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Surconsommation médicale, iatrogénie, risque dépressif, isolement.' WHERE code = 'F45' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Surconsommation médicale, polyprescription, iatrogénie.' WHERE code = 'F45.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Surconsommation médicale, iatrogénie, retentissement fonctionnel.' WHERE code = 'F45.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Recours excessif aux soins, iatrogénie, anxiété chronique.' WHERE code = 'F45.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Recours excessif aux soins, iatrogénie, épuisement.' WHERE code = 'F45.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Chronicisation, dépendance aux antalgiques, retentissement fonctionnel.' WHERE code = 'F45.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Surconsommation médicale, iatrogénie, retentissement fonctionnel.' WHERE code = 'F45.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Surconsommation médicale, iatrogénie, retentissement fonctionnel.' WHERE code = 'F45.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F48 Autres troubles névrotiques
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Épuisement chronique, arrêts de travail répétés, risque dépressif.' WHERE code = 'F48' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Épuisement chronique, absentéisme, risque dépressif.' WHERE code = 'F48.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Perturbation identitaire, anxiété sévère, risque dépressif.' WHERE code = 'F48.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement fonctionnel, épuisement, risque dépressif.' WHERE code = 'F48.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement fonctionnel, épuisement, risque dépressif.' WHERE code = 'F48.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F50 Troubles des conduites alimentaires (sous-codes)
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Complications somatiques, dénutrition, risque vital modéré.' WHERE code = 'F50.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles électrolytiques, complications somatiques, risque suicidaire.' WHERE code = 'F50.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Obésité, troubles métaboliques, risque dépressif.' WHERE code = 'F50.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles électrolytiques, complications œsophagiennes, dénutrition.' WHERE code = 'F50.5' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Dénutrition, complications somatiques, risque suicidaire.' WHERE code = 'F50.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Complications somatiques, dénutrition, risque vital.' WHERE code = 'F50.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F51 Troubles du sommeil non organiques
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Accidents liés à la somnolence, épuisement, risque dépressif.' WHERE code = 'F51' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Épuisement, dépendance aux hypnotiques, risque dépressif.' WHERE code = 'F51.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Accidents liés à la somnolence diurne, retentissement professionnel.' WHERE code = 'F51.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Désynchronisation, épuisement, retentissement professionnel.' WHERE code = 'F51.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Blessures lors des épisodes, mise en danger, chutes.' WHERE code = 'F51.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Agitation nocturne, traumatismes, perturbation du sommeil de l''entourage.' WHERE code = 'F51.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Perturbation du sommeil, épuisement, anxiété nocturne chronique.' WHERE code = 'F51.5' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Épuisement, retentissement fonctionnel, risque dépressif.' WHERE code = 'F51.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Épuisement, retentissement fonctionnel, risque dépressif.' WHERE code = 'F51.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F52 Dysfonctions sexuelles
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Retentissement sur la relation de couple, risque dépressif, isolement.' WHERE code = 'F52' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Tensions de couple, risque dépressif, isolement.' WHERE code = 'F52.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Tensions de couple, isolement, risque dépressif.' WHERE code = 'F52.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Tensions de couple, insatisfaction, risque dépressif.' WHERE code = 'F52.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Tensions de couple, honte, risque dépressif.' WHERE code = 'F52.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Tensions de couple, honte, retentissement relationnel.' WHERE code = 'F52.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Tensions de couple, honte, retentissement relationnel.' WHERE code = 'F52.5' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Tensions de couple, douleurs chroniques, retentissement fonctionnel.' WHERE code = 'F52.6' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Comportements à risque, tensions relationnelles, exploitation possible.' WHERE code = 'F52.7' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement relationnel, risque dépressif, isolement.' WHERE code = 'F52.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement relationnel, risque dépressif, isolement.' WHERE code = 'F52.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F53 Troubles puerpéraux
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Risque suicidaire, difficulté de lien mère-enfant, décompensation.' WHERE code = 'F53' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire modéré, trouble du lien mère-enfant, épuisement.' WHERE code = 'F53.0' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F54-F59
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Aggravation de la maladie somatique sous-jacente, non-observance.' WHERE code = 'F54' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Glissement vers dépendance, interactions médicamenteuses, iatrogénie.' WHERE code = 'F55' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement somatique et fonctionnel variable selon syndrome.' WHERE code = 'F59' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F60 Troubles de la personnalité (sous-codes)
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Conflits répétés, isolement, passages à l''acte sur idées persécutoires.' WHERE code = 'F60.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Isolement profond, décompensation psychotique, désinvestissement des soins.' WHERE code = 'F60.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Automutilation, tentatives de suicide, crises émotionnelles intenses.' WHERE code = 'F60.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte impulsifs, auto-mutilation, tensions relationnelles.' WHERE code = 'F60.30' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Comportements séducteurs excessifs, relations instables, manipulation.' WHERE code = 'F60.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Paralysie décisionnelle, épuisement, risque dépressif.' WHERE code = 'F60.5' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Isolement progressif, risque dépressif, retentissement professionnel.' WHERE code = 'F60.6' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Vulnérabilité aux abus, risque dépressif, relations toxiques.' WHERE code = 'F60.7' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles relationnels, impulsivité, retentissement social.' WHERE code = 'F60.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles relationnels, impulsivité, retentissement social.' WHERE code = 'F60.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F61-F62 Modifications durables de la personnalité
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Troubles relationnels chroniques, risque dépressif, isolement.' WHERE code = 'F61' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement persistants, isolement, risque dépressif.' WHERE code = 'F62' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Reviviscences, hypervigilance chronique, risque suicidaire.' WHERE code = 'F62.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Séquelles comportementales de la maladie, risque de rechute.' WHERE code = 'F62.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement persistants, isolement, risque dépressif.' WHERE code = 'F62.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement persistants, isolement, risque dépressif.' WHERE code = 'F62.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F63 Troubles des habitudes et des impulsions
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Ruine financière, isolement, criminalité, risque suicidaire.' WHERE code = 'F63' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Ruine financière, endettement, criminalité, risque suicidaire.' WHERE code = 'F63.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte dangereux, conséquences judiciaires, mise en danger d''autrui.' WHERE code = 'F63.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conséquences judiciaires, honte, isolement.' WHERE code = 'F63.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Automutilation indolore répétée, alopécie, retentissement social.' WHERE code = 'F63.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte impulsifs, conséquences judiciaires ou sociales.' WHERE code = 'F63.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte impulsifs, retentissement social et judiciaire.' WHERE code = 'F63.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F64 Troubles de l'identité de genre
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Risque suicidaire élevé, discrimination, isolement, violence.' WHERE code = 'F64' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire, discrimination, violence, isolement.' WHERE code = 'F64.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conflits identitaires, honte, retentissement social.' WHERE code = 'F64.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Souffrance identitaire, risque suicidaire, harcèlement scolaire.' WHERE code = 'F64.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conflits identitaires, risque suicidaire, isolement.' WHERE code = 'F64.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conflits identitaires, risque suicidaire, isolement.' WHERE code = 'F64.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F65 Troubles de la préférence sexuelle
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Honte, isolement, risque dépressif, conséquences judiciaires potentielles.' WHERE code = 'F65' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Honte, isolement, retentissement relationnel.' WHERE code = 'F65.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Honte, isolement, retentissement relationnel.' WHERE code = 'F65.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conséquences judiciaires, honte, récidive, mise en danger d''autrui.' WHERE code = 'F65.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Honte, isolement, retentissement relationnel.' WHERE code = 'F65.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conséquences judiciaires graves, récidive, mise en danger d''enfants.' WHERE code = 'F65.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Blessures physiques, conséquences judiciaires, escalade possible.' WHERE code = 'F65.5' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Comportements à risque multiples, conséquences judiciaires, isolement.' WHERE code = 'F65.6' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Honte, isolement, conséquences judiciaires potentielles.' WHERE code = 'F65.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Honte, isolement, retentissement relationnel.' WHERE code = 'F65.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F66-F69 Autres troubles de la personnalité
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Conflits identitaires, risque dépressif, isolement.' WHERE code = 'F66' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Simulation, iatrogénie, interventions invasives inutiles.' WHERE code = 'F68' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Aggravation des symptômes somatiques, iatrogénie, isolement.' WHERE code = 'F68.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Interventions médicales invasives inutiles, errance médicale, iatrogénie.' WHERE code = 'F68.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement, retentissement social et judiciaire.' WHERE code = 'F68.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement, retentissement social.' WHERE code = 'F69' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F70-F79 Déficience intellectuelle
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Vulnérabilité à l''exploitation et aux abus, crises comportementales, isolement.' WHERE code = 'F70' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Vulnérabilité à l''exploitation, dépendance, crises comportementales.' WHERE code = 'F71' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Dépendance totale, automutilation, comportements hétéro-agressifs, soins complexes.' WHERE code = 'F72' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Dépendance totale, automutilation sévère, complications somatiques.' WHERE code = 'F73' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Dépendance, crises comportementales, complications selon étiologie.' WHERE code = 'F78' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Dépendance variable, crises comportementales, vulnérabilité à l''exploitation.' WHERE code = 'F79' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F80 Troubles du développement de la parole/langage
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Difficultés de communication, isolement, retentissement scolaire et social.' WHERE code = 'F80' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retard de communication, isolement social, difficultés scolaires.' WHERE code = 'F80.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Difficultés de communication, isolement, retard scolaire.' WHERE code = 'F80.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Difficultés de communication sévères, isolement, retard scolaire.' WHERE code = 'F80.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Épilepsie, régression du langage, troubles comportementaux.' WHERE code = 'F80.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Difficultés de communication, retentissement scolaire et social.' WHERE code = 'F80.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Difficultés de communication, retentissement scolaire et social.' WHERE code = 'F80.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F81 Troubles des acquisitions scolaires
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Échec scolaire, perte d''estime de soi, risque dépressif, décrochage.' WHERE code = 'F81' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Échec scolaire, perte d''estime de soi, risque de décrochage.' WHERE code = 'F81.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Difficultés scolaires, perte d''estime de soi, risque dépressif.' WHERE code = 'F81.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles de la coordination, chutes, retentissement scolaire, risque dépressif.' WHERE code = 'F82' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement scolaire global, perte d''estime de soi, risque dépressif.' WHERE code = 'F83' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F84 Troubles envahissants du développement
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Automutilation, hétéro-agressivité lors de crises, isolement, épuisement familial.' WHERE code = 'F84' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Automutilation, crises comportementales, isolement, dépendance.' WHERE code = 'F84.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Automutilation, crises comportementales, isolement, dépendance partielle.' WHERE code = 'F84.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Régression motrice et cognitive progressive, épilepsie, dépendance totale.' WHERE code = 'F84.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Régression sévère, crises comportementales, dépendance totale.' WHERE code = 'F84.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Automutilation, hétéro-agressivité, dépendance, crises comportementales.' WHERE code = 'F84.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Isolement social, rigidité, anxiété intense, risque dépressif, harcèlement.' WHERE code = 'F84.5' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement, isolement, dépendance variable.' WHERE code = 'F84.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Troubles du comportement, isolement, dépendance variable.' WHERE code = 'F84.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F88-F89 Autres troubles du développement
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Retentissement scolaire et social, perte d''estime de soi.' WHERE code = 'F88' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement scolaire et social, perte d''estime de soi.' WHERE code = 'F89' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F90 TDAH / Troubles hyperkinétiques
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Échec scolaire, accidents, comportements impulsifs, conduites à risque à l''adolescence.' WHERE code = 'F90' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Accidents, échec scolaire, impulsivité, conduites à risque.' WHERE code = 'F90.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte, troubles des conduites associés, risque judiciaire.' WHERE code = 'F90.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Accidents, impulsivité, retentissement scolaire et social.' WHERE code = 'F90.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Accidents, impulsivité, retentissement scolaire et social.' WHERE code = 'F90.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F91 Troubles des conduites
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Passages à l''acte, conséquences judiciaires, risque de personnalité dyssociale.' WHERE code = 'F91' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Violence intrafamiliale, passages à l''acte, retentissement familial sévère.' WHERE code = 'F91.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte, criminalité, rejet social, risque de délinquance.' WHERE code = 'F91.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte en groupe, risque judiciaire, marginalisation.' WHERE code = 'F91.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conflits répétés, passages à l''acte, retentissement familial et scolaire.' WHERE code = 'F91.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte, retentissement social, risque judiciaire.' WHERE code = 'F91.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte, retentissement social, risque judiciaire.' WHERE code = 'F91.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F92 Troubles mixtes conduites/émotionnels
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Passages à l''acte, risque suicidaire, marginalisation.' WHERE code = 'F92' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Risque suicidaire, passages à l''acte, isolement.' WHERE code = 'F92.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte, instabilité émotionnelle, risque dépressif.' WHERE code = 'F92.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passages à l''acte, instabilité émotionnelle, risque dépressif.' WHERE code = 'F92.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F93 Troubles émotionnels de l'enfance
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Retentissement scolaire, risque d''évolution vers trouble anxieux adulte.' WHERE code = 'F93' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Absentéisme scolaire, refus de séparation, retentissement familial.' WHERE code = 'F93.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Évitement, retentissement scolaire, risque d''anxiété chronique.' WHERE code = 'F93.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Isolement social, retentissement scolaire, risque d''anxiété sociale adulte.' WHERE code = 'F93.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Conflits familiaux, régression, souffrance chronique.' WHERE code = 'F93.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Souffrance émotionnelle, retentissement scolaire, risque dépressif.' WHERE code = 'F93.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Souffrance émotionnelle, retentissement scolaire, risque dépressif.' WHERE code = 'F93.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F94 Troubles du fonctionnement social
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Isolement, retentissement scolaire, risque d''évolution anxieuse.' WHERE code = 'F94' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Isolement scolaire et social, retentissement sur les apprentissages.' WHERE code = 'F94.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Vulnérabilité affective, difficultés relationnelles, risque dépressif.' WHERE code = 'F94.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Comportements inadaptés, vulnérabilité à l''exploitation, isolement.' WHERE code = 'F94.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Isolement, retentissement scolaire, risque dépressif.' WHERE code = 'F94.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Isolement, retentissement scolaire, risque dépressif.' WHERE code = 'F94.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F95 Tics
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Harcèlement, isolement social, retentissement scolaire, risque dépressif.' WHERE code = 'F95' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement social léger, honte, anxiété anticipatoire.' WHERE code = 'F95.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement social, honte, anxiété chronique.' WHERE code = 'F95.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Harcèlement, isolement social, retentissement scolaire sévère, risque dépressif.' WHERE code = 'F95.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement social, honte, risque dépressif.' WHERE code = 'F95.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement social, honte, risque dépressif.' WHERE code = 'F95.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F98 Autres troubles de l'enfance/adolescence
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Retentissement social et scolaire, honte, risque dépressif.' WHERE code = 'F98' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Honte, retentissement social, risque dépressif secondaire.' WHERE code = 'F98.0' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Honte, retentissement social, risque dépressif secondaire.' WHERE code = 'F98.1' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Dénutrition, retard de croissance, risque d''hospitalisation.' WHERE code = 'F98.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Ingestion de substances toxiques, risque d''intoxication.' WHERE code = 'F98.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Automutilation possible, retentissement social, stigmatisation.' WHERE code = 'F98.4' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Isolement social, retentissement scolaire, perte d''estime de soi.' WHERE code = 'F98.5' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement sur la communication, isolement social.' WHERE code = 'F98.6' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement scolaire et social, risque dépressif.' WHERE code = 'F98.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement scolaire et social, risque dépressif.' WHERE code = 'F98.9' AND risks IS NULL;

-- ─────────────────────────────────────────────
-- F99 Trouble mental sans précision
-- ─────────────────────────────────────────────
UPDATE icd10_codes SET risks = 'Risques non définis, nécessite évaluation approfondie.' WHERE code = 'F99' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Passage à l''acte impulsif, risque dépressif, dissociation, risque suicidaire.' WHERE code = 'F43' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Complications somatiques, dénutrition, risque suicidaire, risque vital.' WHERE code = 'F50' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Difficultés scolaires, perte d''estime de soi, risque dépressif.' WHERE code = 'F81.2' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement scolaire global, perte d''estime de soi, risque dépressif.' WHERE code = 'F81.3' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement scolaire, perte d''estime de soi, risque dépressif.' WHERE code = 'F81.8' AND risks IS NULL;
UPDATE icd10_codes SET risks = 'Retentissement scolaire, perte d''estime de soi, risque dépressif.' WHERE code = 'F81.9' AND risks IS NULL;
