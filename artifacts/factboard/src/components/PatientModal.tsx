import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CIM10_DATA } from "@/data/cim10";
import { useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { BOARDS } from "./BoardBadge";

const patientSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  dob: z.string().optional(),
  adresse: z.string().optional(),
  tel: z.string().optional(),
  sexe: z.string().optional(),
  medecinFamille: z.string().optional(),
  patho: z.string().optional(),
  psy: z.string().optional(),
  responsable: z.string().optional(),
  casemanager2: z.string().optional(),
  demande: z.string().optional(),
  datePremierContact: z.string().optional(),
  dateEntree: z.string().optional(),
  agressivite: z.number().min(0).max(3),
  article: z.string().optional(),
  curatelle: z.string().optional(),
  remarques: z.string().optional(),
  board: z.string(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: PatientFormValues & { clientNum?: string }) => void;
  isPending?: boolean;
  initialValues?: Partial<PatientFormValues & { clientNum?: string }>;
  title?: string;
  isEdit?: boolean;
}

function buildDefaults(initialValues?: Partial<PatientFormValues & { clientNum?: string }>): PatientFormValues {
  return {
    nom: initialValues?.nom ?? "",
    prenom: initialValues?.prenom ?? "",
    dob: initialValues?.dob ?? "",
    adresse: initialValues?.adresse ?? "",
    tel: initialValues?.tel ?? "",
    sexe: initialValues?.sexe ?? "",
    medecinFamille: initialValues?.medecinFamille ?? "",
    patho: initialValues?.patho ?? "",
    psy: initialValues?.psy ?? "",
    responsable: initialValues?.responsable ?? "",
    casemanager2: initialValues?.casemanager2 ?? "",
    demande: initialValues?.demande ?? "",
    datePremierContact: initialValues?.datePremierContact ?? "",
    dateEntree: initialValues?.dateEntree ?? new Date().toISOString().slice(0, 10),
    agressivite: initialValues?.agressivite ?? 0,
    article: initialValues?.article ?? "",
    curatelle: initialValues?.curatelle ?? "",
    remarques: initialValues?.remarques ?? "",
    board: initialValues?.board ?? "PréAdmission",
  };
}

