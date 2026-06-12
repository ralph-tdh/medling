import { useState } from "react";

// ─── Assessment logic ────────────────────────────────────────────────
// Per lesson : 12 flashcards · 8 quiz Qs
// Per stage  : 1 checkpoint quiz (25 Qs) · 1 stage test (40 Qs)
// Per level  : 1 exit test (60 Qs) · go/no-go criteria
// ─────────────────────────────────────────────────────────────────────

const PRE_BEGINNER = {
  id: 0,
  name: "Pre-Beginner",
  cefr: "< A2",
  color: "#854F0B",
  light: "#FAEEDA",
  profile: "Absolute beginners to Medical English — any healthcare background, no prior English required",
  access: "FREE",
  purpose: "Gateway hook into Stage 1A. Completion-based only — no formal assessment.",
  lessons: [
    {
      id: "PB1",
      name: "In the hospital hallway",
      status: "built",
      file: "PB1_In_the_Hallway_V6.html",
      focus: "Hospital navigation, patient interaction, polite clinical phrases in hallway contexts",
      vocab: ["elevator", "ward", "appointment", "pharmacist", "prescription", "follow-up", "discharge"],
      phrases: [
        "Excuse me, are you okay?",
        "The elevator is just down the hall, on your right.",
        "Follow me, please.",
        "Let me find someone who can help you."
      ],
      format: "4 situations → phrase practice → 5-Q quiz"
    },
    {
      id: "PB2",
      name: "You already know Medical English",
      status: "built",
      file: "PB2_You_Already_Know_V1.html",
      focus: "Recognition of Latin/Greek medical terms already familiar from Vietnamese medical education — confidence-builder",
      vocab: ["diagnosis", "prognosis", "cardiac", "hepatic", "renal", "pulmonary", "trauma", "chronic"],
      phrases: [
        "You already know more than you think.",
        "Say it in English."
      ],
      format: "Recognition game → pronunciation practice → confidence quiz"
    },
    {
      id: "PB3",
      name: "First clinical encounter",
      status: "planned",
      file: null,
      focus: "Introducing yourself as a healthcare provider, opening a clinical encounter (AIDET-inspired opener)",
      vocab: ["introduction", "department", "chief complaint", "encounter", "I'll be taking care of you", "what brings you in"],
      phrases: [
        "Hello, I'm Dr. [name].",
        "I'll be your doctor today.",
        "What brings you in today?",
        "Can you tell me more about that?"
      ],
      format: "Role-play intro → listen & respond → 5-Q quiz"
    },
    {
      id: "PB4",
      name: "Vital signs and numbers",
      status: "planned",
      file: null,
      focus: "Reading and saying vital signs in English — BP, HR, RR, temperature, SpO2, numbers in clinical context",
      vocab: ["blood pressure", "heart rate", "respiratory rate", "temperature", "oxygen saturation", "SpO2", "GCS", "bpm"],
      phrases: [
        "BP is 120 over 80.",
        "Heart rate is 72 beats per minute.",
        "Temperature is 37.5 degrees Celsius.",
        "SpO2 is 98 percent on room air."
      ],
      format: "Numbers drill → vital signs reading → documentation practice → 5-Q quiz"
    }
  ]
};

