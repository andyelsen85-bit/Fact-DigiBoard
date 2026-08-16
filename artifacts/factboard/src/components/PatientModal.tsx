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
import { useFormOptions } from "@/hooks/use-form-options";
import { BOARDS } from "./BoardBadge";
import { useLang } from "@/i18n";
import { icdText } from "@/i18n/icd";
import "@/i18n/dict/patients";

const patientSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  dob: z.string().optional(),
  adresse: z.string().optional(),
  tel: z.string().optional(),
  email: z.string().optional(),
  demandeur: z.string().optional(),
  sexe: z.string().optional(),
  medecinFamille: z.string().optional(),
  pathos: z.array(z.string()).default([]),
  psy: z.string().optional(),
  responsable: z.string().optional(),
  casemanager2: z.string().optional(),
  demande: z.string().optional(),
  datePremierContact: z.string().optional(),
  agressivite: z.number().min(-1).max(3),
  article: z.string().optional(),
  curatelle: z.string().optional(),
  remarques: z.string().optional(),
  board: z.string(),
  depotARefaire: z.string().nullish(),
});

type PatientFormValues = z.infer<typeof patientSchema>;
type PatientSavePayload = Omit<PatientFormValues, "depotARefaire"> & {
  depotARefaire: string | null;
  clientNum?: string;
};

interface PatientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: PatientSavePayload) => void;
  isPending?: boolean;
  initialValues?: Partial<PatientFormValues & { clientNum?: string; patho?: string; pathos?: string[] }>;
  title?: string;
  isEdit?: boolean;
}

function buildDefaults(initialValues?: Partial<PatientFormValues & { clientNum?: string; patho?: string; pathos?: string[] }>): PatientFormValues {
  return {
    nom: initialValues?.nom ?? "",
    prenom: initialValues?.prenom ?? "",
    dob: initialValues?.dob ?? "",
    adresse: initialValues?.adresse ?? "",
    tel: initialValues?.tel ?? "",
    email: initialValues?.email ?? "",
    demandeur: initialValues?.demandeur ?? "",
    sexe: initialValues?.sexe ?? "",
    medecinFamille: initialValues?.medecinFamille ?? "",
    pathos: Array.isArray(initialValues?.pathos) && initialValues.pathos!.length > 0
      ? initialValues.pathos!
      : (initialValues?.patho ? [initialValues.patho] : []),
    psy: initialValues?.psy ?? "",
    responsable: initialValues?.responsable ?? "",
    casemanager2: initialValues?.casemanager2 ?? "",
    demande: initialValues?.demande ?? "",
    datePremierContact: initialValues?.datePremierContact ?? "",
    agressivite: initialValues?.agressivite ?? -1,
    article: initialValues?.article ?? "",
    curatelle: initialValues?.curatelle ?? "",
    remarques: initialValues?.remarques ?? "",
    board: initialValues?.board ?? "PréAdmission",
    depotARefaire: initialValues?.depotARefaire ?? "",
  };
}

