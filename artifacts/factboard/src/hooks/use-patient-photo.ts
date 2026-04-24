import { useQueryClient } from "@tanstack/react-query";
import { getGetPatientQueryKey } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL ?? "/";

function getApiUrl(path: string) {
  const base = BASE.endsWith("/") ? BASE.slice(0, -1) : BASE;
  return `${base}/api${path}`;
}

function getToken(): string | null {
  return typeof localStorage !== "undefined" ? localStorage.getItem("auth-token") : null;
}

async function resizeToDataUrl(file: File, maxPx = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function usePatientPhotoUpload(patientId: number) {
  const queryClient = useQueryClient();

  async function uploadPhoto(file: File): Promise<void> {
    const dataUrl = await resizeToDataUrl(file, 256);
    const token = getToken();
    const res = await fetch(getApiUrl(`/patients/${patientId}/photo`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ photo: dataUrl }),
    });
    if (!res.ok) throw new Error("Échec de l'upload de la photo");
    await queryClient.invalidateQueries({ queryKey: getGetPatientQueryKey({ id: patientId }) });
  }

  async function removePhoto(): Promise<void> {
    const token = getToken();
    await fetch(getApiUrl(`/patients/${patientId}/photo`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ photo: null }),
    });
    await queryClient.invalidateQueries({ queryKey: getGetPatientQueryKey({ id: patientId }) });
  }

  return { uploadPhoto, removePhoto };
}
