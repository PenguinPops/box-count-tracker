// components/IncludeStartingBalancesToggle.tsx
"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Props = {
  initialValue: boolean;
};

export default function IncludeStartingBalancesToggle({ initialValue }: Props) {
  const [enabled, setEnabled] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  const handleChange = (checked: boolean) => {
    setEnabled(checked);

    startTransition(async () => {
      await fetch("/api/settings/starting-balances", {
        method: "POST",
        body: JSON.stringify({ include: checked }),
        headers: { "Content-Type": "application/json" },
      });
    });
  };

  return (
    <>
      <Switch id="include-starting-balances" checked={enabled} onCheckedChange={handleChange} disabled={isPending} />
    </>
  );
}