const LEVELS = [
  {
    id: 1, name: "Foundation", cefr: "≈ A2 → B1",
    color: "#0F6E56", light: "#E1F5EE",
    profile: "Pre-clinical students, Year 1–2 med school",
    exitCriteria: "Can read a basic patient information leaflet and write a simple SOAP note with correct terminology. Passes exit test ≥ 75%.",
    passMarks: { checkpoint: "70%", stageTest: "72%", exitTest: "75%" },
    tbl: false,
    stages: [
      {
        id: "1A", name: "Medical Vocabulary Foundations", lessons: 10,
        focus: "Latin/Greek roots, prefixes & suffixes; body systems nomenclature; core medical word-building",
        skills: {
          Reading: "Basic anatomical diagrams, patient information leaflets",
          Writing: "Label diagrams, write simple medical definitions",
          Listening: "Slow-paced medical lectures, basic clinical instructions",
          Speaking: "Introduce self in clinical context, basic patient greeting"
        },
        terms: ["Anatomical planes", "Body systems", "200 core medical roots", "Basic prefixes/suffixes"],
        colls: ["administer medication", "perform an examination", "take a history", "record findings"],
        grammar: "Simple present/past, passive voice introduction, articles in clinical context",
        checkpoint: "25-Q quiz: roots/affixes matching + body system labelling. Pass mark 70%."
      },
      {
        id: "1B", name: "Basic Clinical Communication", lessons: 10,
        focus: "Patient–clinician basic interaction; clinical settings vocabulary; elementary documentation",
        skills: {
          Reading: "Simple case vignettes, appointment letters, patient forms",
          Writing: "Basic SOAP note components, simple clinical labels",
          Listening: "Simplified handover, patient complaints, basic ward instructions",
          Speaking: "Ask basic history-taking questions, describe common symptoms"
        },
        terms: ["Chief complaint", "Vital signs", "Basic symptom descriptors", "Clinical setting nouns"],
        colls: ["presents with", "complains of", "denies", "reports", "is admitted for"],
        grammar: "Question forms (open/closed), reported speech intro, frequency adverbs",
        checkpoint: "25-Q quiz: collocation gap-fill + short patient dialogue comprehension. Pass mark 70%."
      }
    ]
  },
  {
    id: 2, name: "Pre-Clinical", cefr: "≈ B1 → B2",
    color: "#185FA5", light: "#E6F1FB",
    profile: "Year 3–4 students entering clinical exposure",
    exitCriteria: "Can write a structured SOAP note from a clinical vignette and summarise a patient case verbally. Passes exit test ≥ 80%.",
    passMarks: { checkpoint: "75%", stageTest: "77%", exitTest: "80%" },
    tbl: false,
    stages: [
      {
        id: "2A", name: "Body Systems & Pathology Language", lessons: 12,
        focus: "System-by-system pathological language; diagnostic reasoning vocabulary; pathophysiology description",
        skills: {
          Reading: "Textbook chapters, clinical vignettes with MCQ-style comprehension",
          Writing: "System-based summaries, pathophysiology paragraphs",
          Listening: "Medical lectures & podcast content at natural pace",
          Speaking: "Present a body system, describe pathological processes to a peer"
        },
        terms: ["Per-system vocab: cardio, resp, GI, neuro, musculo", "Disease naming conventions", "Symptoms vs. signs"],
        colls: ["characterized by", "associated with", "presents as", "results in", "is caused by"],
        grammar: "Advanced passive voice, nominalization (inflame → inflammation), hedging intro",
        checkpoint: "25-Q quiz: pathology vocab MCQ + systems gap-fill + one-paragraph pathophysiology write-up. Pass mark 75%."
      },
      {
        id: "2B", name: "Clinical Documentation Basics", lessons: 12,
        focus: "Medical records, SOAP notes, referral letters, discharge summaries; abbreviation conventions",
        skills: {
          Reading: "Full SOAP notes, referral letters, lab & imaging reports",
          Writing: "Structured SOAP notes, patient summaries, basic referral letters",
          Listening: "Ward round discussions, handover reports at natural speed",
          Speaking: "Summarize a patient case to a peer or senior"
        },
        terms: ["Abbreviations (SOB, HTN, DM, Hx, Rx…)", "Lab value language", "Imaging report vocabulary"],
        colls: ["follow up with", "referred for", "ruled out", "consistent with", "unremarkable"],
        grammar: "Abbreviation conventions, telegraphic style, tense in documentation",
        checkpoint: "25-Q quiz: abbreviation decode + SOAP note error-correction task. Pass mark 75%."
      }
    ]
  },
  {
    id: 3, name: "Clinical Core", cefr: "≈ B2 → C1",
    color: "#534AB7", light: "#EEEDFE",
    profile: "Clinical year students (Year 5–6), interns, early residents",
    exitCriteria: "Can conduct a full OSCE-style history and explain a diagnosis in lay language. Can present differentials with appropriate hedging. Passes exit test ≥ 75%.",
    passMarks: { checkpoint: "70%", stageTest: "72%", exitTest: "75%" },
    tbl: true,
    stages: [
      {
        id: "3A", name: "Patient Communication & History Taking", lessons: 14,
        focus: "Full history taking; breaking bad news; patient education; lay vs. clinical register shifts",
        skills: {
          Reading: "Patient education materials, clinical guidelines (NICE, WHO, UpToDate)",
          Writing: "Patient-facing letters, consent documents, education materials",
          Listening: "Native-speed patient speech, accents, colloquialisms, emotional registers",
          Speaking: "Full OSCE-style history taking; explain diagnosis in lay language"
        },
        terms: ["Lay vs. clinical terminology pairs", "Pain descriptors (SOCRATES)", "Psychosocial vocabulary", "Sensitive topic language"],
        colls: ["I understand your concern", "walk me through", "can you describe the pain", "what brings you in today"],
        grammar: "Softening/hedging language, conditionals in clinical advice, empathetic phrasing, tag questions",
        tbl: "Role-play: history taking with simulated patient. Task = complete SOCRATES pain assessment and document findings. Debrief focuses on register shifts.",
        checkpoint: "25-Q quiz: MCQ on register + role-play rubric (assessed by peer or instructor). Pass mark 70%."
      },
      {
        id: "3B", name: "Clinical Reasoning in English", lessons: 14,
        focus: "Differential diagnosis language; clinical decision-making; evidence-based reasoning vocabulary",
        skills: {
          Reading: "Clinical guidelines, systematic reviews at abstract + methods level",
          Writing: "Clinical reasoning paragraphs, structured differential diagnosis list",
          Listening: "Case discussion podcasts, grand rounds recordings",
          Speaking: "Present differentials, argue clinical reasoning, ward round presentation"
        },
        terms: ["Probability language (pathognomonic, specific, sensitive)", "Causality terms", "Diagnosis/treatment action verbs"],
        colls: ["most likely", "less consistent with", "cannot exclude", "in the context of", "our primary concern is"],
        grammar: "Modal verbs for clinical uncertainty, discourse markers, logical connectors",
        tbl: "Case-based task: given a clinical vignette, build a ranked differential with justification in English. Present to group, field 3 challenge questions.",
        checkpoint: "25-Q quiz: modal hedging MCQ + differential ranking exercise + short oral summary (recorded or live). Pass mark 70%."
      }
    ]
  },
  {
    id: 4, name: "Advanced Clinical", cefr: "≈ C1",
    color: "#993C1D", light: "#FAECE7",
    profile: "Residents, junior specialists, doctors in international settings",
    exitCriteria: "Can critically appraise a journal article, write a structured abstract, and deliver a 10-min grand rounds case. Passes exit test ≥ 72%.",
    passMarks: { checkpoint: "67%", stageTest: "70%", exitTest: "72%" },
    tbl: true,
    stages: [
      {
        id: "4A", name: "Specialist Communication & Case Presentation", lessons: 12,
        focus: "Grand rounds; specialty consultations; multidisciplinary team (MDT) discussions",
        skills: {
          Reading: "Full research articles (NEJM, Lancet), specialty guidelines, practice updates",
          Writing: "Structured case reports, clinical letters to specialists, consultation notes",
          Listening: "Specialty conferences, rapid-fire case discussions, MDT meetings",
          Speaking: "Formal grand rounds presentation, lead MDT discussion, handle Q&A"
        },
        terms: ["Specialty vocabulary (cardio, onco, neuro…)", "Procedural terminology", "Prognostic language"],
        colls: ["in light of the evidence", "the consensus suggests", "my impression is", "from a surgical standpoint"],
        grammar: "Formal academic register, impersonal constructions, hedging in clinical argument",
        tbl: "Simulation: lead a 15-min MDT discussion on a complex case. Roles assigned (surgeon, internist, radiologist). Task = reach a management consensus in English.",
        checkpoint: "25-Q quiz: formal register error-correction + consultation note drafting task. Pass mark 67%."
      },
      {
        id: "4B", name: "Academic Medical English", lessons: 12,
        focus: "Reading & critiquing research; abstract writing; CME communication; journal club leadership",
        skills: {
          Reading: "Critically appraise RCTs, meta-analyses; assess study quality (CASP, GRADE)",
          Writing: "Structured abstracts, literature review sections, critical appraisal summaries",
          Listening: "Academic conference presentations, journal club Q&A, online courses",
          Speaking: "Present at journal club, handle academic Q&A, engage in research debate"
        },
        terms: ["Research methodology (RCT, bias, confounding)", "Statistical language (CI, p-value, NNT)", "Critical appraisal vocabulary"],
        colls: ["statistically significant", "confidence interval", "our findings suggest", "there is emerging evidence"],
        grammar: "Academic hedging, IMRAD tense conventions, passive voice in methods",
        tbl: "Journal club task: assign a real article (NEJM/Lancet). Each learner critiques one IMRAD section, presents 3 min, fields questions. Group writes a 150-word shared appraisal.",
        checkpoint: "25-Q quiz: stats language MCQ + 200-word structured abstract drafting. Pass mark 67%."
      }
    ]
  },
  {
    id: 5, name: "Professional Expert", cefr: "≈ C1 → C2",
    color: "#854F0B", light: "#FAEEDA",
    profile: "Specialists, researchers, educators, international collaborators",
    exitCriteria: "Can submit a complete manuscript draft, respond to reviewer comments, and present original research at a CME event. Passes exit test ≥ 70%.",
    passMarks: { checkpoint: "65%", stageTest: "67%", exitTest: "70%" },
    tbl: true,
    stages: [
      {
        id: "5A", name: "Research & Publication English", lessons: 10,
        focus: "Full manuscript writing (IMRAD); peer review process; grant writing; responding to reviewers",
        skills: {
          Reading: "Review manuscripts; read peer reviews; critique methods sections",
          Writing: "Full research papers, response to reviewers, grant proposals",
          Listening: "Academic networking, international symposia, oral defenses",
          Speaking: "Oral research defense, conference networking, grant pitch"
        },
        terms: ["Publication ethics vocabulary", "Peer review language", "Methodology & design terms", "Grant writing vocabulary"],
        colls: ["the present study aims to", "our results corroborate", "further research is warranted", "we acknowledge the limitation"],
        grammar: "Passive in methods, IMRAD tense conventions, reporting verbs with citations",
        tbl: "Manuscript workshop: learner brings a draft methods/results section. Group peer-reviews using actual journal criteria. Rewrite based on feedback.",
        checkpoint: "25-Q quiz: IMRAD tense MCQ + reviewer response letter drafting. Pass mark 65%."
      },
      {
        id: "5B", name: "International Professional Communication", lessons: 10,
        focus: "Global collaboration; medical education delivery; digital health; leadership communication",
        skills: {
          Reading: "Policy documents, WHO/CDC reports, health communication literature",
          Writing: "Professional emails, CME materials, international correspondence",
          Listening: "International English varieties, webinars, online health communication",
          Speaking: "Lead international workshops, present at CME events, handle media interviews"
        },
        terms: ["Health communication vocabulary", "Digital health terms (telehealth, EHR, AI in medicine)", "Basic intercultural communication flags"],
        colls: ["evidence-based practice", "patient-centered care", "best practice guidelines", "global health equity"],
        grammar: "Register shifting (formal ↔ accessible), professional email conventions, presentation signposting",
        tbl: "Workshop simulation: deliver a 10-min CME micro-lecture in English to a mixed-background audience. Task = pitch one clinical concept clearly to both specialists and GPs.",
        checkpoint: "25-Q quiz: professional email correction + CME abstract drafting. Pass mark 65%."
      }
    ]
  }
];

