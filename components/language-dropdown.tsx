"use client";

import { useEffect, useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { redirect } from "next/navigation";

type Props = {
  initialValue: string; // 'pl' or 'en' (can be extended)
};

export default function LanguageDropdown({ initialValue }: Props) {
  const [isPending, startTransition] = useTransition();
  const [lang, setLang] = useState(initialValue);

  const handleChange = (value: string) => {
    setLang(value);
    startTransition(async () => {
      const res = await fetch("/api/settings/language", {
        method: "POST",
        body: JSON.stringify({ lang: value }),
        headers: { "Content-Type": "application/json" },
      });

      if(res.ok) {
        redirect("/settings");
      }
    });
  };

  useEffect(() => {
    setLang(initialValue);
  }, [initialValue]);

  return (
    <div className="flex items-center space-x-4">
      <Label htmlFor="language-select">
        {lang === "pl" ? "Aktualny język:" : "Current Language:"}
      </Label>
      <Select value={lang} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger id="language-select" className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{lang === "pl" ? "Angielski" : "English"}</SelectItem>
          <SelectItem value="pl">{lang === "pl" ? "Polski" : "Polish"}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