export function PatientModal({ open, onClose, onSave, isPending, initialValues, title, isEdit = false }: PatientModalProps) {
  const { t, lang } = useLang();
  const resolvedTitle = title ?? t("patients.newClient");
  const [pathoSearch, setPathoSearch] = useState("");
  const [pathoDropdownOpen, setPathoDropdownOpen] = useState(false);

  const localizedSchema = z.object({
    ...patientSchema.shape,
    nom: z.string().min(1, t("patients.nomRequired")),
    prenom: z.string().min(1, t("patients.prenomRequired")),
  });

  const { data: formOptions } = useFormOptions();
  const psychiatrists: string[] = formOptions?.psychiatrists ?? [];
  const casemanagers: string[] = formOptions?.casemanagers ?? [];
  const medecinsfamille: string[] = formOptions?.medecinsfamille ?? [];
  const articles: string[] = formOptions?.articles ?? [];
  const curatelles: string[] = formOptions?.curatelles ?? [];
  const icd10Codes = formOptions?.icd10Codes ?? [];
  const favoriteCim10 = icd10Codes.filter((c) => c.isFavorite);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(localizedSchema),
    defaultValues: buildDefaults(initialValues),
  });

  useEffect(() => {
    if (open) {
      form.reset(buildDefaults(initialValues));
      setPathoSearch("");
      setPathoDropdownOpen(false);
    }
  }, [open, initialValues]);

  const pathosValue: string[] = form.watch("pathos") ?? [];

  const filteredCim10 = pathoSearch.length >= 1
    ? icd10Codes.filter(
        (d) =>
          !pathosValue.includes(d.code) && (
            d.code.toLowerCase().includes(pathoSearch.toLowerCase()) ||
            (icdText(d, "title", lang) ?? "").toLowerCase().includes(pathoSearch.toLowerCase())
          )
      ).slice(0, 8)
    : [];

  const handlePathoAdd = useCallback((code: string) => {
    const current: string[] = form.getValues("pathos") ?? [];
    if (!current.includes(code)) {
      form.setValue("pathos", [...current, code]);
    }
    setPathoSearch("");
    setPathoDropdownOpen(false);
  }, [form]);

  const handlePathoRemove = useCallback((code: string) => {
    const current: string[] = form.getValues("pathos") ?? [];
    form.setValue("pathos", current.filter((c) => c !== code));
  }, [form]);

  function onSubmit(values: PatientFormValues) {
    const payload: PatientSavePayload = {
      ...values,
      depotARefaire: values.depotARefaire ? values.depotARefaire : null,
      ...(isEdit ? { clientNum: initialValues?.clientNum } : {}),
    };
    onSave(payload);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{resolvedTitle}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {isEdit && initialValues?.clientNum && (
              <div className="space-y-1">
                <Label>{t("patients.clientNumLabel")}</Label>
                <Input value={initialValues.clientNum} readOnly className="bg-muted text-muted-foreground" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="nom" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("patients.nom")}</FormLabel>
                  <FormControl><Input data-testid="input-nom" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="prenom" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("patients.prenom")}</FormLabel>
                  <FormControl><Input data-testid="input-prenom" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="dob" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("patients.dob")}</FormLabel>
                  <FormControl><Input type="date" data-testid="input-dob" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sexe" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("patients.sexe")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-sexe">
                        <SelectValue placeholder={t("patients.choose")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">{t("patients.sexeM")}</SelectItem>
                      <SelectItem value="F">{t("patients.sexeF")}</SelectItem>
                      <SelectItem value="Divers">{t("patients.sexeDivers")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="agressivite" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("patients.agressivite")}</FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                    <FormControl>
                      <SelectTrigger data-testid="select-agressivite">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="-1">{t("patients.aggUnknown")}</SelectItem>
                      <SelectItem value="0">{t("patients.agg0")}</SelectItem>
                      <SelectItem value="1">{t("patients.agg1")}</SelectItem>
                      <SelectItem value="2">{t("patients.agg2")}</SelectItem>
                      <SelectItem value="3">{t("patients.agg3")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="tel" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("patients.tel")}</FormLabel>
                  <FormControl><Input data-testid="input-tel" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="adresse" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("patients.adresse")}</FormLabel>
                  <FormControl><Input data-testid="input-adresse" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("patients.email")}</FormLabel>
                  <FormControl><Input type="email" data-testid="input-email" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="demandeur" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("patients.demandeur")}</FormLabel>
                  <FormControl><Input data-testid="input-demandeur" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="psy" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("patients.psy")}</FormLabel>
                  {psychiatrists.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-psy">
                          <SelectValue placeholder={t("patients.choose")} />
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
                  <FormLabel>{t("patients.caseManager")}</FormLabel>
                  {casemanagers.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-responsable">
                          <SelectValue placeholder={t("patients.choose")} />
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
                  <FormLabel>{t("patients.medecinFamille")}</FormLabel>
                  {medecinsfamille.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-medecin">
                          <SelectValue placeholder={t("patients.choose")} />
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
                  <FormLabel>{t("patients.caseManager2")}</FormLabel>
                  {casemanagers.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-cm2">
                          <SelectValue placeholder={t("patients.choose")} />
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
                  <FormLabel>{t("patients.articleLegal")}</FormLabel>
                  {articles.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-article">
                          <SelectValue placeholder={t("patients.choose")} />
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
                  <FormLabel>{t("patients.curatelle")}</FormLabel>
                  {curatelles.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-curatelle">
                          <SelectValue placeholder={t("patients.choose")} />
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
              <Label>{t("patients.diagnosticsCim10")}</Label>
              {pathosValue.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {pathosValue.map((code) => {
                    const info = icd10Codes.find((d) => d.code === code);
                    return (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                      >
                        <span className="font-mono">{code}</span>
                        {info && <span className="text-foreground/70">{icdText(info, "title", lang)}</span>}
                        <button
                          type="button"
                          className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                          onMouseDown={() => handlePathoRemove(code)}
                          aria-label={t("patients.removeCode", { code })}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="relative">
                <Input
                  data-testid="input-patho-search"
                  placeholder={t("patients.searchCim10")}
                  value={pathoSearch}
                  onChange={(e) => {
                    setPathoSearch(e.target.value);
                    setPathoDropdownOpen(true);
                  }}
                  onFocus={() => setPathoDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setPathoDropdownOpen(false), 150)}
                />
                {pathoDropdownOpen && (filteredCim10.length > 0 || (pathoSearch.length === 0 && favoriteCim10.filter((c) => !pathosValue.includes(c.code)).length > 0)) && (
                  <div className="absolute z-50 top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 overflow-hidden max-h-64 overflow-y-auto">
                    {pathoSearch.length === 0 && (
                      <>
                        <div className="px-3 py-1 text-xs font-medium text-muted-foreground bg-muted/40 border-b">
                          {t("patients.favoritePathologies")}
                        </div>
                        {favoriteCim10.filter((c) => !pathosValue.includes(c.code)).map((item) => (
                          <button
                            key={item.code}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex gap-2"
                            onMouseDown={() => handlePathoAdd(item.code)}
                          >
                            <span className="font-mono text-xs font-medium text-muted-foreground w-10 shrink-0">{item.code}</span>
                            <span className="truncate">{icdText(item, "title", lang)}</span>
                          </button>
                        ))}
                        {favoriteCim10.filter((c) => !pathosValue.includes(c.code)).length > 0 && (
                          <div className="px-3 py-1 text-xs text-muted-foreground bg-muted/20 border-t italic">
                            {t("patients.typeToSearchCim10")}
                          </div>
                        )}
                      </>
                    )}
                    {pathoSearch.length > 0 && filteredCim10.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex gap-2"
                        onMouseDown={() => handlePathoAdd(item.code)}
                      >
                        <span className="font-mono text-xs font-medium text-muted-foreground w-10 shrink-0">{item.code}</span>
                        <span className="truncate">{icdText(item, "title", lang)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="datePremierContact" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("patients.premierContact")}</FormLabel>
                  <FormControl><Input type="date" data-testid="input-premier-contact" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="board" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("patients.board")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-board">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BOARDS.map((b) => (
                        <SelectItem key={b} value={b}>{t("common.board." + b)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="depotARefaire" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("patients.depotARefaire")}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      data-testid="input-depot-a-refaire"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="demande" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("patients.motifDemande")}</FormLabel>
                <FormControl>
                  <Textarea data-testid="textarea-demande" rows={2} {...field} />
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="remarques" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("patients.remarques")}</FormLabel>
                <FormControl>
                  <Textarea data-testid="textarea-remarques" rows={2} {...field} />
                </FormControl>
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">{t("common.cancel")}</Button>
              <Button type="submit" disabled={isPending} data-testid="button-save">
                {isPending ? t("patients.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
