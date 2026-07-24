import { useState, useEffect, useCallback, useRef } from "react";
import { APP_VERSION } from "@/version";
import { useLocation } from "wouter";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  useGetSettings, getGetSettingsQueryKey, useUpdateSetting,
  useListUsers, getListUsersQueryKey, useCreateUser, useUpdateUser, useDeleteUser,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FORM_OPTIONS_QUERY_KEY } from "@/hooks/use-form-options";
import { useIcd10Codes, useCreateIcd10Code, useUpdateIcd10Code, useDeleteIcd10Code, type Icd10Code } from "@/hooks/use-icd10";
import { useT, useLang, LANG_LABELS, SUPPORTED_LANGS, type Lang } from "@/i18n";
import { icdText } from "@/i18n/icd";
import "@/i18n/dict/settingsPage";

interface Icd10ModalProps {
  open: boolean;
  initial?: Icd10Code;
  isNew?: boolean;
  onClose: () => void;
  onSave: (data: { code: string; title: string; description: string; risks: string }) => void;
  isPending?: boolean;
}

function ICD10EntryModal({ open, initial, isNew, onClose, onSave, isPending }: Icd10ModalProps) {
  const t = useT();
  const [code, setCode] = useState(initial?.code ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [risks, setRisks] = useState(initial?.risks ?? "");

  useEffect(() => {
    if (open) {
      setCode(initial?.code ?? "");
      setTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setRisks(initial?.risks ?? "");
    }
  }, [open, initial]);

  const canSave = code.trim().length > 0 && title.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? t("settingsPage.icdAddModalTitle") : t("settingsPage.icdEditModalTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label>{t("settingsPage.icdFieldCode")} <span className="text-destructive">*</span></Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t("settingsPage.icdCodePlaceholder")}
              readOnly={!isNew}
              className={!isNew ? "bg-muted text-muted-foreground" : ""}
              data-testid="input-icd10-code"
            />
          </div>
          <div className="space-y-1">
            <Label>{t("settingsPage.icdFieldLabel")} <span className="text-destructive">*</span></Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("settingsPage.icdLabelPlaceholder")}
              data-testid="input-icd10-label"
            />
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-1">{t("settingsPage.icdFieldDescription")} <span className="text-xs text-muted-foreground font-normal">{t("settingsPage.icdOptional")}</span></Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("settingsPage.icdDescriptionPlaceholder")}
              rows={2}
              data-testid="input-icd10-description"
            />
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-1">{t("settingsPage.icdFieldRisks")} <span className="text-xs text-muted-foreground font-normal">{t("settingsPage.icdOptional")}</span></Label>
            <Textarea
              value={risks}
              onChange={(e) => setRisks(e.target.value)}
              placeholder={t("settingsPage.icdRisksPlaceholder")}
              rows={2}
              data-testid="input-icd10-risks"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button
            disabled={!canSave || isPending}
            onClick={() => onSave({ code: code.trim(), title: title.trim(), description: description.trim(), risks: risks.trim() })}
            data-testid="button-save-icd10"
          >
            {isPending ? t("settingsPage.icdSaving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ICD10ManagementTable() {
  const { toast } = useToast();
  const t = useT();
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [editingCode, setEditingCode] = useState<Icd10Code | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);

  const { data: codes = [], isLoading } = useIcd10Codes();
  const createCode = useCreateIcd10Code();
  const updateCode = useUpdateIcd10Code();
  const deleteCode = useDeleteIcd10Code();

  const filtered = search.length >= 1
    ? codes.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.title.toLowerCase().includes(search.toLowerCase())
      )
    : codes;

  function handleToggleFavorite(entry: Icd10Code) {
    updateCode.mutate(
      { code: entry.code, isFavorite: !entry.isFavorite },
      { onError: () => toast({ title: t("common.error"), description: t("settingsPage.errorIcdUpdate"), variant: "destructive" }) }
    );
  }

  function handleEdit(data: { code: string; title: string; description: string; risks: string }) {
    updateCode.mutate(
      { code: data.code, title: data.title, description: data.description, risks: data.risks },
      {
        onSuccess: () => setEditingCode(null),
        onError: () => toast({ title: t("common.error"), description: t("settingsPage.errorIcdSave"), variant: "destructive" }),
      }
    );
  }

  function handleCreate(data: { code: string; title: string; description: string; risks: string }) {
    createCode.mutate(
      { code: data.code, title: data.title, description: data.description || null, risks: data.risks || null, isFavorite: true } as any,
      {
        onSuccess: () => setCreatingNew(false),
        onError: (err: any) => {
          const msg = err?.message?.includes("409") ? t("settingsPage.errorIcdCreateExists", { code: data.code }) : t("settingsPage.errorIcdCreate");
          toast({ title: t("common.error"), description: msg, variant: "destructive" });
        },
      }
    );
  }

  function handleDelete(code: string) {
    deleteCode.mutate(code, {
      onError: () => toast({ title: t("common.error"), description: t("settingsPage.errorIcdDelete"), variant: "destructive" }),
    });
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium">{t("settingsPage.icdTitle")}</h3>
        <Button size="sm" variant="outline" onClick={() => setCreatingNew(true)} data-testid="button-add-custom-icd10">
          {t("settingsPage.icdAddCode")}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {t("settingsPage.icdDesc")}
      </p>
      <Input
        placeholder={t("settingsPage.icdSearchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="text-sm mb-3"
        data-testid="input-new-icd10"
      />
      {isLoading ? (
        <p className="text-xs text-muted-foreground py-2">{t("settingsPage.icdLoading")}</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">{t("settingsPage.icdNoneFound")}</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-2">{filtered.length > 1 ? t("settingsPage.icdCountMany", { count: filtered.length }) : t("settingsPage.icdCountOne", { count: filtered.length })}</p>
          <div className="space-y-1.5 overflow-y-auto max-h-[720px] pr-1">
          {filtered.map((entry) => (
            <div key={entry.code} className="px-3 py-2 rounded bg-muted/40 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2 items-baseline min-w-0">
                  <span className="font-mono text-xs font-medium shrink-0 text-muted-foreground">{entry.code}</span>
                  <span className="truncate font-medium">{icdText(entry as unknown as Record<string, unknown>, "title", lang) ?? entry.title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    title={entry.isFavorite ? t("settingsPage.icdRemoveFromFavorites") : t("settingsPage.icdAddToFavorites")}
                    className={`text-sm transition-colors ${entry.isFavorite ? "text-yellow-500" : "text-muted-foreground/40 hover:text-yellow-400"}`}
                    onClick={() => handleToggleFavorite(entry)}
                    data-testid={`button-fav-icd10-${entry.code}`}
                  >
                    ★
                  </button>
                  <button
                    className="text-xs text-primary hover:underline"
                    data-testid={`button-edit-icd10-${entry.code}`}
                    onClick={() => setEditingCode(entry)}
                  >
                    {t("common.edit")}
                  </button>
                  <button
                    className="text-xs text-destructive hover:text-destructive/80"
                    data-testid={`button-remove-icd10-${entry.code}`}
                    onClick={() => handleDelete(entry.code)}
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </div>
              {icdText(entry as unknown as Record<string, unknown>, "description", lang) && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{icdText(entry as unknown as Record<string, unknown>, "description", lang)}</p>}
              <p className={`text-xs mt-1 line-clamp-2 ${entry.risks ? "text-[#7a0000]" : "text-muted-foreground italic"}`}>
                {entry.risks ? t("settingsPage.icdRisksPrefix", { risks: icdText(entry as unknown as Record<string, unknown>, "risks", lang) ?? entry.risks }) : t("settingsPage.icdNoRisk")}
              </p>
            </div>
          ))}
          </div>
        </>
      )}

      <ICD10EntryModal
        open={!!editingCode}
        initial={editingCode ?? undefined}
        onClose={() => setEditingCode(null)}
        onSave={handleEdit}
        isPending={updateCode.isPending}
      />
      <ICD10EntryModal
        open={creatingNew}
        isNew
        onClose={() => setCreatingNew(false)}
        onSave={handleCreate}
        isPending={createCode.isPending}
      />
    </div>
  );
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function BackupSection() {
  const { toast } = useToast();
  const t = useT();
  const [importing, setImporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    try {
      const res = await fetch("/api/backup/export", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? "digiboard-backup.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: t("settingsPage.backupDownloaded") });
    } catch {
      toast({ title: t("common.error"), description: t("settingsPage.errorExport"), variant: "destructive" });
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (!confirm(
        t("settingsPage.restoreConfirm", { date: payload.exportedAt?.slice(0, 10) ?? "?" })
      )) return;
      setRestoring(true);
      const res = await fetch("/api/backup/restore", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: text,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Restore failed");
      }
      toast({ title: t("settingsPage.restoreSuccessTitle"), description: t("settingsPage.restoreSuccessDesc") });
    } catch (err: any) {
      toast({ title: t("settingsPage.restoreErrorTitle"), description: err.message ?? t("settingsPage.restoreErrorDesc"), variant: "destructive" });
    } finally {
      setImporting(false);
      setRestoring(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-1">{t("settingsPage.backupTitle")}</h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t("settingsPage.backupDesc")}
      </p>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" onClick={handleExport} data-testid="button-backup-export">
          {t("settingsPage.backupDownload")}
        </Button>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
            data-testid="input-backup-file"
          />
          <Button
            size="sm"
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            disabled={importing || restoring}
            onClick={() => fileRef.current?.click()}
            data-testid="button-backup-restore"
          >
            {restoring ? t("settingsPage.backupRestoring") : t("settingsPage.backupRestore")}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface DeletedPatient {
  id: number;
  clientNum: string;
  nom: string;
  prenom: string;
  board: string;
  deletedAt: string;
}

function DeletedPatientsSection() {
  const { toast } = useToast();
  const t = useT();
  const { lang } = useLang();
  const [patients, setPatients] = useState<DeletedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<number | null>(null);

  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patients/deleted", { headers: getAuthHeaders() });
      if (res.ok) setPatients(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeleted(); }, [fetchDeleted]);

  async function handleRestore(patient: DeletedPatient) {
    setRestoring(patient.id);
    try {
      const res = await fetch(`/api/patients/${patient.id}/restore`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast({ title: t("settingsPage.clientRestoredTitle"), description: t("settingsPage.clientRestoredDesc", { name: `${patient.prenom} ${patient.nom}`, board: t("common.board." + patient.board) }) });
        fetchDeleted();
      } else {
        toast({ title: t("common.error"), description: t("settingsPage.errorRestoreClient"), variant: "destructive" });
      }
    } finally {
      setRestoring(null);
    }
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">{t("settingsPage.trashTitle")}</h3>
      {loading ? (
        <p className="text-xs text-muted-foreground py-2">{t("settingsPage.icdLoading")}</p>
      ) : patients.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">{t("settingsPage.trashEmpty")}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground text-xs">
              <th className="text-left pb-2 font-medium">{t("settingsPage.colClientNum")}</th>
              <th className="text-left pb-2 font-medium">{t("settingsPage.colName")}</th>
              <th className="text-left pb-2 font-medium">{t("settingsPage.colLastBoard")}</th>
              <th className="text-left pb-2 font-medium">{t("settingsPage.colDeletedAt")}</th>
              <th className="text-left pb-2 font-medium">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-b last:border-0" data-testid={`deleted-patient-${p.id}`}>
                <td className="py-2 font-mono text-xs">{p.clientNum}</td>
                <td className="py-2 font-medium">{p.nom} {p.prenom}</td>
                <td className="py-2 text-muted-foreground">{t("common.board." + p.board)}</td>
                <td className="py-2 text-muted-foreground text-xs">
                  {new Date(p.deletedAt).toLocaleDateString(lang)}
                </td>
                <td className="py-2">
                  <button
                    className="text-xs text-primary hover:underline disabled:opacity-50"
                    disabled={restoring === p.id}
                    data-testid={`button-restore-${p.id}`}
                    onClick={() => handleRestore(p)}
                  >
                    {restoring === p.id ? "..." : t("settingsPage.restore")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function SettingsList({ settingKey, label }: { settingKey: string; label: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useT();
  const [newItem, setNewItem] = useState("");
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const updateSetting = useUpdateSetting();

  const items: string[] = (settings as any)?.[settingKey] ?? [];

  function handleAdd() {
    if (!newItem.trim()) return;
    const updated = [...items, newItem.trim()];
    updateSetting.mutate(
      { key: settingKey, data: { value: JSON.stringify(updated) } },
      {
        onSuccess: () => {
          setNewItem("");
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        },
        onError: () => toast({ title: t("common.error"), description: t("settingsPage.errorAddItem"), variant: "destructive" }),
      }
    );
  }

  function handleRemove(item: string) {
    const updated = items.filter((i) => i !== item);
    updateSetting.mutate(
      { key: settingKey, data: { value: JSON.stringify(updated) } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() }),
        onError: () => toast({ title: t("common.error"), description: t("settingsPage.errorRemoveItem"), variant: "destructive" }),
      }
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">{label}</h3>
      <div className="space-y-1.5 mb-3">
        {items.map((item) => (
          <div key={item} className="flex items-center justify-between px-3 py-1.5 rounded bg-muted/40 text-sm">
            <span>{item}</span>
            <button
              className="text-xs text-destructive hover:text-destructive/80"
              data-testid={`button-remove-${settingKey}-${item}`}
              onClick={() => handleRemove(item)}
            >
              {t("common.delete")}
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">{t("settingsPage.listEmpty")}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder={t("settingsPage.listAddPlaceholder")}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="text-sm"
          data-testid={`input-new-${settingKey}`}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button size="sm" onClick={handleAdd} disabled={updateSetting.isPending} data-testid={`button-add-${settingKey}`}>
          {t("common.add")}
        </Button>
      </div>
    </div>
  );
}

function UserModal({
  open,
  onClose,
  onSave,
  isPending,
  initial,
  title,
  showPassword,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: { username: string; email: string; role: string; password?: string }) => void;
  isPending?: boolean;
  initial?: { username?: string; email?: string | null; role?: string };
  title: string;
  showPassword?: boolean;
}) {
  const t = useT();
  const [username, setUsername] = useState(initial?.username ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState(initial?.role ?? "user");
  const [password, setPassword] = useState("");

  const canSave = !!username.trim() && (!showPassword || password.length >= 6);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label>{t("settingsPage.fieldUsername")}</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} data-testid="input-user-username" />
          </div>
          <div className="space-y-1">
            <Label>{t("settingsPage.fieldEmail")}</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" data-testid="input-user-email" />
          </div>
          <div className="space-y-1">
            <Label>{t("settingsPage.fieldRole")}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger data-testid="select-user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{t("settingsPage.roleOptionUser")}</SelectItem>
                <SelectItem value="admin">{t("settingsPage.roleOptionAdmin")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {showPassword && (
            <div className="space-y-1">
              <Label>{t("settingsPage.fieldInitialPassword")} <span className="text-muted-foreground font-normal">{t("settingsPage.passwordMinHint")}</span></Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("settingsPage.initialPasswordPlaceholder")}
                data-testid="input-user-password"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button
            onClick={() => onSave({ username, email, role, ...(showPassword ? { password } : {}) })}
            disabled={isPending || !canSave}
            data-testid="button-save-user"
          >
            {isPending ? t("settingsPage.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordModal({
  open, onClose, user: targetUser,
}: { open: boolean; onClose: () => void; user: { id: number; username: string } | null }) {
  const { toast } = useToast();
  const t = useT();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => { if (open) { setPassword(""); setConfirm(""); } }, [open]);

  const reset = useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) => {
      const token = localStorage.getItem("auth-token");
      const res = await fetch(`/api/users/${id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Erreur"); }
      return res.json();
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      toast({ title: t("settingsPage.passwordResetTitle"), description: t("settingsPage.passwordResetDesc", { username: targetUser?.username ?? "" }) });
      onClose();
    },
    onError: (e: any) => toast({ title: t("common.error"), description: e.message, variant: "destructive" }),
  });

  const canSave = password.length >= 6 && password === confirm;

  if (!targetUser) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("settingsPage.resetPasswordTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            {t("settingsPage.resetPasswordIntro", { username: targetUser.username })}
          </p>
          <div className="space-y-1">
            <Label>{t("settingsPage.fieldNewPassword")} <span className="text-muted-foreground font-normal">{t("settingsPage.passwordMinHint")}</span></Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("settingsPage.newPasswordPlaceholder")}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("settingsPage.fieldConfirmPassword")}</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t("settingsPage.confirmPasswordPlaceholder")}
            />
            {confirm && password !== confirm && (
              <p className="text-xs text-destructive">{t("settingsPage.passwordsMismatch")}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button
            onClick={() => reset.mutate({ id: targetUser.id, password })}
            disabled={!canSave || reset.isPending}
          >
            {reset.isPending ? t("settingsPage.savingShort") : t("settingsPage.resetAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DefaultPeriodSection() {
  const { toast } = useToast();
  const t = useT();
  const queryClient = useQueryClient();
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const updateSetting = useUpdateSetting();
  const current = ((settings as any)?.defaultStatsPeriod as string) ?? "6m";

  const PERIOD_OPTIONS = [
    { value: "1m", label: t("settingsPage.period1m") },
    { value: "6m", label: t("settingsPage.period6m") },
    { value: "12m", label: t("settingsPage.period12m") },
    { value: "all", label: t("settingsPage.periodAll") },
  ];

  function handleChange(value: string) {
    updateSetting.mutate(
      { key: "defaultStatsPeriod", data: { value } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          toast({ title: t("settingsPage.periodUpdated") });
        },
        onError: () => toast({ title: t("common.error"), description: t("settingsPage.errorSavePeriod"), variant: "destructive" }),
      }
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="mb-3">
        <p className="text-sm font-medium">{t("settingsPage.periodTitle")}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("settingsPage.periodDesc")}
        </p>
      </div>
      <div className="flex gap-2">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleChange(opt.value)}
            className={`px-4 py-1.5 rounded border text-sm font-medium transition-colors ${
              current === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LanguageSection() {
  const { toast } = useToast();
  const t = useT();
  const { lang, setLang } = useLang();
  const queryClient = useQueryClient();
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const updateSetting = useUpdateSetting();
  const current = (((settings as any)?.language as string) ?? lang) as Lang;

  function handleChange(value: Lang) {
    updateSetting.mutate(
      { key: "language", data: { value } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          setLang(value);
          toast({ title: t("settingsPage.languageUpdated") });
        },
        onError: () => toast({ title: t("common.error"), description: t("settingsPage.errorSaveLanguage"), variant: "destructive" }),
      }
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="mb-3">
        <p className="text-sm font-medium">{t("settingsPage.languageCardTitle")}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("settingsPage.languageCardDesc")}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {SUPPORTED_LANGS.map((l) => (
          <button
            key={l}
            onClick={() => handleChange(l)}
            disabled={updateSetting.isPending}
            data-testid={`button-language-${l}`}
            className={`px-4 py-1.5 rounded border text-sm font-medium transition-colors ${
              current === l
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>
    </div>
  );
}

function IrocSection() {
  const { toast } = useToast();
  const t = useT();
  const queryClient = useQueryClient();
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const updateSetting = useUpdateSetting();
  const enabled = ((settings as any)?.irocEnabled ?? false) === true;

  function handleChange(value: boolean) {
    updateSetting.mutate(
      { key: "irocEnabled", data: { value: value ? "true" : "false" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: FORM_OPTIONS_QUERY_KEY });
          toast({ title: t("settingsPage.irocUpdated") });
        },
        onError: () => toast({ title: t("common.error"), description: t("settingsPage.errorSaveIroc"), variant: "destructive" }),
      }
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="mb-3">
        <p className="text-sm font-medium">{t("settingsPage.irocCardTitle")}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t("settingsPage.irocCardDesc")}</p>
      </div>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => handleChange(false)}
          disabled={updateSetting.isPending}
          data-testid="button-iroc-disabled"
          className={`px-4 py-1.5 rounded border text-sm font-medium transition-colors ${
            !enabled
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:bg-muted"
          }`}
        >
          {t("settingsPage.irocDisabledLabel")}
        </button>
        <button
          onClick={() => handleChange(true)}
          disabled={updateSetting.isPending}
          data-testid="button-iroc-enabled"
          className={`px-4 py-1.5 rounded border text-sm font-medium transition-colors ${
            enabled
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:bg-muted"
          }`}
        >
          {t("settingsPage.irocEnabledLabel")}
        </button>
      </div>
      <div className="text-xs text-muted-foreground border-t pt-3">
        <p>{t("settingsPage.irocLicenseNote")}</p>
        <a
          href="https://irocwellbeing.com/our-licences.aspx"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:no-underline mt-1 inline-block"
          data-testid="link-iroc-license"
        >
          {t("settingsPage.irocLicenseLink")} ↗
        </a>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const t = useT();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<{ id: number; username: string } | null>(null);

  const { data: users = [] } = useListUsers({ query: { queryKey: getListUsersQueryKey() } });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  function handleCreateUser(values: { username: string; email: string; role: string; password?: string }) {
    createUser.mutate(
      { data: { username: values.username, email: values.email, role: values.role, password: values.password } },
      {
        onSuccess: () => {
          setShowCreateUser(false);
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          toast({ title: t("settingsPage.userCreatedTitle"), description: t("settingsPage.userCreatedDesc") });
        },
        onError: () => toast({ title: t("common.error"), description: t("settingsPage.errorCreateUser"), variant: "destructive" }),
      }
    );
  }

  function handleUpdateUser(values: { username: string; email: string; role: string }) {
    if (!editingUser) return;
    updateUser.mutate(
      { id: editingUser.id, data: { username: values.username, email: values.email, role: values.role } },
      {
        onSuccess: () => {
          setEditingUser(null);
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          toast({ title: t("settingsPage.userUpdated") });
        },
        onError: () => toast({ title: t("common.error"), description: t("settingsPage.errorUpdateUser"), variant: "destructive" }),
      }
    );
  }

  function handleDeleteUser(id: number, username: string) {
    if (!confirm(t("settingsPage.deleteUserConfirm", { username }))) return;
    deleteUser.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          toast({ title: t("settingsPage.userDeleted") });
        },
      }
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-12 border-b bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h1
            className="font-bold text-base tracking-tight cursor-pointer"
            onClick={() => setLocation("/board")}
            data-testid="app-logo-settings"
          >
            Digi<span className="font-light">Board</span>
          </h1>
          <span className="text-[10px] text-muted-foreground/60 font-mono" data-testid="text-version-settings">v{APP_VERSION}</span>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="text-sm font-medium">{t("settingsPage.pageTitle")}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{user?.username}</span>
          <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setLocation("/board")} data-testid="button-back-board">
            {t("settingsPage.backToBoard")}
          </button>
          <button className="text-xs text-muted-foreground hover:text-foreground" onClick={logout} data-testid="button-logout-settings">
            {t("common.logout")}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-semibold">{t("settingsPage.pageTitle")}</h2>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("settingsPage.sectionProviders")}</h3>
            <div className="grid grid-cols-3 gap-4">
              <SettingsList settingKey="casemanagers" label={t("settingsPage.labelCasemanagers")} />
              <SettingsList settingKey="psychiatrists" label={t("settingsPage.labelPsychiatrists")} />
              <SettingsList settingKey="medecinsfamille" label={t("settingsPage.labelMedecinsfamille")} />
            </div>
            <p className="text-xs text-muted-foreground mt-2"
               dangerouslySetInnerHTML={{ __html: t("settingsPage.providersNote", { cm2: `<strong>${t("settingsPage.providersNoteCm2")}</strong>`, cm: `<strong>${t("settingsPage.providersNoteCm")}</strong>` }) }}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("settingsPage.sectionOtherLists")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <SettingsList settingKey="articles" label={t("settingsPage.labelArticles")} />
              <SettingsList settingKey="curatelles" label={t("settingsPage.labelCuratelles")} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("settingsPage.sectionTrash")}</h3>
            <DeletedPatientsSection />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("settingsPage.sectionDefaultFilters")}</h3>
            <DefaultPeriodSection />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("settingsPage.sectionLanguage")}</h3>
            <LanguageSection />
          </div>

          {user?.role === "admin" && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("settingsPage.sectionIroc")}</h3>
              <IrocSection />
            </div>
          )}

          {user?.role === "admin" && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("settingsPage.sectionBackup")}</h3>
              <BackupSection />
            </div>
          )}

          {user?.role === "admin" && (
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">{t("settingsPage.usersTitle")}</h3>
                <Button size="sm" onClick={() => setShowCreateUser(true)} data-testid="button-create-user">
                  {t("settingsPage.createUser")}
                </Button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left pb-2 font-medium">{t("settingsPage.colUsername")}</th>
                    <th className="text-left pb-2 font-medium">{t("settingsPage.colEmail")}</th>
                    <th className="text-left pb-2 font-medium">{t("settingsPage.colRole")}</th>
                    <th className="text-left pb-2 font-medium">{t("settingsPage.colStatus")}</th>
                    <th className="text-left pb-2 font-medium">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0" data-testid={`user-row-${u.id}`}>
                      <td className="py-2 font-medium">{u.username}</td>
                      <td className="py-2 text-muted-foreground">{u.email ?? "-"}</td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-0.5 rounded border ${u.role === "admin" ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"}`}>
                          {u.role === "admin" ? t("settingsPage.roleAdmin") : t("settingsPage.roleUser")}
                        </span>
                      </td>
                      <td className="py-2">
                        {u.mustChangePassword && (
                          <span className="text-xs text-amber-600">{t("settingsPage.mustChangePassword")}</span>
                        )}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            className="text-xs text-primary hover:underline"
                            data-testid={`button-edit-user-${u.id}`}
                            onClick={() => setEditingUser(u)}
                          >
                            {t("common.edit")}
                          </button>
                          {u.id !== user?.id && (
                            <button
                              className="text-xs text-amber-600 hover:underline"
                              data-testid={`button-reset-password-${u.id}`}
                              onClick={() => setResetPasswordUser({ id: u.id, username: u.username })}
                            >
                              {t("settingsPage.resetPassword")}
                            </button>
                          )}
                          {u.id !== user?.id && (
                            <button
                              className="text-xs text-destructive hover:underline"
                              data-testid={`button-delete-user-${u.id}`}
                              onClick={() => handleDeleteUser(u.id, u.username)}
                            >
                              {t("common.delete")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("settingsPage.sectionPathologies")}</h3>
            <ICD10ManagementTable />
          </div>
        </div>
      </main>

      <UserModal
        open={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSave={handleCreateUser}
        isPending={createUser.isPending}
        title={t("settingsPage.createUserTitle")}
        showPassword
      />

      <UserModal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleUpdateUser}
        isPending={updateUser.isPending}
        initial={editingUser}
        title={t("settingsPage.editUserTitle")}
      />

      <ResetPasswordModal
        open={!!resetPasswordUser}
        onClose={() => setResetPasswordUser(null)}
        user={resetPasswordUser}
      />
    </div>
  );
}