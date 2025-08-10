import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Word } from "../types";

export function AddWordForm({ onAdd }: { onAdd: (w: Word) => void }) {
  const [sr, setSr] = useState("");
  const [ru, setRu] = useState("");
  const [lvl, setLvl] = useState("1");
  const [tag, setTag] = useState("custom");
  return (
    <div className="grid gap-2 rounded-xl border p-3">
      <div className="grid gap-2 md:grid-cols-4">
        <Input placeholder="Crn" value={sr} onChange={(e) => setSr(e.target.value)} />
        <Input placeholder="русский" value={ru} onChange={(e) => setRu(e.target.value)} />
        <select
          value={lvl}
          onChange={(e) => setLvl(e.target.value)}
          className="rounded border p-2"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </select>
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
