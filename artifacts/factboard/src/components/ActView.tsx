import { useState } from "react";
import {
  useListActRegions, getListActRegionsQueryKey,
  useCreateActRegion, useUpdateActRegion, useDeleteActRegion,
  useListActRegionNotes, getListActRegionNotesQueryKey,
  useCreateActRegionNote, useUpdateActRegionNote, useDeleteActRegionNote,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

function ActNotes({ regionId }: { regionId: number }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: notes = [] } = useListActRegionNotes(regionId, { query: { queryKey: getListActRegionNotesQueryKey(regionId) } });
  const createNote = useCreateActRegionNote();
  const updateNote = useUpdateActRegionNote();
  const deleteNote = useDeleteActRegionNote();
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newTexte, setNewTexte] = useState("");

  function handleAdd() {
    createNote.mutate(
      { id: regionId, data: { date: newDate, texte: newTexte } },
      {
        onSuccess: () => {
          setNewTexte("");
          queryClient.invalidateQueries({ queryKey: getListActRegionNotesQueryKey(regionId) });
        },
        onError: () => toast({ title: "Erreur", description: "Impossible d'ajouter la note", variant: "destructive" }),
      }
    );
  }

  const sorted = [...notes].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-start">
        <Input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="w-36 text-sm"
          data-testid="input-act-note-date"
        />
        <Textarea
          placeholder="Nouvelle note..."
          value={newTexte}
          onChange={(e) => setNewTexte(e.target.value)}
          rows={2}
          className="flex-1 text-sm"
          data-testid="textarea-act-note"
        />
        <Button size="sm" onClick={handleAdd} disabled={createNote.isPending} data-testid="button-add-act-note">
          Ajouter
        </Button>
      </div>
      <div className="space-y-2">
        {sorted.map((note) => (
          <div key={note.id} className="flex gap-2 items-start border rounded-md p-2 bg-card">
            <input
              type="date"
              className="text-xs border rounded px-1 h-7 w-32 bg-background"
              defaultValue={note.date ?? ""}
              onBlur={(e) => {
                if (e.target.value !== note.date) {
                  updateNote.mutate(
                    { regionId: regionId, noteId: note.id, data: { date: e.target.value } },
                    { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListActRegionNotesQueryKey(regionId) }) }
                  );
                }
              }}
            />
            <textarea
              className="flex-1 text-sm border rounded px-2 py-1 bg-background resize-none min-h-[40px]"
              defaultValue={note.texte ?? ""}
              onBlur={(e) => {
                if (e.target.value !== note.texte) {
                  updateNote.mutate(
                    { regionId: regionId, noteId: note.id, data: { texte: e.target.value } },
                    { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListActRegionNotesQueryKey(regionId) }) }
                  );
                }
              }}
            />
            <button
              className="text-xs text-destructive hover:text-destructive/80 px-1"
              data-testid={`button-delete-act-note-${note.id}`}
              onClick={() => {
                deleteNote.mutate(
                  { regionId: regionId, noteId: note.id },
                  { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListActRegionNotesQueryKey(regionId) }) }
                );
              }}
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActView() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [newRegionName, setNewRegionName] = useState("");
  const [showNewRegion, setShowNewRegion] = useState(false);

  const { data: regions = [] } = useListActRegions({ query: { queryKey: getListActRegionsQueryKey() } });
  const createRegion = useCreateActRegion();
  const deleteRegion = useDeleteActRegion();

  const selectedRegion = regions.find((r) => r.id === selectedRegionId);

  function handleCreateRegion() {
    if (!newRegionName.trim()) return;
    createRegion.mutate(
      { data: { nom: newRegionName.trim() } },
      {
        onSuccess: (region) => {
          setNewRegionName("");
          setShowNewRegion(false);
          queryClient.invalidateQueries({ queryKey: getListActRegionsQueryKey() });
          setSelectedRegionId(region.id);
        },
        onError: () => toast({ title: "Erreur", description: "Impossible de créer la région", variant: "destructive" }),
      }
    );
  }

  function handleDeleteRegion(id: number) {
    if (!confirm("Supprimer cette région ACT et toutes ses notes ?")) return;
    deleteRegion.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListActRegionsQueryKey() });
          if (selectedRegionId === id) setSelectedRegionId(null);
        },
      }
    );
  }

  return (
    <div className="flex h-full" data-testid="act-view">
      <aside className="w-56 border-r flex flex-col">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">RÉGIONS ACT</span>
            <button
              className="text-xs text-primary hover:underline"
              data-testid="button-new-act-region"
              onClick={() => setShowNewRegion(true)}
            >
              + Nouveau
            </button>
          </div>
          {showNewRegion && (
            <div className="flex gap-1">
              <Input
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
                placeholder="Nom de la région"
                className="h-7 text-xs"
                data-testid="input-act-region-name"
                onKeyDown={(e) => e.key === "Enter" && handleCreateRegion()}
              />
              <Button size="sm" className="h-7 text-xs" onClick={handleCreateRegion} data-testid="button-create-region">OK</Button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {regions.map((region) => (
            <div
              key={region.id}
              className={`group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/40 ${
                selectedRegionId === region.id ? "bg-muted/60 border-l-2 border-l-primary" : ""
              }`}
              onClick={() => setSelectedRegionId(region.id)}
              data-testid={`act-region-${region.id}`}
            >
              <span className="text-sm truncate">{region.nom}</span>
              <button
                className="opacity-0 group-hover:opacity-100 text-xs text-destructive px-1"
                onClick={(e) => { e.stopPropagation(); handleDeleteRegion(region.id); }}
                data-testid={`button-delete-region-${region.id}`}
              >
                ×
              </button>
            </div>
          ))}
          {regions.length === 0 && (
            <p className="px-3 py-4 text-xs text-muted-foreground">Aucune région</p>
          )}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-4">
        {selectedRegion ? (
          <div>
            <h3 className="font-medium text-base mb-4">{selectedRegion.nom}</h3>
            <ActNotes regionId={selectedRegion.id} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            Sélectionnez une région ACT
          </div>
        )}
      </main>
    </div>
  );
}
