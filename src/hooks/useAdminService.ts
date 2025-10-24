import { ENDPOINTS } from "./endpoints";
import { toast } from "@/components/ui/use-toast";

export interface Admin {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  mustChangePassword?: boolean;
}

// Lister tous les admins
export const fetchAdmins = async (): Promise<Admin[]> => {
  try {
    const res = await fetch(`${ENDPOINTS.admin}/users`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    if (!res.ok) throw new Error("Erreur lors du chargement des administrateurs");

    const data = await res.json();

    // ⚡ le tableau est dans data.admins
    return data.data?.admins || [];
  } catch (err: any) {
    toast({
      title: "Erreur",
      description: err.message,
      variant: "destructive",
    });
    return [];
  }
};

// Créer un admin
export const createAdmin = async (admin: Partial<Admin>): Promise<Admin | null> => {
  try {
    const res = await fetch(`${ENDPOINTS.admin}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify(admin),
    });

    if (!res.ok) throw new Error("Erreur lors de la création du compte");

    const data = await res.json();
    return data.data || null;
  } catch (err: any) {
    toast({
      title: "Erreur",
      description: err.message,
      variant: "destructive",
    });
    return null;
  }
};

// Mettre à jour un admin
export const updateAdmin = async (id: string, admin: Partial<Admin>): Promise<Admin | null> => {
  try {
    const res = await fetch(`${ENDPOINTS.admin}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify(admin),
    });

    if (!res.ok) throw new Error("Erreur lors de la mise à jour du compte");

    const data = await res.json();
    return data.data || null;
  } catch (err: any) {
    toast({
      title: "Erreur",
      description: err.message,
      variant: "destructive",
    });
    return null;
  }
};
