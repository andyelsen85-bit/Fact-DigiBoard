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
import { useIcd10Codes, useCreateIcd10Code, useUpdateIcd10Code, useDeleteIcd10Code, type Icd10Code } from "@/hooks/use-icd10";

interface Icd10ModalProps {
  open: boolean;
  initial?: Icd10Code;
  isNew?: boolean;
  onClose: () => void;
  onSave: (data: { code: string; title: string; description: string; risks: string }) => void;
  isPending?: boolean;
}

function ICD10EntryModal({ open, initial, isNew, onClose, onSave, isPending }: Icd10ModalProps) {
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
          <DialogTitle>{isNew ? "Ajouter un code ICD-10" : "Modifier le code ICD-10"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label>Code <span className="text-destructive">*</span></Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ex: F20, Z99, CUSTOM-01"
              readOnly={!isNew}
              className={!isNew ? "bg-muted text-muted-foreground" : ""}
              data-testid="input-icd10-code"
            />
          </div>
          <div className="space-y-1">
            <Label>Libellé <span className="text-destructive">*</span></Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Intitulé du diagnostic"
              data-testid="input-icd10-label"
            />
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-1">Description <span className="text-xs text-muted-foreground font-normal">(optionnel)</span></Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description clinique..."
              rows={2}
              data-testid="input-icd10-description"
            />
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-1">Risques <span className="text-xs text-muted-foreground font-normal">(optionnel)</span></Label>
            <Textarea
              value={risks}
              onChange={(e) => setRisks(e.target.value)}
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
            onClick={() => onSave({ code: code.trim(), title: title.trim(), description: description.trim(), risks: risks.trim() })}
            data-testid="button-save-icd10"
          >
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ICD10ManagementTable() {
  const { toast } = useToast();
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
      { onError: () => toast({ title: "Erreur", description: "Impossible de mettre à jour", variant: "destructive" }) }
    );
  }

  function handleEdit(data: { code: string; title: string; description: string; risks: string }) {
    updateCode.mutate(
      { code: data.code, title: data.title, description: data.description, risks: data.risks },
      {
        onSuccess: () => setEditingCode(null),
        onError: () => toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" }),
      }
    );
  }

  function handleCreate(data: { code: string; title: string; description: string; risks: string }) {
    createCode.mutate(
      { code: data.code, title: data.title, description: data.description || null, risks: data.risks || null, isFavorite: true } as any,
      {
        onSuccess: () => setCreatingNew(false),
        onError: (err: any) => {
          const msg = err?.message?.includes("409") ? `Le code ${data.code} existe déjà.` : "Impossible de créer le code.";
          toast({ title: "Erreur", description: msg, variant: "destructive" });
        },
      }
    );
  }

  function handleDelete(code: string) {
    deleteCode.mutate(code, {
      onError: () => toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" }),
    });
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium">Codes ICD-10</h3>
        <Button size="sm" variant="outline" onClick={() => setCreatingNew(true)} data-testid="button-add-custom-icd10">
          + Ajouter un code
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Liste des pathologies disponibles dans le formulaire patient. Les codes marqués ⭐ apparaissent en premiers dans le sélecteur.
      </p>
      <Input
        placeholder="Rechercher par code ou libellé..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="text-sm mb-3"
        data-testid="input-new-icd10"
      />
      {isLoading ? (
        <p className="text-xs text-muted-foreground py-2">Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">Aucun code trouvé</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-2">{filtered.length} code{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}</p>
          <div className="space-y-1.5 overflow-y-auto max-h-[720px] pr-1">
          {filtered.map((entry) => (
            <div key={entry.code} className="px-3 py-2 rounded bg-muted/40 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2 items-baseline min-w-0">
                  <span className="font-mono text-xs font-medium shrink-0 text-muted-foreground">{entry.code}</span>
                  <span className="truncate font-medium">{entry.title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    title={entry.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
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
                    Modifier
                  </button>
                  <button
                    className="text-xs text-destructive hover:text-destructive/80"
                    data-testid={`button-remove-icd10-${entry.code}`}
                    onClick={() => handleDelete(entry.code)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              {entry.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{entry.description}</p>}
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

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pathologies (ICD-10)</h3>
            <ICD10ManagementTable />
          </div>
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