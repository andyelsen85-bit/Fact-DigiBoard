import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useChangePassword } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const changePasswordSchema = z.object({
  newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading, checkAuth } = useAuth();
  const { toast } = useToast();
  const changePasswordMutation = useChangePassword();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && user && !user.mustChangePassword) {
      setLocation("/board");
    }
  }, [user, isLoading, setLocation]);

  function onSubmit(values: ChangePasswordFormValues) {
    changePasswordMutation.mutate(
      { data: { newPassword: values.newPassword } },
      {
        onSuccess: () => {
          toast({
            title: "Mot de passe modifié",
            description: "Votre mot de passe a été modifié avec succès.",
          });
          checkAuth();
          setLocation("/board");
        },
        onError: (error) => {
          toast({
            title: "Erreur",
            description: error.error || "Impossible de modifier le mot de passe",
            variant: "destructive",
          });
        },
      }
    );
  }

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Changement de mot de passe</CardTitle>
          <CardDescription>
            Pour des raisons de sécurité, veuillez définir un nouveau mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} data-testid="input-new-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} data-testid="input-confirm-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={changePasswordMutation.isPending} data-testid="button-change-password">
                {changePasswordMutation.isPending ? "Modification..." : "Modifier le mot de passe"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}