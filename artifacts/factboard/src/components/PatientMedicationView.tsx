import { useMemo, useState } from "react";
import { useListPatients, getListPatientsQueryKey, type Patient } from "@workspace/api-client-react";
import { useLang } from "@/i18n";
import "@/i18n/dict/patients";

const LOCALES: Record<string, string> = { fr: "fr-FR", en: "en-GB", de: "de-DE", nl: "nl-NL" };

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ms = target.getTime() - today.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string, lang: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(LOCALES[lang] ?? "fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export function PatientMedicationView() {
  const { t, lang } = useLang();
  const [search, setSearch] = useState("");

  function daysLabel(days: number): string {
    if (days < 0) {
      const n = Math.abs(days);
      return t(n > 1 ? "patients.overdueByPlural" : "patients.overdueBy", { count: n });
    }
    if (days === 0) return t("patients.today");
    if (days === 1) return t("patients.tomorrow");
    return t("patients.inDays", { count: days });
  }

  const { data: activePatients = [], isLoading: loadingActive } = useListPatients(
    {},
    { query: { queryKey: getListPatientsQueryKey() } }
  );
  const { data: closedPatients = [], isLoading: loadingClosed } = useListPatients(
    { board: "Clôturé" },
    { query: { queryKey: getListPatientsQueryKey({ board: "Clôturé" }) } }
  );
  const { data: irrecevablePatients = [], isLoading: loadingIrr } = useListPatients(
    { board: "Irrecevable" },
    { query: { queryKey: getListPatientsQueryKey({ board: "Irrecevable" }) } }
  );

  const isLoading = loadingActive || loadingClosed || loadingIrr;

  const rows = useMemo(() => {
    const merged: Patient[] = [
      ...activePatients,
      ...closedPatients,
      ...irrecevablePatients,
    ];
    const seen = new Set<number>();
    const unique = merged.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    const filtered = unique.filter((p) => Boolean(p.depotARefaire));
    const searched = search.trim()
      ? filtered.filter((p) =>
          `${p.nom} ${p.prenom} ${p.clientNum}`.toLowerCase().includes(search.toLowerCase())
        )
      : filtered;
    return searched
      .map((p) => ({ patient: p, days: daysUntil(p.depotARefaire as string) }))
      .sort((a, b) => a.days - b.days);
  }, [activePatients, closedPatients, irrecevablePatients, search]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold">{t("patients.medicationTitle")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("patients.medicationSubtitle")}
            </p>
          </div>
          <input
            type="search"
            placeholder={t("patients.searchClient")}
            className="w-full sm:w-64 px-2.5 py-1.5 border rounded bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-medication-search"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-card border rounded-lg p-8 text-center text-sm text-muted-foreground">
            {t("patients.noDepotClient")}
          </div>
        ) : (
          <div className="bg-card border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">{t("patients.colClient")}</th>
                  <th className="text-left px-3 py-2 font-medium">{t("patients.colClientNum")}</th>
                  <th className="text-left px-3 py-2 font-medium">{t("patients.colBoard")}</th>
                  <th className="text-left px-3 py-2 font-medium">{t("patients.colDepotDate")}</th>
                  <th className="text-right px-3 py-2 font-medium">{t("patients.colDaysLeft")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ patient, days }) => {
                  const urgent = days <= 7;
                  return (
                    <tr
                      key={patient.id}
                      data-testid={`medication-row-${patient.id}`}
                      className={`border-t ${urgent ? "bg-destructive/10 text-destructive" : ""}`}
                    >
                      <td className="px-3 py-2 font-medium">
                        {patient.nom} {patient.prenom}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{patient.clientNum}</td>
                      <td className="px-3 py-2 text-xs">{t("common.board." + patient.board)}</td>
                      <td className="px-3 py-2">{formatDate(patient.depotARefaire as string, lang)}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        <span className={urgent ? "font-semibold" : ""}>{daysLabel(days)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
