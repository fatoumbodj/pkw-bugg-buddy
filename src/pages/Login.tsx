import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    const res = await login(data.email, data.password);
    setIsSubmitting(false);

    if (res.error) {
      toast({ title: "Erreur", description: res.error, variant: "destructive" });
      return;
    }

    toast({ title: "Connexion réussie", description: `Bienvenue ${data.email}` });
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 w-96 p-6 bg-white rounded shadow">
        <Input {...form.register("email")} placeholder="Email" disabled={isSubmitting} />
        <Input {...form.register("password")} type="password" placeholder="Mot de passe" disabled={isSubmitting} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
};

export default Login;
