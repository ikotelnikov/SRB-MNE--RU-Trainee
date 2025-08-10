import React, { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Word } from "../types";
import { clamp } from "../utils";

export function CsvImport({ onImport }: { onImport: (rows: Word[]) => void }) {
  const [text, setText] = useState("");
  const [count, setCount] = useState(0);
  function parse() {
    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const rows: Word[] = [];
    for (const line of lines) {
      const [sr, ru, levelStr, tag = "custom"] = line.split(",").map((s) => s.trim());
      const level = clamp(parseInt(levelStr || "1", 10) || 1, 1, 5);
      if (sr && ru) rows.push({ sr, ru, level, tag });
    }
    setCount(rows.length);
    if (rows.length) onImport(rows);
  }
  return (
    <div className="grid gap-2 rounded-xl border p-3">
      <textarea className="min-h-[120px] w-full rounded-xl border p-3" placeholder="crn,ru,level,tag\nzdravo,привет,1,greeting" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Вставьте CSV и нажмите Импорт</span>
        <div className="flex items-center gap-2">
          {count > 0 && <Badge variant="secondary">импортировано: {count}</Badge>}
          <Button onClick={parse}>Импорт</Button>
        </div>
      </div>
    </div>
  );
}