const PRAGMATICS_MODULE = {
  name: "Pragmatics & Intercultural Communication",
  tag: "Add-on / Final Milestone",
  desc: "Optional advanced module for clinicians working in international teams, pursuing overseas training, or co-authoring with foreign institutions. Not required for VN clinical career baseline.",
  topics: [
    "Face-threatening acts in clinical English (directness, disagreement, refusal)",
    "High-context vs. low-context communication styles",
    "Managing hierarchy in international MDT settings",
    "Culture-specific patient communication challenges",
    "English varieties: British, American, Indian, Australian in clinical contexts",
    "Professional networking and small talk at international conferences"
  ],
  lessons: 8,
  assessment: "Portfolio-based: 2 reflective case analyses + 1 recorded simulated international consultation"
};

const LESSON_TEMPLATE = [
  { phase: "Warm-up & Review", duration: "5 min", desc: "Recall previous lesson: 3–5 flashcard prompts, quick oral Q&A on prior vocabulary or grammar point." },
  { phase: "Content Input", duration: "15 min", desc: "New vocabulary/terminology presented in context. Pronunciation modelled. Collocations highlighted. Grammar focus introduced with examples." },
  { phase: "Guided Practice", duration: "12 min", desc: "Controlled exercises: gap-fill, matching, error-correction, or short reading/listening task tied to new content." },
  { phase: "BREAK", duration: "5–7 min", desc: "Hard stop. Stretch, hydrate, reset. No new content during break." },
  { phase: "Production / Application", duration: "13 min", desc: "Freer practice: speaking task, short writing, role-play prompt, or case-based discussion. TBL task at L3+ replaces this slot." },
  { phase: "Wrap-up & Mini Quiz", duration: "5 min", desc: "8-question in-class quiz (5 MCQ + 2 matching + 1 fill-in-the-blank). Immediate answer reveal. Flashcard deck assigned as homework." },
];

