import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/hooks/useRole";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Shield, User as UserIcon } from "lucide-react";

const schema = z.object({
  fullName: z.string().trim().min(1, "Ange namn").max(100),
  email: z.string().trim().email("Ogiltig e-post").max(255),
  password: z.string().min(6, "Minst 6 tecken").max(100),
  role: z.enum(["admin", "user"]),
});

type ProfileRow = { user_id: string; full_name: string | null; email: string | null };
type RoleRow = { user_id: string; role: "admin" | "user" };

const Users = () => {
  const { isAdmin, loading: roleLoading } = useRole();
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);

  const loadUsers = async () => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, email"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setProfiles(p ?? []);
    setRoles((r ?? []) as RoleRow[]);
  };

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  if (roleLoading) {
    return (
      <AppLayout>
        <div className="text-muted-foreground">Laddar...</div>
      </AppLayout>
    );
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ fullName, email, password, role });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: parsed.data,
    });
    setSubmitting(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? "Kunde inte skapa användare");
      return;
    }
    toast.success(`Konto skapat för ${email}`);
    setFullName(""); setEmail(""); setPassword(""); setRole("user");
    loadUsers();
  };

  const rolesByUser = (uid: string) => roles.filter((r) => r.user_id === uid).map((r) => r.role);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Användare</h1>
          <p className="text-sm text-muted-foreground">Skapa konton och hantera behörigheter</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> Skapa nytt konto
            </CardTitle>
            <CardDescription>Användaren kan logga in direkt med dessa uppgifter</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Fullständigt namn</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw">Lösenord (minst 6 tecken)</Label>
                <Input id="pw" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Roll</Label>
                <Select value={role} onValueChange={(v) => setRole(v as "admin" | "user")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Besiktningsman</SelectItem>
                    <SelectItem value="admin">Administratör</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? "Skapar..." : "Skapa konto"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Befintliga användare ({profiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profiles.map((p) => {
                const userRoles = rolesByUser(p.user_id);
                const admin = userRoles.includes("admin");
                return (
                  <div key={p.user_id} className="flex items-center justify-between p-3 rounded-md border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                        {admin ? <Shield className="w-4 h-4 text-primary" /> : <UserIcon className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="leading-tight">
                        <div className="font-medium text-foreground">{p.full_name || "(inget namn)"}</div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </div>
                    </div>
                    <Badge variant={admin ? "default" : "secondary"}>
                      {admin ? "Admin" : "Besiktningsman"}
                    </Badge>
                  </div>
                );
              })}
              {profiles.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Inga användare ännu</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Users;
