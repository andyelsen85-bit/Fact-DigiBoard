import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { useT } from "@/i18n";
import "@/i18n/dict/auth";
const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

type SetupFormValues = {
  username: string;
  password: string;
  confirm: string;
};

export default function SetupPage() {
  const t = useT();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const setupSchema = useMemo(
    () =>
      z.object({
        username: z.string().min(2, t("auth.min2Chars")),
        password: z.string().min(6, t("auth.min6Chars")),
        confirm: z.string().min(6, t("auth.min6Chars")),
      }).refine((d) => d.password === d.confirm, {
        message: t("auth.passwordsMismatch"),
        path: ["confirm"],
      }),
    [t]
  );

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: { username: "", password: "", confirm: "" },
  });

  async function onSubmit(values: SetupFormValues) {
    try {
      const res = await fetch(`${API_BASE}/auth/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: values.username, password: values.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: t("common.error"), description: data.error, variant: "destructive" });
        return;
      }
      toast({ title: t("auth.accountCreated"), description: t("auth.accountCreatedDesc") });
      setLocation("/login");
    } catch {
      toast({ title: t("auth.networkError"), description: t("auth.networkErrorDesc"), variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Digi<span className="font-light">Board</span>
          </CardTitle>
          <CardDescription>
            {t("auth.setupTagline")}
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
                      <Input placeholder={t("auth.usernameSetupPlaceholder")} {...field} data-testid="input-username" />
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
                      <Input type="password" placeholder={t("auth.passwordMinPlaceholder")} {...field} data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.confirmPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t("auth.confirmPasswordPlaceholder")} {...field} data-testid="input-confirm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
                data-testid="button-setup"
              >
                {form.formState.isSubmitting ? t("auth.creating") : t("auth.createAdmin")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