const ASSESSMENT_SYSTEM = {
  perLesson: {
    flashcards: 12, quizQs: 8,
    inClass: "8-Q mini quiz in final 5 min: 5 MCQ + 2 matching + 1 fill-in-the-blank. Results visible immediately.",
    homework: "12 flashcards assigned after each lesson: 6 terminology + 4 collocations + 2 grammar. Self-study via Anki or app. Est. 10–15 min/day.",
    note: "Flashcards are homework — NOT in-class. In-class quiz takes exactly 5 min of the wrap-up slot."
  },
  perStage: { checkpointQs: 25, stageTestQs: 40, note: "Checkpoint after lesson 5-6 (midpoint). Stage test at end. Both include reading, writing, and language use components. Delivered in a separate 60-min session." },
  perLevel: { exitTestQs: 60, note: "Exit test covers both stages. Mix: 35 MCQ + 15 error-correction + 10 production tasks. Pass marks: L1 75% · L2 80% · L3 75% · L4 72% · L5 70% — peaks at fundamentals, decreases as content shifts to production & judgment." }
};

const SKILL_COLORS = { Reading: "#0F6E56", Writing: "#185FA5", Listening: "#534AB7", Speaking: "#993C1D" };

const Tag = ({ children, color, italic }) => (
  <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 20, background: "#f0f0ef", color: "#555", border: "1px solid #e0e0e0", fontStyle: italic ? "italic" : "normal" }}>
    {children}
  </span>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 10, letterSpacing: ".09em", textTransform: "uppercase", color: "#aaa", marginBottom: 6 }}>{children}</div>
);

