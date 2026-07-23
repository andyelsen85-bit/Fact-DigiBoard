import { useLocation } from "wouter";
import { APP_VERSION } from "@/version";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useMemo, useState } from "react";
import { useT } from "@/i18n";
import "@/i18n/dict/auth";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

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

type LoginFormValues = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const t = useT();
  const [, setLocation] = useLocation();
  const { user, isLoading, checkAuth } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [checkingSetup, setCheckingSetup] = useState(true);

  const loginSchema = useMemo(
    () =>
      z.object({
        username: z.string().min(1, t("auth.usernameRequired")),
        password: z.string().min(1, t("auth.passwordRequired")),
      }),
    [t]
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    fetch(`${API_BASE}/auth/setup-needed`)
      .then((r) => r.json())
      .then((d) => { if (d.needed) setLocation("/setup"); })
      .catch(() => {})
      .finally(() => setCheckingSetup(false));
  }, [setLocation]);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.mustChangePassword) {
        setLocation("/change-password");
      } else {
        setLocation("/board");
      }
    }
  }, [user, isLoading, setLocation]);

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          const token = (data as any).token as string | undefined;
          if (token) localStorage.setItem("auth-token", token);
          checkAuth();
          if (data.mustChangePassword) {
            setLocation("/change-password");
          } else {
            setLocation("/board");
          }
        },
        onError: (error) => {
          toast({
            title: t("auth.loginError"),
            description: error.error || t("auth.invalidCredentials"),
            variant: "destructive",
          });
        },
      }
    );
  }

  if (checkingSetup || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Digi<span className="font-light">Board</span>
          </CardTitle>
          <CardDescription>
            {t("auth.tagline")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.username")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("auth.usernamePlaceholder")} {...field} data-testid="input-username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.password")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t("auth.passwordPlaceholder")} {...field} data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loginMutation.isPending} data-testid="button-login">
                {loginMutation.isPending ? t("auth.signingIn") : t("auth.signIn")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="fixed bottom-3 right-4 text-xs text-muted-foreground/60" data-testid="text-version">
        v{APP_VERSION}
      </p>
    </div>
  );
}