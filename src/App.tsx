import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "./components/ui/progress";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Sparkles, RotateCcw, Check, X, Trophy, BookOpenText, Gamepad2, Brain, Upload, Download, Headphones, Shuffle, HelpCircle } from "lucide-react";

import { ConfettiBurst } from "./components/ConfettiBurst";
import { StatCard } from "./components/StatCard";
import { AddWordForm } from "./components/AddWordForm";
import { CsvImport } from "./components/CsvImport";
import { Word, Mode, ProgressState } from "./types";
import { choice, clamp, loadDict, loadProgress, saveDict, saveProgress, xpToLevel, shuffle } from "./utils";



// -------------------------------------------------
// Main App
// -------------------------------------------------
export default function App() {
  const [dict, setDict] = useState<Word[]>(() => loadDict());
  const [mode, setMode] = useState<Mode>("multiple");
  const [difficulty, setDifficulty] = useState<number>(1);
  const [autoDifficulty, setAutoDifficulty] = useState<boolean>(true);
  const [current, setCurrent] = useState<Word | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [burstKey, setBurstKey] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [tfStatement, setTfStatement] = useState<string>("");
  const [tfTruth, setTfTruth] = useState<boolean>(true);
  const [scrambled, setScrambled] = useState<string>("");

  useEffect(() => saveDict(dict), [dict]);

  const overallPct = useMemo(() => clamp(((progress.xp % 2500) / 2500) * 100, 0, 100), [progress.xp]);

  function pickCard(level: number): Word {
    const pool = dict.filter((w) => clamp(w.level, 1, 5) <= clamp(level + 1, 1, 5) && w.level >= clamp(level - 1, 1, 5));
    const list = pool.length ? pool : dict;
    return list[Math.floor(Math.random() * list.length)];
  }

  function buildOptions(word: Word) {
    if (mode === "multiple") {
      const correct = mode === "sr_to_ru" || mode === "multiple" ? word.ru : word.sr;
      const pool = dict
        .filter((w) => w.sr !== word.sr)
        .map((w) => (mode === "sr_to_ru" || mode === "multiple" ? w.ru : w.sr));
      const distractors = choice(pool, 3);
      setOptions(shuffle([correct, ...distractors]));
    } else {
      setOptions([]);
    }
  }

  function buildTrueFalse(word: Word) {
    const isTrue = Math.random() < 0.5;
    if (isTrue) {
      setTfStatement(`${word.sr} → ${word.ru}`);
      setTfTruth(true);
    } else {
      // wrong pair
      const other = pickCard(word.level);
      setTfStatement(`${word.sr} → ${other.ru}`);
      setTfTruth(false);
    }
  }

  function buildScramble(word: Word) {
    const target = mode === "ru_to_sr" ? word.sr : word.ru;
    const chars = target.split("");
    setScrambled(shuffle(chars).join(""));
  }

  function speak(word: Word) {
    try {
      const u = new SpeechSynthesisUtterance(word.sr);
      u.lang = "sr-RS"; // Serbian (Latin speech where available)
      u.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }

  function nextRound(newDifficulty?: number) {
    const lvl = clamp(newDifficulty ?? (autoDifficulty ? Math.min(5, 1 + Math.floor(progress.xp / 400)) : difficulty), 1, 5);
    if (!autoDifficulty) setDifficulty(lvl);
    const w = pickCard(lvl);
    setCurrent(w);
    setAnswer("");
    setResult("idle");
    if (mode === "multiple") buildOptions(w);
    if (mode === "true_false") buildTrueFalse(w);
    if (mode === "scramble") buildScramble(w);
    if (mode === "audio") speak(w);
  }

  useEffect(() => {
    nextRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function reward(correctNow: boolean) {
    setSessionTotal((s) => s + 1);
    if (correctNow) {
      setResult("correct");
      setSessionCorrect((s) => s + 1);
      const gained = 20;
      setProgress((p) => {
        const mastered = { ...p.mastered };
        if (current) mastered[current.sr] = (mastered[current.sr] || 0) + 1;
        const xp = p.xp + gained;
        const streak = p.streak + 1;
        const level = xpToLevel(xp);
        const np = { ...p, xp, streak, level, mastered };
        saveProgress(np);
        return np;
      });
      setBurstKey((k) => k + 1);
    } else {
      setResult("wrong");
      setProgress((p) => {
        const np = { ...p, streak: 0 };
        saveProgress(np);
        return np;
      });
    }
    setTimeout(() => nextRound(), 700);
  }

  function checkMultiple(opt: string) {
    if (!current) return;
    const correct = mode === "ru_to_sr" ? current.sr : current.ru;
    reward(opt.trim().toLowerCase() === correct.trim().toLowerCase());
  }
  function checkTyping() {
    if (!current) return;
    const target = mode === "ru_to_sr" || mode === "typing" ? current.sr : current.ru;
    reward(answer.trim().toLowerCase() === target.trim().toLowerCase());
  }
  function checkTrueFalse(tf: boolean) {
    reward(tf === tfTruth);
  }
  function checkScramble() {
    if (!current) return;
    const target = mode === "ru_to_sr" ? current.sr : current.ru;
    reward(answer.trim().toLowerCase() === target.trim().toLowerCase());
  }

  const sessionPct = sessionTotal ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;

  // Export / Import
  function exportProgress() {
    const payload = {
      progress,
      dict,
      exportedAt: new Date().toISOString(),
      app: "srb-trainer",
      v: 1,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `srb-progress-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function importProgress(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || "{}"));
        if (data.progress) {
          setProgress(data.progress);
          saveProgress(data.progress);
        }
        if (data.dict) {
          setDict(data.dict);
          saveDict(data.dict);
        }
      } catch {}
    };
    reader.readAsText(file);
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3 flex-nowrap">
        <motion.div
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="rounded-2xl bg-sky-600 p-3 text-white shadow"
        >
          <BookOpenText className="h-6 w-6" />
        </motion.div>
        <h1 className="text-2xl font-bold whitespace-nowrap">Сербско/черногорский ↔ русский</h1>
      </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="flex items-end gap-4 p-4">
            <div>
              <Label className="mb-1 block text-sm">Режим</Label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="multiple">Тест (4 варианта)</option>
                <option value="sr_to_ru">SR → RU (ввод)</option>
                <option value="ru_to_sr">RU → SR (ввод)</option>
                <option value="typing">Слепой набор</option>
                <option value="true_false">Правда/ложь</option>
                <option value="scramble">Собери слово</option>
                <option value="audio">Аудио (произношение)</option>
              </select>
            </div>
            <div>
              <Label className="mb-1 block text-sm">Сложность</Label>
              <div className="flex items-center gap-3">
                {!autoDifficulty && (
                  <select
                    value={String(difficulty)}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setAutoDifficulty(false);
                      setDifficulty(v);
                      nextRound(v);
                    }}
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                )}
                <Button variant={autoDifficulty ? "default" : "outline"} size="sm" onClick={() => setAutoDifficulty((s) => !s)}>
                  <Brain className="mr-2 h-4 w-4" /> {autoDifficulty ? "Авто" : "Вручную"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Area */}
        <Card className="relative overflow-hidden">
          <ConfettiBurst trigger={burstKey} />
          <CardHeader className="flex items-center justify-between pb-0">
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-sky-600" /> Упражнение
            </CardTitle>
            <Button variant="secondary" size="sm" onClick={() => nextRound()}>
              <RotateCcw className="mr-2 h-4 w-4" /> Пропустить / Новый
            </Button>
          </CardHeader>
          <CardContent className="relative p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Prompt */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                  Переведи <HelpCircle className="h-4 w-4"/>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={current?.sr + mode}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    className="rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 p-5 text-white shadow-lg">
                    <div className="text-sm opacity-90">{mode === "ru_to_sr" ? "Русский" : "Sr/Cr (latin)"}</div>
                    <div className="mt-1 text-2xl font-semibold">
                      {mode === "ru_to_sr" ? current?.ru : current?.sr}
                    </div>
                    {mode === "audio" && (
                      <Button className="mt-3" variant="secondary" onClick={()=> current && speak(current)}>
                        <Headphones className="mr-2 h-4 w-4"/> Произнести
                      </Button>
                    )}
                    {mode === "scramble" && (
                      <div className="mt-3 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm"><Shuffle className="mr-2 h-4 w-4"/>{scrambled}</div>
                    )}
                    {mode === "true_false" && (
                      <div className="mt-3 text-lg">{tfStatement}</div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Answer */}
              <div className="flex flex-col gap-3">
                {mode === "multiple" ? (
                  <div className="grid grid-cols-2 gap-3">
                    {options.map((opt) => (
                      <Button key={opt} variant="outline" className="h-14 justify-start text-left" onClick={() => checkMultiple(opt)}>
                        {opt}
                      </Button>
                    ))}
                  </div>
                ) : mode === "true_false" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="h-14" onClick={() => checkTrueFalse(true)}>Правда</Button>
                    <Button variant="outline" className="h-14" onClick={() => checkTrueFalse(false)}>Ложь</Button>
                  </div>
                ) : mode === "scramble" ? (
                  <div className="flex gap-2">
                    <Input placeholder={mode === "ru_to_sr" ? "Собери: ser/cr (latin)" : "Собери: русский"}
                      value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkScramble()} className="h-14 text-lg" />
                    <Button className="h-14 px-6" onClick={checkScramble}>Проверить</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input placeholder={mode === "ru_to_sr" ? "Введите перевод на ser/cr (latin)" : "Введите перевод на русский"}
                      value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkTyping()} className="h-14 text-lg" />
                    <Button className="h-14 px-6" onClick={checkTyping}>Проверить</Button>
                  </div>
                )}

                <div className="min-h-8">
                  {result === "correct" && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 text-green-600">
                      <Check className="h-5 w-5" /> Верно! +20 XP <Sparkles className="ml-1 h-5 w-5" />
                    </motion.div>
                  )}
                  {result === "wrong" && (
                    <motion.div initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2 text-rose-600">
                      <X className="h-5 w-5" /> Ошибка. Правильно: {mode === "ru_to_sr" ? current?.sr : current?.ru}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Session stats */}
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <StatCard label="Точность за сессию" value={`${sessionPct}%`} hint={`${sessionCorrect}/${sessionTotal}`} />
              <StatCard label="Серия ответов" value={`${progress.streak}`} hint="сброс при ошибке" />
              <div className="flex flex-col">
                <div className="mb-2 flex items-center text-sm text-slate-600">
                  <Trophy className="mr-1 h-4 w-4 text-sky-600" /> Прогресс уровня
                </div>
                <Progress value={overallPct} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dictionary & Import */}
        <Tabs defaultValue="" className="mt-8">
          <TabsList>
            <TabsTrigger value="dict">Словарь</TabsTrigger>
            <TabsTrigger value="about">О приложении</TabsTrigger>
            <TabsTrigger value="sync">Синхронизация</TabsTrigger>
          </TabsList>

          <TabsContent value="dict" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Ваш словарь ({dict.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-600">Добавляйте слова вручную или импортируйте CSV: <code>sr,ru,level,tag</code></div>
                <AddWordForm onAdd={(w) => setDict((d) => { const nd=[...d, w]; saveDict(nd); return nd; })} />
                <CsvImport onImport={(rows) => setDict((d) => { const nd=[...d, ...rows]; saveDict(nd); return nd; })} />

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {dict.map((w, idx) => (
                    <div key={w.sr + idx} className="flex items-center justify-between rounded-xl border p-3">
                      <div>
                        <div className="font-medium">{w.sr}<span className="mx-2 text-slate-400">→</span>{w.ru}</div>
                        <div className="text-xs text-slate-500">lvl {w.level} • {w.tag}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setDict((d) => { const nd=d.filter((it) => it !== w); saveDict(nd); return nd; })}>Удалить</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Экспорт/импорт прогресса</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 p-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={exportProgress}>
                    <Download className="mr-2 h-4 w-4" />Экспорт
                  </Button>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
                    <Upload className="h-4 w-4" /> Импорт
                    <input
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) importProgress(f);
                      }}
                    />
                  </label>
                </div>
                <p className="text-sm text-slate-600">
                  Переносите словарь и прогресс между устройствами через JSON файл.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="mt-4">
            <Card>
              <CardContent className="prose prose-sm max-w-none p-4">
                <h3>Как это работает</h3>
                <ul>
                  <li>Режимы: варианты, ввод RU↔SR, слепой набор, правда/ложь, «собери слово», аудио-произношение.</li>
                  <li>Сложность: вручную или авто-рост по XP/серии.</li>
                  <li>Геймификация: XP, уровни, серия, конфетти, анимации.</li>
                  <li>Прогресс/словарь сохраняются локально и могут экспортироваться.</li>
                </ul>
                <p className="text-slate-600">Частотный мини-набор включён. Можем импортировать ваш большой список CSV.</p>
                <h4>Развёртывание (Vite + Tailwind + shadcn/ui)</h4>
                <ol>
                  <li>Создать проект: <code>npm create vite@latest serb-trainer -- --template react-ts</code></li>
                  <li>Установить зависимости: <code>npm i framer-motion lucide-react class-variance-authority tailwind-merge tailwindcss postcss autoprefixer</code></li>
                  <li>Инициализировать Tailwind: <code>npx tailwindcss init -p</code> и подключить в <code>index.css</code>.</li>
                  <li>Добавить shadcn/ui: <code>npx shadcn@latest init</code>, затем <code>npx shadcn@latest add button card input select tabs badge progress label</code>.</li>
                  <li>Заменить <code>App.tsx</code> содержимым этого файла. Настроить алиас <code>@/components</code> в <code>tsconfig.json</code>.</li>
                  <li>Локальный запуск: <code>npm run dev</code>. Деплой: push в GitHub → Vercel «Import Project».</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="mt-10 pb-8 text-center text-xs text-slate-500">Made for fast daily drills • 🇲🇪🇷🇸 Latinica</footer>
    </div>
  );
}