export default function MedFramework() {
  const [openLevel, setOpenLevel] = useState(null);
  const [openStage, setOpenStage] = useState(null);
  const [showAssess, setShowAssess] = useState(false);
  const [showPrag, setShowPrag] = useState(false);
  const [showPB, setShowPB] = useState(false);
  const [openPBLesson, setOpenPBLesson] = useState(null);
  const [activeTab, setActiveTab] = useState("content"); // "content" | "assessment"

  const totalLessons = LEVELS.reduce((a, l) => a + l.stages.reduce((b, s) => b + s.lessons, 0), 0);
  const totalFlashcards = totalLessons * ASSESSMENT_SYSTEM.perLesson.flashcards;
  const totalQuizQs = totalLessons * ASSESSMENT_SYSTEM.perLesson.quizQs + 10 * ASSESSMENT_SYSTEM.perStage.checkpointQs + 10 * ASSESSMENT_SYSTEM.perStage.stageTestQs + 5 * ASSESSMENT_SYSTEM.perLevel.exitTestQs;
  const contactHrsMin = Math.round(totalLessons * 0.75); // 45 min
  const contactHrsMax = Math.round(totalLessons * 1);    // 60 min

  function toggleLevel(id) { setOpenLevel(openLevel === id ? null : id); setOpenStage(null); }
  function toggleStage(id) { setOpenStage(openStage === id ? null : id); }

  const pill = (text, color) => (
    <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 20, border: `1px solid ${color}`, color, background: "transparent", whiteSpace: "nowrap" }}>{text}</span>
  );

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem", color: "#1a1a1a" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#aaa", marginBottom: 5 }}>MedLing · Master Curriculum · v3</div>
        <h1 style={{ fontSize: 21, fontWeight: 700, margin: "0 0 4px" }}>Master Curriculum — Study Roadmap</h1>
        <p style={{ fontSize: 13, color: "#666", margin: 0 }}>Pre-Beginner + 5 levels · 10 stages · CEFR as reference equivalence only</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          ["Total lessons", String(totalLessons)],
          ["Flashcards", totalFlashcards.toLocaleString()],
          ["Quiz questions", "~" + Math.round(totalQuizQs / 100) * 100 + "+"],
          ["Contact hours", `${contactHrsMin}–${contactHrsMax}h`]
        ].map(([l, v]) => (
          <div key={l} style={{ background: "#f5f5f3", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: "#999", marginBottom: 2 }}>{l}</div>
            <div style={{ fontSize: v.length > 7 ? 13 : 20, fontWeight: 700, letterSpacing: "-0.5px" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Assessment system panel */}
      <div style={{ marginBottom: 14, border: "1px solid #e0e0e0", borderRadius: 10, overflow: "hidden" }}>
        <button onClick={() => setShowAssess(!showAssess)}
          style={{ width: "100%", background: showAssess ? "#f0f0ef" : "#fafaf9", border: "none", cursor: "pointer", padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>🕐 Lesson Structure & Assessment System</span>
          <span style={{ fontSize: 16, color: "#aaa", transform: showAssess ? "rotate(180deg)" : "none", transition: "transform .2s", display: "inline-block" }}>⌄</span>
        </button>
        {showAssess && (
          <div style={{ borderTop: "1px solid #e8e8e8", padding: 14, background: "#fff" }}>

            {/* Lesson time template */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, letterSpacing: ".09em", textTransform: "uppercase", color: "#aaa", marginBottom: 8 }}>
                Standard lesson format — 45–60 min total · 5–7 min break included
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {LESSON_TEMPLATE.map((block, i) => {
                  const isBreak = block.phase === "BREAK";
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 10px",
                      borderRadius: 7,
                      background: isBreak ? "#FFF8E6" : "#f8f8f8",
                      border: `1px solid ${isBreak ? "#F5A62350" : "#ececec"}`
                    }}>
                      <div style={{ flexShrink: 0, width: 54, fontSize: 11, fontWeight: 700, color: isBreak ? "#b07a10" : "#534AB7", paddingTop: 1 }}>
                        {block.duration}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: isBreak ? "#b07a10" : "#222", marginBottom: 2 }}>{block.phase}</div>
                        <div style={{ fontSize: 11, color: "#666", lineHeight: 1.4 }}>{block.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assessment numbers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[
                { label: "Per lesson", items: ["8-Q in-class quiz", "12 flashcards (HW)"], note: ASSESSMENT_SYSTEM.perLesson.note, color: "#0F6E56" },
                { label: "Per stage", items: [`${ASSESSMENT_SYSTEM.perStage.checkpointQs}-Q checkpoint quiz`, `${ASSESSMENT_SYSTEM.perStage.stageTestQs}-Q stage test`], note: ASSESSMENT_SYSTEM.perStage.note, color: "#185FA5" },
                { label: "Per level", items: [`${ASSESSMENT_SYSTEM.perLevel.exitTestQs}-Q exit test`, "Go/no-go criteria"], note: ASSESSMENT_SYSTEM.perLevel.note, color: "#854F0B" },
              ].map(({ label, items, note, color }) => (
                <div key={label} style={{ border: `1px solid ${color}22`, borderRadius: 8, padding: "10px 12px", background: color + "08" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6, letterSpacing: ".04em", textTransform: "uppercase" }}>{label}</div>
                  {items.map(i => <div key={i} style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{i}</div>)}
                  <div style={{ fontSize: 11, color: "#777", marginTop: 6, lineHeight: 1.4 }}>{note}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#888", padding: "8px 12px", background: "#f8f8f8", borderRadius: 6, lineHeight: 1.5 }}>
              <strong>Micro-learning formats:</strong> Flashcard decks (Anki-ready, homework), in-class matching games, listening cloze, error-correction drills. Full interactive app builds = the MedLing Self-Learning product (see medling_roadmap.md).
            </div>
          </div>
        )}
      </div>

      {/* Pre-Beginner panel */}
      <div style={{ border: `1px solid ${showPB ? PRE_BEGINNER.color : "#e0e0e0"}`, borderRadius: 12, overflow: "hidden", marginBottom: 8, transition: "border-color .2s" }}>
        <button onClick={() => { setShowPB(!showPB); setOpenPBLesson(null); }}
          style={{ width: "100%", background: showPB ? PRE_BEGINNER.light : "#fff", border: "none", cursor: "pointer", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: PRE_BEGINNER.light, border: `2px solid ${PRE_BEGINNER.color}`, display: "flex", alignItems: "center", justifyContent: "center", color: PRE_BEGINNER.color, fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
            PB
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              {PRE_BEGINNER.name}
              <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: PRE_BEGINNER.light, color: PRE_BEGINNER.color, border: `1px solid ${PRE_BEGINNER.color}44`, fontWeight: 700 }}>FREE</span>
              <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: "#E1F5EE", color: "#0F6E56", border: "1px solid #0F6E5640", fontWeight: 700 }}>2 built · 2 planned</span>
            </div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{PRE_BEGINNER.profile}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 20, border: `1px solid ${PRE_BEGINNER.color}`, color: PRE_BEGINNER.color }}>{PRE_BEGINNER.cefr}</span>
            <span style={{ fontSize: 12, color: "#999" }}>4 lessons</span>
            <span style={{ fontSize: 16, color: "#aaa", transform: showPB ? "rotate(180deg)" : "none", transition: "transform .2s", display: "inline-block" }}>⌄</span>
          </div>
        </button>

        {showPB && (
          <div style={{ borderTop: "1px solid #e8e8e8", padding: 14, background: "#fafafa" }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 12, lineHeight: 1.5, background: PRE_BEGINNER.light, padding: "8px 12px", borderRadius: 8, border: `1px solid ${PRE_BEGINNER.color}30` }}>
              <strong style={{ color: PRE_BEGINNER.color }}>Purpose:</strong> {PRE_BEGINNER.purpose}
            </div>

            {/* PB lesson selector */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              {PRE_BEGINNER.lessons.map(l => (
                <button key={l.id} onClick={() => setOpenPBLesson(openPBLesson === l.id ? null : l.id)}
                  style={{ width: "100%", border: `1px solid ${openPBLesson === l.id ? PRE_BEGINNER.color : "#ddd"}`, borderRadius: 8, padding: "10px 12px", background: openPBLesson === l.id ? "#fff" : "#f5f5f3", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: PRE_BEGINNER.color }}>{l.id}</span>
                    <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: l.status === "built" ? "#E1F5EE" : "#f0f0ef", color: l.status === "built" ? "#0F6E56" : "#888", border: `1px solid ${l.status === "built" ? "#0F6E5640" : "#e0e0e0"}` }}>
                      {l.status === "built" ? "✓ built" : "planned"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#444", lineHeight: 1.4 }}>{l.name}</div>
                </button>
              ))}
            </div>

            {/* PB lesson detail */}
            {openPBLesson && (() => {
              const l = PRE_BEGINNER.lessons.find(x => x.id === openPBLesson);
              if (!l) return null;
              return (
                <div style={{ border: "1px solid #e0e0e0", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid #e8e8e8" }}>
                    <SectionLabel>Focus</SectionLabel>
                    <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>{l.focus}</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                    <div style={{ padding: "10px 14px", borderRight: "1px solid #e8e8e8" }}>
                      <SectionLabel>Key vocabulary</SectionLabel>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {l.vocab.map(v => <Tag key={v}>{v}</Tag>)}
                      </div>
                    </div>
                    <div style={{ padding: "10px 14px" }}>
                      <SectionLabel>Key phrases</SectionLabel>
                      {l.phrases.map(p => (
                        <div key={p} style={{ fontSize: 12, fontStyle: "italic", color: "#555", marginBottom: 3, lineHeight: 1.4 }}>"{p}"</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: "8px 14px", background: "#f8f8f8", borderTop: "1px solid #e8e8e8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 11, color: "#888" }}>{l.format}</div>
                    {l.status === "built"
                      ? <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#E1F5EE", color: "#0F6E56", border: "1px solid #0F6E5640" }}>File: {l.file}</span>
                      : <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#f0f0ef", color: "#888", border: "1px solid #e0e0e0" }}>To build</span>
                    }
                  </div>
                </div>
              );
            })()}

            {!openPBLesson && <p style={{ fontSize: 12, color: "#bbb", textAlign: "center", padding: "6px 0", marginTop: 4 }}>Select a lesson above to see detail</p>}
          </div>
        )}
      </div>

      {/* Levels */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {LEVELS.map(lvl => {
          const isOpen = openLevel === lvl.id;
          const totalL = lvl.stages.reduce((a, s) => a + s.lessons, 0);
          return (
            <div key={lvl.id} style={{ border: `1px solid ${isOpen ? lvl.color : "#e0e0e0"}`, borderRadius: 12, overflow: "hidden", transition: "border-color .2s" }}>
              <button onClick={() => toggleLevel(lvl.id)}
                style={{ width: "100%", background: isOpen ? lvl.light : "#fff", border: "none", cursor: "pointer", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: lvl.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  L{lvl.id}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    {lvl.name}
                    {lvl.tbl && <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: "#534AB720", color: "#534AB7", fontWeight: 600 }}>TBL</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lvl.profile}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 20, border: `1px solid ${lvl.color}`, color: lvl.color, whiteSpace: "nowrap" }}>{lvl.cefr}</span>
                  <span style={{ fontSize: 12, color: "#999" }}>{totalL} lessons</span>
                  <span style={{ fontSize: 16, color: "#aaa", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s", display: "inline-block" }}>⌄</span>
                </div>
              </button>

              {isOpen && (
                <div style={{ borderTop: "1px solid #e8e8e8", padding: 14, background: "#fafafa" }}>
                  {/* Stage selector */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                    {lvl.stages.map(s => (
                      <button key={s.id} onClick={() => toggleStage(s.id)}
                        style={{ width: "100%", border: `1px solid ${openStage === s.id ? lvl.color : "#ddd"}`, borderRadius: 8, padding: "10px 12px", background: openStage === s.id ? "#fff" : "#f5f5f3", cursor: "pointer", textAlign: "left" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: lvl.color }}>{s.id}</span>
                          <span style={{ fontSize: 11, color: "#aaa" }}>{s.lessons} lessons · {s.lessons * 12} cards · {s.lessons * 8}Q</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#444", lineHeight: 1.4 }}>{s.name}</div>
                      </button>
                    ))}
                  </div>

                  {/* Stage detail */}
                  {openStage && (() => {
                    const s = lvl.stages.find(x => x.id === openStage);
                    if (!s) return null;
                    return (
                      <div style={{ border: "1px solid #e0e0e0", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                        {/* Tabs */}
                        <div style={{ display: "flex", borderBottom: "1px solid #e8e8e8" }}>
                          {["content", "assessment"].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                              style={{ padding: "9px 16px", background: activeTab === tab ? "#fff" : "#f8f8f8", border: "none", borderBottom: activeTab === tab ? `2px solid ${lvl.color}` : "2px solid transparent", cursor: "pointer", fontSize: 12, fontWeight: activeTab === tab ? 700 : 400, color: activeTab === tab ? lvl.color : "#888", textTransform: "capitalize" }}>
                              {tab === "content" ? "Content & Skills" : "Assessment"}
                            </button>
                          ))}
                        </div>

                        <div style={{ padding: 14 }}>
                          {activeTab === "content" ? (
                            <>
                              <div style={{ marginBottom: 13 }}>
                                <SectionLabel>Focus</SectionLabel>
                                <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>{s.focus}</div>
                              </div>

                              <div style={{ marginBottom: 13 }}>
                                <SectionLabel>4 Skills targets</SectionLabel>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                  {Object.entries(s.skills).map(([sk, val]) => (
                                    <div key={sk} style={{ background: "#f8f8f8", border: "1px solid #ececec", borderRadius: 8, padding: "8px 10px" }}>
                                      <div style={{ fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 700, color: SKILL_COLORS[sk], marginBottom: 3 }}>{sk}</div>
                                      <div style={{ fontSize: 12, color: "#555", lineHeight: 1.4 }}>{val}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {s.tbl && (
                                <div style={{ marginBottom: 13, background: "#EEEDFE", border: "1px solid #534AB730", borderRadius: 8, padding: "10px 12px" }}>
                                  <SectionLabel>Task-based activity (TBL)</SectionLabel>
                                  <div style={{ fontSize: 12, color: "#3d3595", lineHeight: 1.5 }}>{s.tbl}</div>
                                </div>
                              )}

                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 13 }}>
                                <div>
                                  <SectionLabel>Terminology clusters</SectionLabel>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                    {s.terms.map(t => <Tag key={t}>{t}</Tag>)}
                                  </div>
                                </div>
                                <div>
                                  <SectionLabel>Key collocations</SectionLabel>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                    {s.colls.map(c => <Tag key={c} italic>{c}</Tag>)}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <SectionLabel>Grammar / Register focus</SectionLabel>
                                <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>{s.grammar}</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                                {[
                                  { label: "In-class quiz", v1: "8 questions", v2: "Final 5 min of lesson", color: lvl.color },
                                  { label: "Midpoint checkpoint", v1: "25-Q quiz", v2: `Pass ≥ ${lvl.passMarks?.checkpoint || "—"}`, color: "#534AB7" },
                                  { label: "Stage test", v1: "40-Q test", v2: `Pass ≥ ${lvl.passMarks?.stageTest || "—"}`, color: "#185FA5" },
                                ].map(({ label, v1, v2, color }) => (
                                  <div key={label} style={{ background: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: 8, padding: "10px 12px" }}>
                                    <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>{label}</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{v1}</div>
                                    <div style={{ fontSize: 12, color: "#777" }}>{v2}</div>
                                  </div>
                                ))}
                              </div>

                              <div style={{ marginBottom: 14 }}>
                                <SectionLabel>Checkpoint detail</SectionLabel>
                                <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5, background: "#f8f8f8", padding: "10px 12px", borderRadius: 8 }}>{s.checkpoint}</div>
                              </div>

                              <div style={{ background: "#f0f0ef", borderRadius: 8, padding: "10px 12px" }}>
                                <SectionLabel>Homework (self-study, ~10–15 min/day)</SectionLabel>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                                  {["12 flashcards / lesson (Anki-ready)", "6 terminology + 4 collocations + 2 grammar"].map(f => <Tag key={f}>{f}</Tag>)}
                                </div>
                                <SectionLabel>In-class micro formats</SectionLabel>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                  {["5-min end-of-lesson quiz", "Matching game", "Listening cloze", "Error-correction drill", "Gap-fill collocations"].map(f => <Tag key={f}>{f}</Tag>)}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Level exit criteria */}
                  <div style={{ marginTop: 10, fontSize: 12, color: "#555", background: lvl.light, border: `1px solid ${lvl.color}30`, borderRadius: 8, padding: "8px 12px", lineHeight: 1.5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <strong style={{ color: lvl.color }}>Level {lvl.id} exit criteria</strong>
                      {lvl.passMarks && (
                        <>
                          <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 20, background: lvl.color + "18", color: lvl.color, fontWeight: 600 }}>Checkpoint {lvl.passMarks.checkpoint}</span>
                          <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 20, background: lvl.color + "18", color: lvl.color, fontWeight: 600 }}>Stage test {lvl.passMarks.stageTest}</span>
                          <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 20, background: lvl.color, color: "#fff", fontWeight: 700 }}>Exit test {lvl.passMarks.exitTest}</span>
                        </>
                      )}
                    </div>
                    {lvl.exitCriteria.replace(/Passes exit test.*/, "")}
                  </div>

                  {!openStage && (
                    <p style={{ fontSize: 12, color: "#bbb", textAlign: "center", padding: "6px 0", marginTop: 6 }}>Select a stage above to see full detail</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pragmatics add-on */}
      <div style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
        <button onClick={() => setShowPrag(!showPrag)}
          style={{ width: "100%", background: showPrag ? "#f5f5f3" : "#fafaf9", border: "none", cursor: "pointer", padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>🌐 Pragmatics & Intercultural Communication</span>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#faeeda", color: "#854F0B", fontWeight: 600 }}>Add-on / On demand</span>
          </div>
          <span style={{ fontSize: 16, color: "#aaa", transform: showPrag ? "rotate(180deg)" : "none", transition: "transform .2s", display: "inline-block" }}>⌄</span>
        </button>
        {showPrag && (
          <div style={{ borderTop: "1px solid #e8e8e8", padding: 14, background: "#fff" }}>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>{PRAGMATICS_MODULE.desc}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
              {PRAGMATICS_MODULE.topics.map(t => (
                <div key={t} style={{ fontSize: 12, color: "#444", padding: "6px 10px", background: "#f8f8f8", borderRadius: 6, lineHeight: 1.4 }}>• {t}</div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#666", background: "#faeeda50", padding: "8px 12px", borderRadius: 6 }}>
              <strong>8 lessons</strong> · Assessment: {PRAGMATICS_MODULE.assessment}
            </div>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div style={{ fontSize: 11, color: "#aaa", lineHeight: 1.8, borderTop: "1px solid #e8e8e8", paddingTop: 12 }}>
        <div>⏱ Each lesson = 45–60 min total, including 5–7 min break. Net instructional time: ~40–50 min.</div>
        <div>📚 L1–L3 (72 lessons) = ~54–72 contact hours. Full L1–L5 (116 lessons) = ~87–116 contact hours.</div>
        <div>📖 Flashcards are homework (10–15 min/day self-study). In-class quiz = 5 min at end of each lesson.</div>
        <div>🔬 TBL = Task-Based Learning, from Level 3. Pre-Beginner = free gateway (4 lessons, no formal assessment). CEFR labels are reference equivalents only.</div>
      </div>
    </div>
  );
}