export function PatientModal({ open, onClose, onSave, isPending, initialValues, title = "Nouveau patient", isEdit = false }: PatientModalProps) {
  const [pathoSearch, setPathoSearch] = useState(initialValues?.patho ?? "");
  const [pathoDropdownOpen, setPathoDropdownOpen] = useState(false);

  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const psychiatrists: string[] = (settings as any)?.psychiatrists ?? [];
  const casemanagers: string[] = (settings as any)?.casemanagers ?? [];
  const medecinsfamille: string[] = (settings as any)?.medecinsfamille ?? [];
  const articles: string[] = (settings as any)?.articles ?? [];
  const curatelles: string[] = (settings as any)?.curatelles ?? [];
  const rawFavorites: unknown = (settings as any)?.icd10favorites;
  const icd10favorites: Array<{ c: string; t: string; d?: string; r?: string }> = Array.isArray(rawFavorites)
    ? rawFavorites.map((item) =>
        typeof item === "string"
          ? (CIM10_DATA.find((d) => d.c === item) ?? { c: item, t: item })
          : (item as { c: string; t: string; d?: string; r?: string })
      )
    : [];

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: buildDefaults(initialValues),
  });

  useEffect(() => {
    if (open) {
      form.reset(buildDefaults(initialValues));
      setPathoSearch(initialValues?.patho ?? "");
      setPathoDropdownOpen(false);
    }
  }, [open]);

  const pathoValue = form.watch("patho");
  const pathoInfo = icd10favorites.find((e) => e.c === pathoValue) ?? CIM10_DATA.find((d) => d.c === pathoValue);

  const favoriteCim10 = icd10favorites;

  const filteredCim10 = pathoSearch.length >= 1
    ? CIM10_DATA.filter(
        (d) =>
          d.c.toLowerCase().includes(pathoSearch.toLowerCase()) ||
          d.t.toLowerCase().includes(pathoSearch.toLowerCase())
      ).slice(0, 8)
    : [];

  const handlePathoSelect = useCallback((code: string) => {
    form.setValue("patho", code);
    setPathoSearch(code);
    setPathoDropdownOpen(false);
  }, [form]);

  function onSubmit(values: PatientFormValues) {
    const payload = isEdit
      ? { ...values, clientNum: initialValues?.clientNum }
      : values;
    onSave(payload);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {isEdit && initialValues?.clientNum && (
              <div className="space-y-1">
                <Label>N° Client (auto-généré)</Label>
                <Input value={initialValues.clientNum} readOnly className="bg-muted text-muted-foreground" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="nom" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input data-testid="input-nom" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="prenom" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl><Input data-testid="input-prenom" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="dob" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de naissance</FormLabel>
                  <FormControl><Input type="date" data-testid="input-dob" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sexe" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexe</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-sexe">
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                      <SelectItem value="Divers">Divers</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="agressivite" render={({ field }) => (
                <FormItem>
                  <FormLabel>Agressivité</FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                    <FormControl>
                      <SelectTrigger data-testid="select-agressivite">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Aucune</SelectItem>
                      <SelectItem value="1">Niveau 1</SelectItem>
                      <SelectItem value="2">Niveau 2</SelectItem>
                      <SelectItem value="3">Niveau 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="tel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl><Input data-testid="input-tel" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="adresse" render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl><Input data-testid="input-adresse" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="psy" render={({ field }) => (
                <FormItem>
                  <FormLabel>Psychiatre</FormLabel>
                  {psychiatrists.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-psy">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {psychiatrists.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl><Input data-testid="input-psy" {...field} /></FormControl>
                  )}
                </FormItem>
              )} />
              <FormField control={form.control} name="responsable" render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Manager</FormLabel>
                  {casemanagers.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-responsable">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {casemanagers.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl><Input data-testid="input-responsable" {...field} /></FormControl>
                  )}
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="medecinFamille" render={({ field }) => (
                <FormItem>
                  <FormLabel>Médecin de famille</FormLabel>
                  {medecinsfamille.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-medecin">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {medecinsfamille.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl><Input data-testid="input-medecin" {...field} /></FormControl>
                  )}
                </FormItem>
              )} />
              <FormField control={form.control} name="casemanager2" render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Manager 2</FormLabel>
                  {casemanagers.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-cm2">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {casemanagers.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl><Input data-testid="input-cm2" {...field} /></FormControl>
                  )}
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="article" render={({ field }) => (
                <FormItem>
                  <FormLabel>Article légal</FormLabel>
                  {articles.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-article">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {articles.map((a) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl><Input data-testid="input-article" {...field} /></FormControl>
                  )}
                </FormItem>
              )} />
              <FormField control={form.control} name="curatelle" render={({ field }) => (
                <FormItem>
                  <FormLabel>Curatelle / Tutelle</FormLabel>
                  {curatelles.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-curatelle">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {curatelles.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl><Input data-testid="input-curatelle" {...field} /></FormControl>
                  )}
                </FormItem>
              )} />
            </div>

            <div className="space-y-1">
              <Label>Pathologie (ICD-10)</Label>
              <div className="relative">
                <Input
                  data-testid="input-patho-search"
                  placeholder="Rechercher code ou libellé..."
                  value={pathoSearch || pathoValue || ""}
                  onChange={(e) => {
                    setPathoSearch(e.target.value);
                    setPathoDropdownOpen(true);
                    if (!e.target.value) form.setValue("patho", "");
                  }}
                  onFocus={() => setPathoDropdownOpen(true)}
                />
                {pathoDropdownOpen && (filteredCim10.length > 0 || (pathoSearch.length === 0 && favoriteCim10.length > 0)) && (
                  <div className="absolute z-50 top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 overflow-hidden max-h-64 overflow-y-auto">
                    {pathoSearch.length === 0 && favoriteCim10.length > 0 && (
                      <>
                        <div className="px-3 py-1 text-xs font-medium text-muted-foreground bg-muted/40 border-b">
                          Pathologies favorites
                        </div>
                        {favoriteCim10.map((item) => (
                          <button
                            key={item.c}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex gap-2"
                            onMouseDown={() => handlePathoSelect(item.c)}
                          >
                            <span className="font-mono text-xs font-medium text-muted-foreground w-10 shrink-0">{item.c}</span>
                            <span className="truncate">{item.t}</span>
                          </button>
                        ))}
                        <div className="px-3 py-1 text-xs text-muted-foreground bg-muted/20 border-t border-b italic">
                          Tapez pour rechercher dans tous les codes ICD-10…
                        </div>
                      </>
                    )}
                    {pathoSearch.length > 0 && filteredCim10.map((item) => (
                      <button
                        key={item.c}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex gap-2"
                        onMouseDown={() => handlePathoSelect(item.c)}
                      >
                        <span className="font-mono text-xs font-medium text-muted-foreground w-10 shrink-0">{item.c}</span>
                        <span className="truncate">{item.t}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {pathoInfo && (
                <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm space-y-1">
                  <p className="text-foreground">{pathoInfo.d}</p>
                  <p className="text-destructive text-xs">Risques : {pathoInfo.r}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="datePremierContact" render={({ field }) => (
                <FormItem>
                  <FormLabel>1er contact</FormLabel>
                  <FormControl><Input type="date" data-testid="input-premier-contact" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="dateEntree" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'entrée</FormLabel>
                  <FormControl><Input type="date" data-testid="input-date-entree" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="board" render={({ field }) => (
                <FormItem>
                  <FormLabel>Board</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-board">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BOARDS.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="demande" render={({ field }) => (
              <FormItem>
                <FormLabel>Motif de demande</FormLabel>
                <FormControl>
                  <Textarea data-testid="textarea-demande" rows={2} {...field} />
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="remarques" render={({ field }) => (
              <FormItem>
                <FormLabel>Remarques</FormLabel>
                <FormControl>
                  <Textarea data-testid="textarea-remarques" rows={2} {...field} />
                </FormControl>
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">Annuler</Button>
              <Button type="submit" disabled={isPending} data-testid="button-save">
                {isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
