import { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: { username: string; email: string; role: string }) => void;
  isPending?: boolean;
  initial?: { username?: string; email?: string | null; role?: string };
  title: string;
}) {
  const [username, setUsername] = useState(initial?.username ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState(initial?.role ?? "user");

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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            onClick={() => onSave({ username, email, role })}
            disabled={isPending || !username.trim()}
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

  function handleCreateUser(values: { username: string; email: string; role: string }) {
    createUser.mutate(
      { data: { username: values.username, email: values.email, role: values.role } },
      {
        onSuccess: (data) => {
          setShowCreateUser(false);
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          const tempPwd = (data as any).tempPassword;
          toast({
            title: "Utilisateur créé",
            description: tempPwd ? `Mot de passe temporaire : ${tempPwd}` : undefined,
          });
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

          <div className="grid grid-cols-2 gap-4">
            <SettingsList settingKey="psychiatrists" label="Psychiatres" />
            <SettingsList settingKey="casemanagers" label="Case Managers" />
            <SettingsList settingKey="articles" label="Articles légaux" />
            <SettingsList settingKey="curatelles" label="Curatelle / Tutelle" />
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