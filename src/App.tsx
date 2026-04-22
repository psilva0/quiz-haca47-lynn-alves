import { useState, useEffect } from "react";

// ================= FIREBASE =================
const DB = "https://quiz-sala-default-rtdb.firebaseio.com";

async function fbGet(path) {
  const r = await fetch(`${DB}/${path}.json`);
  return r.ok ? r.json() : null;
}

async function fbSet(path, data) {
  const r = await fetch(`${DB}/${path}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error("Erro Firebase: " + text);
  }

  return true;
}

// ================= RANKING =================
async function loadRanking() {
  const data = await fbGet("ranking");
  if (!data) return [];

  const list = Object.values(data);

  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.at - b.at;
  });

  return list;
}

async function saveScore(name, score, total) {
  const key = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

  await fbSet(`ranking/${key}`, {
    name,
    score,
    total,
    at: Date.now()
  });

  return loadRanking();
}

// ================= CONFIG =================
const TOTAL = 10;
const MEDALS = ["🥇", "🥈", "🥉"];

const QUESTIONS = [
  { id: 1, text: "IA pode gerar vieses?", options: ["Sim", "Não"], correct: "Sim" },
  { id: 2, text: "IA substitui professores?", options: ["Sim", "Não"], correct: "Não" },
  { id: 3, text: "IA precisa de ética?", options: ["Sim", "Não"], correct: "Sim" },
  { id: 4, text: "IA resolve tudo?", options: ["Sim", "Não"], correct: "Não" },
  { id: 5, text: "IA aprende com dados?", options: ["Sim", "Não"], correct: "Sim" },
  { id: 6, text: "IA é perfeita?", options: ["Sim", "Não"], correct: "Não" },
  { id: 7, text: "IA pode errar?", options: ["Sim", "Não"], correct: "Sim" },
  { id: 8, text: "IA pensa sozinha?", options: ["Sim", "Não"], correct: "Não" },
  { id: 9, text: "IA precisa supervisão?", options: ["Sim", "Não"], correct: "Sim" },
  { id: 10, text: "IA é neutra?", options: ["Sim", "Não"], correct: "Não" },
];

// ================= APP =================
export default function App() {
  const [screen, setScreen] = useState("start");
  const [name, setName] = useState("");
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    loadRanking().then(setRanking);
  }, []);

  const handleAnswer = (opt) => {
    setAnswers({ ...answers, [cur]: opt });
  };

  const next = () => {
    if (cur + 1 < TOTAL) {
      setCur(cur + 1);
    } else {
      const s = QUESTIONS.filter((q, i) => answers[i] === q.correct).length;
      setScore(s);
      saveScore(name, s, TOTAL).then(setRanking);
      setScreen("result");
    }
  };

  // ================= TELAS =================

  if (screen === "start") {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <h1>🎓 Quiz matéria HACA47</h1>
          <p>Prof. LYNN ALVES</p>

          <input
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={S.input}
          />

          <button style={S.btn} onClick={() => setScreen("quiz")}>
            Começar
          </button>

          <button style={S.ghost} onClick={() => setScreen("ranking")}>
            Ver ranking
          </button>
        </div>
      </div>
    );
  }

  if (screen === "quiz") {
    const q = QUESTIONS[cur];

    return (
      <div style={S.page}>
        <div style={S.card}>
          <h3>Questão {cur + 1}/{TOTAL}</h3>
          <p>{q.text}</p>

          {q.options.map((opt) => (
            <button key={opt} style={S.opt} onClick={() => handleAnswer(opt)}>
              {opt}
            </button>
          ))}

          <button style={S.btn} onClick={next}>
            Próxima
          </button>
        </div>
      </div>
    );
  }

  if (screen === "result") {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <h2>Resultado</h2>
          <h1>{score}/{TOTAL}</h1>

          <button style={S.btn} onClick={() => setScreen("ranking")}>
            Ver ranking
          </button>
        </div>
      </div>
    );
  }

  if (screen === "ranking") {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <h2>🏆 Ranking</h2>

          {ranking.map((p, i) => (
            <div key={i} style={S.rank}>
              <span>{i < 3 ? MEDALS[i] : `#${i + 1}`}</span>
              <span>{p.name}</span>
              <span>{p.score}</span>
            </div>
          ))}

          <button style={S.ghost} onClick={() => setScreen("start")}>
            Voltar
          </button>
        </div>
      </div>
    );
  }
}

// ================= ESTILO =================
const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#eef2ff",
    fontFamily: "sans-serif",
  },
  card: {
    background: "white",
    padding: 30,
    borderRadius: 20,
    width: 320,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
  },
  btn: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: 10,
  },
  ghost: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    background: "white",
    border: "1px solid #ddd",
  },
  opt: {
    width: "100%",
    padding: 10,
    marginTop: 8,
  },
  rank: {
    display: "flex",
    justifyContent: "space-between",
    padding: 8,
    borderBottom: "1px solid #eee",
  },
};
