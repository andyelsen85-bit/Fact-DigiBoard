import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useChangePassword } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useMemo } from "react";
import { useT } from "@/i18n";
import "@/i18n/dict/auth";

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

type ChangePasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordPage() {
  const t = useT();
  const [, setLocation] = useLocation();
  const { user, isLoading, checkAuth } = useAuth();
  const { toast } = useToast();
  const changePasswordMutation = useChangePassword();

  const changePasswordSchema = useMemo(
    () =>
      z.object({
        newPassword: z.string().min(8, t("auth.min8Chars")),
        confirmPassword: z.string()
      }).refine((data) => data.newPassword === data.confirmPassword, {
        message: t("auth.passwordsMismatch"),
        path: ["confirmPassword"],
      }),
    [t]
  );

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
            title: t("auth.passwordChanged"),
            description: t("auth.passwordChangedDesc"),
          });
          checkAuth();
          setLocation("/board");
        },
        onError: (error) => {
          toast({
            title: t("common.error"),
            description: error.error || t("auth.changePasswordError"),
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
          <CardTitle className="text-2xl font-bold">{t("auth.changePasswordTitle")}</CardTitle>
          <CardDescription>
            {t("auth.changePasswordDesc")}
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
                    <FormLabel>{t("auth.newPassword")}</FormLabel>
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
                    <FormLabel>{t("auth.confirmPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} data-testid="input-confirm-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={changePasswordMutation.isPending} data-testid="button-change-password">
                {changePasswordMutation.isPending ? t("auth.changing") : t("auth.changePassword")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}