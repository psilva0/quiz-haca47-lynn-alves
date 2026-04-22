import { useState, useEffect } from "react";

// ================= FIREBASE =================
const DB = "https://quiz-sala-default-rtdb.firebaseio.com";

async function fbGet(path: string) {
  const r = await fetch(`${DB}/${path}.json`);
  return r.ok ? r.json() : null;
}

async function fbSet(path: string, data: any) {
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

  const list = Object.values(data as any);

  list.sort((a: any, b: any) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.at - b.at;
  });

  return list;
}

async function saveScore(name: string, score: number) {
  const key = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

  await fbSet(`ranking/${key}`, {
    name,
    score,
    total: TOTAL,
    at: Date.now(),
  });

  return loadRanking();
}

// ================= CONFIG =================
const TOTAL = 10;
const MEDALS = ["🥇", "🥈", "🥉"];

const QUESTIONS = [
  {
    id: 1,
    text: "Considerando a relação entre dados de treinamento e resultados algorítmicos, qual alternativa melhor explica como vieses podem ser produzidos em sistemas de IA aplicados à educação?",
    options: [
      "A) Resultam exclusivamente de erros técnicos no código",
      "B) Decorrem apenas da falta de atualização dos sistemas",
      "C) Podem emergir de dados incompletos, decisões humanas e contextos sociais incorporados ao treinamento",
      "D) São causados apenas pelo uso indevido pelos estudantes",
    ],
    correct: "C",
  },
  {
    id: 2,
    text: "A partir da discussão sobre vieses algorítmicos na educação, qual é a implicação mais crítica para os processos educativos?",
    options: [
      "A) Redução do uso de tecnologias digitais",
      "B) Comprometimento da equidade e ampliação de desigualdades",
      "C) Aumento da autonomia total dos estudantes",
      "D) Eliminação da mediação docente",
    ],
    correct: "B",
  },
  {
    id: 3,
    text: "Considerando o papel da IA generativa no contexto acadêmico, qual é o principal desafio apontado em relação ao seu uso?",
    options: [
      "A) Falta de acesso à tecnologia",
      "B) Dificuldade de integração com redes sociais",
      "C) Necessidade de desenvolver critérios éticos e capacidade crítica de uso",
      "D) Substituição completa do professor",
    ],
    correct: "C",
  },
  {
    id: 4,
    text: "Qual alternativa melhor expressa o paradoxo da transparência no uso de IA generativa na pesquisa acadêmica?",
    options: [
      "A) Quanto mais transparente o sistema, menos ele é utilizado",
      "B) A transparência elimina todos os problemas éticos",
      "C) Exigir transparência pode não garantir compreensão real dos processos algorítmicos",
      "D) A transparência impede o uso da IA",
    ],
    correct: "C",
  },
  {
    id: 5,
    text: "Sobre a relação entre IA preditiva e IA generativa, qual afirmação está mais alinhada com os textos?",
    options: [
      "A) Ambas produzem conteúdos novos da mesma forma",
      "B) A IA preditiva cria textos e imagens originais",
      "C) A IA generativa produz novos conteúdos a partir de padrões aprendidos, enquanto a preditiva antecipa resultados",
      "D) Não há diferença relevante entre elas",
    ],
    correct: "C",
  },
  {
    id: 6,
    text: "Ao analisar o uso de IA na educação, qual alternativa apresenta uma tensão central discutida nos textos?",
    options: [
      "A) Entre ensino presencial e remoto",
      "B) Entre automação de processos e necessidade de reflexão crítica",
      "C) Entre livros e mídias digitais",
      "D) Entre professores e gestores",
    ],
    correct: "B",
  },
  {
    id: 7,
    text: "Considerando os exemplos de vieses apresentados, qual situação ilustra a reprodução de desigualdades por sistemas algorítmicos?",
    options: [
      "A) Uso de IA para correção automática de provas",
      "B) Recomendação de conteúdos personalizados para todos os alunos",
      "C) Avaliações diferenciadas baseadas em padrões históricos que favorecem determinados grupos",
      "D) Uso de plataformas digitais em sala de aula",
    ],
    correct: "C",
  },
  {
    id: 8,
    text: "Qual é o papel atribuído aos usuários (estudantes e professores) na interação com sistemas de IA?",
    options: [
      "A) Apenas consumir os resultados produzidos",
      "B) Substituir os sistemas quando houver erro",
      "C) Desenvolver capacidade de avaliar criticamente a confiabilidade dos resultados",
      "D) Evitar o uso da tecnologia",
    ],
    correct: "C",
  },
  {
    id: 9,
    text: "Em relação à ética no uso da IA generativa, qual alternativa expressa uma compreensão adequada?",
    options: [
      "A) Ética se resume ao cumprimento de regras técnicas",
      "B) Ética é irrelevante no uso acadêmico da IA",
      "C) Ética envolve decisões situadas e reflexão sobre impactos nos direitos e práticas sociais",
      "D) Ética é responsabilidade exclusiva dos desenvolvedores",
    ],
    correct: "C",
  },
  {
    id: 10,
    text: "Considerando os impactos da IA na sociedade, qual alternativa sintetiza uma posição crítica presente nos textos?",
    options: [
      "A) A IA resolve problemas sociais de forma automática",
      "B) A IA deve ser rejeitada nos contextos educacionais",
      "C) A IA amplia possibilidades, mas exige regulação, supervisão e reflexão crítica",
      "D) A IA não interfere nas práticas sociais",
    ],
    correct: "C",
  },
];

export default function App() {
  const [screen, setScreen] = useState("start");
  const [name, setName] = useState("");
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [ranking, setRanking] = useState<any[]>([]);

  useEffect(() => {
    loadRanking().then(setRanking);
  }, []);

  const handleAnswer = (opt: string) => {
    const letter = opt[0]; // 🔥 pega A/B/C/D
    setAnswers({ ...answers, [cur]: letter });
  };

  const next = () => {
    if (cur + 1 < TOTAL) {
      setCur(cur + 1);
    } else {
      const s = QUESTIONS.filter((q, i) => answers[i] === q.correct).length;
      setScore(s);
      saveScore(name, s).then(setRanking);
      setScreen("result");
    }
  };

  if (screen === "start") {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <h1>🎓 Quiz HACA47</h1>
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

  return null;
}

// ================= ESTILO =================
const S: any = {
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
    width: 350,
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
