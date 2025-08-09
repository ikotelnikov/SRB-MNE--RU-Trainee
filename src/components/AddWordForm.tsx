import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Word } from "../types";

export function AddWordForm({ onAdd }: { onAdd: (w: Word) => void }) {
  const [sr, setSr] = useState("");
  const [ru, setRu] = useState("");
  const [lvl, setLvl] = useState("1");
  const [tag, setTag] = useState("custom");
  return (
    <div className="grid gap-2 rounded-xl border p-3">
      <div className="grid gap-2 md:grid-cols-4">
        <Input placeholder="sr/cr (latin)" value={sr} onChange={(e) => setSr(e.target.value)} />
        <Input placeholder="русский" value={ru} onChange={(e) => setRu(e.target.value)} />
        <Select value={lvl} onValueChange={setLvl}>
          <SelectTrigger><SelectValue placeholder="lvl" /></SelectTrigger>
          <SelectContent>{[1,2,3,4,5].map((n)=> <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="тег" value={tag} onChange={(e) => setTag(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => {
          if (!sr.trim() || !ru.trim()) return;
          onAdd({ sr: sr.trim(), ru: ru.trim(), level: Number(lvl), tag: tag.trim() || "custom" });
          setSr(""); setRu("");
        }}>Добавить слово</Button>
      </div>
    </div>
  );
}
