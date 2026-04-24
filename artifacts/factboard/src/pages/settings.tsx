import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
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
import { CIM10_DATA } from "@/data/cim10";

interface ICD10Entry {
  c: string;
  t: string;
  d?: string;
  r?: string;
}

function parseFavorites(raw: unknown): ICD10Entry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item): ICD10Entry => {
    if (typeof item === "string") {
      const info = CIM10_DATA.find((d) => d.c === item);
      return info ? { c: info.c, t: info.t, d: info.d, r: info.r } : { c: item, t: item };
    }
    return item as ICD10Entry;
  });
}

interface ICD10EntryModalProps {
  open: boolean;
  initial?: ICD10Entry;
  isNew?: boolean;
  onClose: () => void;
  onSave: (entry: ICD10Entry) => void;
  isPending?: boolean;
}

function ICD10EntryModal({ open, initial, isNew, onClose, onSave, isPending }: ICD10EntryModalProps) {
  const [c, setC] = useState(initial?.c ?? "");
  const [t, setT] = useState(initial?.t ?? "");
  const [d, setD] = useState(initial?.d ?? "");
  const [r, setR] = useState(initial?.r ?? "");

  useEffect(() => {
    if (open) {
      setC(initial?.c ?? "");
      setT(initial?.t ?? "");
      setD(initial?.d ?? "");
      setR(initial?.r ?? "");
    }
  }, [open, initial]);

  const canSave = c.trim().length > 0 && t.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Ajouter un code ICD-10" : "Modifier le code ICD-10"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label>Code <span className="text-destructive">*</span></Label>
            <Input
              value={c}
              onChange={(e) => setC(e.target.value.toUpperCase())}
              placeholder="ex: F20, Z99, CUSTOM-01"
              readOnly={!isNew}
              className={!isNew ? "bg-muted text-muted-foreground" : ""}
              data-testid="input-icd10-code"
            />
          </div>
          <div className="space-y-1">
            <Label>Libellé <span className="text-destructive">*</span></Label>
            <Input
              value={t}
              onChange={(e) => setT(e.target.value)}
              placeholder="Intitulé du diagnostic"
              data-testid="input-icd10-label"
            />
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-1">Description <span className="text-xs text-muted-foreground font-normal">(optionnel)</span></Label>
            <Textarea
              value={d}
              onChange={(e) => setD(e.target.value)}
              placeholder="Description clinique..."
              rows={2}
              data-testid="input-icd10-description"
            />
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-1">Risques <span className="text-xs text-muted-foreground font-normal">(optionnel)</span></Label>
            <Textarea
              value={r}
              onChange={(e) => setR(e.target.value)}
              placeholder="Risques associés..."
              rows={2}
              data-testid="input-icd10-risks"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            disabled={!canSave || isPending}
            onClick={() => onSave({ c: c.trim(), t: t.trim(), d: d.trim() || undefined, r: r.trim() || undefined })}
            data-testid="button-save-icd10"
          >
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ICD10FavoritesList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ICD10Entry | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const updateSetting = useUpdateSetting();

  const entries: ICD10Entry[] = parseFavorites((settings as any)?.icd10favorites);

  const filtered = search.length >= 1
    ? CIM10_DATA.filter(
        (d) =>
          d.c.toLowerCase().includes(search.toLowerCase()) ||
          d.t.toLowerCase().includes(search.toLowerCase())
      ).filter((d) => !entries.some((e) => e.c === d.c)).slice(0, 8)
    : [];

  function save(updated: ICD10Entry[], onDone?: () => void) {
    updateSetting.mutate(
      { key: "icd10favorites", data: { value: JSON.stringify(updated) } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          onDone?.();
        },
        onError: () => toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" }),
      }
    );
  }

  function handleAddFromSearch(item: typeof CIM10_DATA[0]) {
    const entry: ICD10Entry = { c: item.c, t: item.t, d: item.d, r: item.r };
    save([...entries, entry], () => { setSearch(""); setDropdownOpen(false); });
  }

  function handleSaveEdit(updated: ICD10Entry) {
    const newEntries = entries.map((e) => e.c === updated.c ? updated : e);
    save(newEntries, () => setEditingEntry(null));
  }

  function handleSaveNew(entry: ICD10Entry) {
    if (entries.some((e) => e.c === entry.c)) {
      toast({ title: "Code déjà existant", description: `Le code ${entry.c} est déjà dans la liste.`, variant: "destructive" });
      return;
    }
    save([...entries, entry], () => setCreatingNew(false));
  }

  function handleRemove(code: string) {
    save(entries.filter((e) => e.c !== code));
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium">Pathologies ICD-10 (favoris)</h3>
        <Button size="sm" variant="outline" onClick={() => setCreatingNew(true)} data-testid="button-add-custom-icd10">
          + Code personnalisé
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Ces codes apparaissent en premier dans le formulaire patient. Modifiez les libellés et descriptions selon vos besoins.
      </p>
      <div className="space-y-1.5 mb-3">
        {entries.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">Aucun code favori</p>
        )}
        {entries.map((entry) => (
          <div key={entry.c} className="px-3 py-2 rounded bg-muted/40 text-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2 items-baseline min-w-0">
                <span className="font-mono text-xs font-medium shrink-0 text-muted-foreground">{entry.c}</span>
                <span className="truncate font-medium">{entry.t}</span>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  className="text-xs text-primary hover:underline"
                  data-testid={`button-edit-icd10-${entry.c}`}
                  onClick={() => setEditingEntry(entry)}
                >
                  Modifier
                </button>
                <button
                  className="text-xs text-destructive hover:text-destructive/80"
                  data-testid={`button-remove-icd10-${entry.c}`}
                  onClick={() => handleRemove(entry.c)}
                >
                  Supprimer
                </button>
              </div>
            </div>
            {entry.d && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{entry.d}</p>}
          </div>
        ))}
      </div>
      <div className="relative" ref={dropdownRef}>
        <Input
          placeholder="Rechercher dans les codes ICD-10 standard..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); }}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
          className="text-sm"
          data-testid="input-new-icd10"
        />
        {dropdownOpen && search.length >= 1 && (
          <div className="absolute z-50 top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 overflow-hidden max-h-56 overflow-y-auto">
            {filtered.length > 0 ? filtered.map((item) => (
              <button
                key={item.c}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex gap-2"
                onMouseDown={() => handleAddFromSearch(item)}
              >
                <span className="font-mono text-xs font-medium text-muted-foreground w-10 shrink-0">{item.c}</span>
                <span className="truncate">{item.t}</span>
              </button>
            )) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Aucun résultat — utilisez <strong>+ Code personnalisé</strong> pour créer un code libre.
              </div>
            )}
          </div>
        )}
      </div>

      <ICD10EntryModal
        open={!!editingEntry}
        initial={editingEntry ?? undefined}
        onClose={() => setEditingEntry(null)}
        onSave={handleSaveEdit}
        isPending={updateSetting.isPending}
      />
      <ICD10EntryModal
        open={creatingNew}
        isNew
        onClose={() => setCreatingNew(false)}
        onSave={handleSaveNew}
        isPending={updateSetting.isPending}
      />
    </div>
  );
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
        toast({ title: "Patient restauré", description: `${patient.prenom} ${patient.nom} a été remis sur le board ${patient.board}.` });
        fetchDeleted();
      } else {
        toast({ title: "Erreur", description: "Impossible de restaurer le patient", variant: "destructive" });
      }
    } finally {
      setRestoring(null);
    }
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">Patients supprimés (Corbeille)</h3>
      {loading ? (
        <p className="text-xs text-muted-foreground py-2">Chargement...</p>
      ) : patients.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">Aucun patient supprimé</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground text-xs">
              <th className="text-left pb-2 font-medium">N° Client</th>
              <th className="text-left pb-2 font-medium">Nom</th>
              <th className="text-left pb-2 font-medium">Dernier board</th>
              <th className="text-left pb-2 font-medium">Supprimé le</th>
              <th className="text-left pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-b last:border-0" data-testid={`deleted-patient-${p.id}`}>
                <td className="py-2 font-mono text-xs">{p.clientNum}</td>
                <td className="py-2 font-medium">{p.nom} {p.prenom}</td>
                <td className="py-2 text-muted-foreground">{p.board}</td>
                <td className="py-2 text-muted-foreground text-xs">
                  {new Date(p.deletedAt).toLocaleDateString("fr-LU")}
                </td>
                <td className="py-2">
                  <button
                    className="text-xs text-primary hover:underline disabled:opacity-50"
                    disabled={restoring === p.id}
                    data-testid={`button-restore-${p.id}`}
                    onClick={() => handleRestore(p)}
                  >
                    {restoring === p.id ? "..." : "Restaurer"}
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
        onError: () => toast({ title: "Erreur", description: "Impossible d'ajouter l'élément", variant: "destructive" }),
      }
    );
  }

  function handleRemove(item: string) {
    const updated = items.filter((i) => i !== item);
    updateSetting.mutate(
      { key: settingKey, data: { value: JSON.stringify(updated) } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() }),
        onError: () => toast({ title: "Erreur", description: "Impossible de supprimer l'élément", variant: "destructive" }),
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
              Supprimer
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">Aucun élément</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Ajouter..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="text-sm"
          data-testid={`input-new-${settingKey}`}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button size="sm" onClick={handleAdd} disabled={updateSetting.isPending} data-testid={`button-add-${settingKey}`}>
          Ajouter
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
            <Label>Nom d'utilisateur</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} data-testid="input-user-username" />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" data-testid="input-user-email" />
          </div>
          <div className="space-y-1">
            <Label>Rôle</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger data-testid="select-user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {showPassword && (
            <div className="space-y-1">
              <Label>Mot de passe initial <span className="text-muted-foreground font-normal">(min. 6 caractères)</span></Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="L'utilisateur devra le changer à la connexion"
                data-testid="input-user-password"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            onClick={() => onSave({ username, email, role, ...(showPassword ? { password } : {}) })}
            disabled={isPending || !canSave}
            data-testid="button-save-user"
          >
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

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
          toast({ title: "Utilisateur créé", description: "L'utilisateur devra changer son mot de passe à la première connexion." });
        },
        onError: () => toast({ title: "Erreur", description: "Impossible de créer l'utilisateur", variant: "destructive" }),
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
          toast({ title: "Utilisateur mis à jour" });
        },
        onError: () => toast({ title: "Erreur", description: "Impossible de modifier l'utilisateur", variant: "destructive" }),
      }
    );
  }

  function handleDeleteUser(id: number, username: string) {
    if (!confirm(`Supprimer l'utilisateur ${username} ?`)) return;
    deleteUser.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          toast({ title: "Utilisateur supprimé" });
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
          <span className="text-muted-foreground text-xs">/</span>
          <span className="text-sm font-medium">Paramètres</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{user?.username}</span>
          <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setLocation("/board")} data-testid="button-back-board">
            Retour au board
          </button>
          <button className="text-xs text-muted-foreground hover:text-foreground" onClick={logout} data-testid="button-logout-settings">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-semibold">Paramètres</h2>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Listes des intervenants</h3>
            <div className="grid grid-cols-3 gap-4">
              <SettingsList settingKey="casemanagers" label="Case Manager" />
              <SettingsList settingKey="psychiatrists" label="Psychiatre" />
              <SettingsList settingKey="medecinsfamille" label="Médecin de famille" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              La liste <strong>Case Manager 2</strong> utilise les mêmes entrées que <strong>Case Manager</strong>.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Autres listes</h3>
            <div className="grid grid-cols-2 gap-4">
              <SettingsList settingKey="articles" label="Articles légaux" />
              <SettingsList settingKey="curatelles" label="Curatelle / Tutelle" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pathologies</h3>
            <ICD10FavoritesList />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Corbeille</h3>
            <DeletedPatientsSection />
          </div>

          {user?.role === "admin" && (
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Gestion des utilisateurs</h3>
                <Button size="sm" onClick={() => setShowCreateUser(true)} data-testid="button-create-user">
                  + Créer un utilisateur
                </Button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left pb-2 font-medium">Nom d'utilisateur</th>
                    <th className="text-left pb-2 font-medium">Email</th>
                    <th className="text-left pb-2 font-medium">Rôle</th>
                    <th className="text-left pb-2 font-medium">Statut</th>
                    <th className="text-left pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0" data-testid={`user-row-${u.id}`}>
                      <td className="py-2 font-medium">{u.username}</td>
                      <td className="py-2 text-muted-foreground">{u.email ?? "-"}</td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-0.5 rounded border ${u.role === "admin" ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"}`}>
                          {u.role === "admin" ? "Admin" : "Utilisateur"}
                        </span>
                      </td>
                      <td className="py-2">
                        {u.mustChangePassword && (
                          <span className="text-xs text-amber-600">Doit changer son MDP</span>
                        )}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            className="text-xs text-primary hover:underline"
                            data-testid={`button-edit-user-${u.id}`}
                            onClick={() => setEditingUser(u)}
                          >
                            Modifier
                          </button>
                          {u.id !== user?.id && (
                            <button
                              className="text-xs text-destructive hover:underline"
                              data-testid={`button-delete-user-${u.id}`}
                              onClick={() => handleDeleteUser(u.id, u.username)}
                            >
                              Supprimer
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
        </div>
      </main>

      <UserModal
        open={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSave={handleCreateUser}
        isPending={createUser.isPending}
        title="Créer un utilisateur"
        showPassword
      />

      <UserModal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleUpdateUser}
        isPending={updateUser.isPending}
        initial={editingUser}
        title="Modifier l'utilisateur"
      />
    </div>
  );
}