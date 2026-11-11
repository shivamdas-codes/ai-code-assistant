import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, ArrowUpRight, Bug, Check, ChevronDown, Code2, Copy, FileCode2, FlaskConical, Github, KeyRound, Lightbulb, Menu, Moon, Play, RefreshCw, Search, ShieldCheck, Sparkles, Terminal, WandSparkles, X } from 'lucide-react'
import './style.css'

const tasks = [
  { id: 'review', label: 'Review code', icon: ShieldCheck, description: 'Find bugs, risks, and improvements.' },
  { id: 'debug', label: 'Debug issue', icon: Bug, description: 'Investigate an error and suggest a fix.' },
  { id: 'explain', label: 'Explain code', icon: Lightbulb, description: 'Understand logic step by step.' },
  { id: 'tests', label: 'Generate tests', icon: FlaskConical, description: 'Create useful test cases.' },
]
const starterCode = `function calculateTotal(items) {
  let total = 0;

  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }

  return total;
}

console.log(calculateTotal([
  { name: "Keyboard", price: 1200 },
  { name: "Mouse", price: 600 }
]));`
const demoAnswers = {
  review: `## Code review

**Overall:** The function is readable, but it contains an off-by-one bug.

### Findings
1. **High — Loop boundary:** \`i <= items.length\` accesses one index beyond the array. Use \`i < items.length\`.
2. **Medium — Missing input validation:** If \`items\` is undefined or not an array, the function throws.
3. **Low — Defensive data handling:** Validate that each item has a numeric \`price\`.

### Suggested fix
\`\`\`js
function calculateTotal(items = []) {
  if (!Array.isArray(items)) {
    throw new TypeError("items must be an array");
  }

  return items.reduce((total, item) => {
    if (typeof item.price !== "number") {
      throw new TypeError("Each item must have a numeric price");
    }
    return total + item.price;
  }, 0);
}
\`\`\`

### Next steps
- Add tests for an empty array.
- Add a test for invalid input.
- Add a test for an item with a missing price.`,
  debug: `## Debugging report

**Likely cause:** The loop uses \`i <= items.length\`. The final iteration reads \`items[items.length]\`, which is \`undefined\`. Accessing \`.price\` then causes a TypeError.

### Minimal fix
Change:
\`\`\`js
i <= items.length
\`\`\`
to:
\`\`\`js
i < items.length
\`\`\`

### Why it works
JavaScript arrays are zero-indexed. For an array of length 2, valid indexes are 0 and 1 — not 2.

### Verify
Expected output for the sample data: \`1800\`.`,
  explain: `## Explanation

1. The function receives an array named \`items\`.
2. It initializes \`total\` to zero.
3. It loops over the array and adds each item's \`price\`.
4. It returns the accumulated total.

### Important concept
Arrays use zero-based indexing. The last valid index is \`items.length - 1\`.

### Complexity
- **Time:** O(n), because each item is visited once.
- **Space:** O(1), because the function uses a fixed amount of extra memory.

**Watch out:** The current loop condition should be \`i < items.length\`, otherwise it reads past the end of the array.`,
  tests: `## Suggested test cases

Using Vitest:

\`\`\`js
import { describe, it, expect } from "vitest";
import { calculateTotal } from "./calculateTotal";

describe("calculateTotal", () => {
  it("sums item prices", () => {
    expect(calculateTotal([
      { price: 1200 },
      { price: 600 }
    ])).toBe(1800);
  });

  it("returns zero for an empty array", () => {
    expect(calculateTotal([])).toBe(0);
  });

  it("handles a single item", () => {
    expect(calculateTotal([{ price: 250 }])).toBe(250);
  });

  it("rejects non-array input", () => {
    expect(() => calculateTotal(null)).toThrow();
  });
});
\`\`\`

### Coverage checklist
- Normal input
- Empty input
- Single item
- Invalid input
- Missing or non-numeric price`
}
function App() {
  const [task, setTask] = useState('review')
  const [code, setCode] = useState(starterCode)
  const [language, setLanguage] = useState('JavaScript')
  const [context, setContext] = useState('')
  const [result, setResult] = useState(demoAnswers.review)
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [notice, setNotice] = useState('Demo mode · Add your Gemini API key for live responses')
  const [mobileMenu, setMobileMenu] = useState(false)
  const active = tasks.find(t => t.id === task)
  const lineCount = useMemo(() => code.split('\n').length, [code])

  async function runAssistant() {
    if (!code.trim()) { setNotice('Add some code before running the assistant.'); return }
    setLoading(true)
    setNotice(apiKey.trim() ? 'Connecting to Gemini…' : 'Showing a sample result. Add a Gemini API key for live analysis.')
    if (!apiKey.trim()) {
      await new Promise(r => setTimeout(r, 650))
      setResult(demoAnswers[task])
      setLoading(false)
      return
    }
    const prompts = {
      review: 'Review this code. Identify bugs, security concerns, performance issues, and maintainability improvements. Prioritize findings and provide a corrected example.',
      debug: 'Debug this code. Explain the likely cause, show the minimal fix, and provide steps to verify it.',
      explain: 'Explain this code clearly for a junior developer. Cover flow, key concepts, and time/space complexity where relevant.',
      tests: 'Generate practical unit tests for this code. State assumptions and include edge cases.'
    }
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(apiKey.trim()), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `${prompts[task]}\nLanguage: ${language}\nAdditional context: ${context || 'None'}\n\nCode:\n${code}` }] }] })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error?.message || 'Gemini request failed. Check the API key and try again.')
      const answer = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n')
      setResult(answer || 'No text response received. Try again.')
      setNotice('Live response generated with Gemini')
    } catch (error) {
      setNotice(error.message)
    } finally { setLoading(false) }
  }
  function copyResult() {
    navigator.clipboard?.writeText(result).then(() => setNotice('Result copied to clipboard')).catch(() => setNotice('Clipboard unavailable in this browser'))
  }
  function renderMarkdownLite(value) {
    return value.split('\n').map((line, i) => {
      if (line.startsWith('```')) return null
      if (line.startsWith('## ')) return <h3 key={i}>{line.slice(3)}</h3>
      if (line.startsWith('### ')) return <h4 key={i}>{line.slice(4)}</h4>
      if (line.startsWith('- ')) return <div className="md-list" key={i}>• {line.slice(2)}</div>
      if (/^\d+\./.test(line)) return <div className="md-list" key={i}>{line}</div>
      if (line.trim() === '') return <div className="spacer-line" key={i}/>
      return <p key={i}>{line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part,j) => part.startsWith('`') ? <code key={j}>{part.slice(1,-1)}</code> : part.startsWith('**') ? <strong key={j}>{part.slice(2,-2)}</strong> : part)}</p>
    })
  }
  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Code2 size={20}/></div><span>devmate<span className="brand-dot">.</span></span><button className="mobile-close" onClick={() => setMobileMenu(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <button className="workspace"><div className="workspace-avatar">S</div><span><b>Shivam's workspace</b><small>Personal plan</small></span><ChevronDown size={15}/></button>
      <div className="nav-label">ASSISTANT TOOLS</div>
      <nav>{tasks.map(item => <button key={item.id} className={`nav-item ${task === item.id ? 'selected' : ''}`} onClick={() => {setTask(item.id);setResult(demoAnswers[item.id]);setMobileMenu(false)}}><item.icon size={17}/><span>{item.label}</span>{task === item.id && <span className="nav-active"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="usage-card"><div className="usage-icon"><Activity size={16}/></div><b>Build with confidence</b><p>Review, understand, and improve code with an AI pair programmer.</p><span className="usage-link">Explore workflow <ArrowUpRight size={13}/></span></div><div className="profile"><div className="profile-avatar">SD</div><div><b>Shivam Das</b><small>Developer</small></div><button title="Settings"><Menu size={17}/></button></div></div>
    </aside>
    {mobileMenu && <div className="scrim" onClick={() => setMobileMenu(false)}/>}
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileMenu(true)}><Menu size={19}/></button><div className="breadcrumbs">Workspace <span>/</span> AI Assistant <span>/</span> <b>{active.label}</b></div><div className="top-actions"><span className="status-pill"><span/> All systems operational</span><button className="icon-btn" title="Theme"><Moon size={17}/></button><a className="github-link" href="https://github.com" target="_blank" rel="noreferrer"><Github size={16}/> GitHub</a></div></header>
      <section className="content">
        <div className="hero-row"><div><div className="eyebrow"><Sparkles size={13}/> YOUR AI DEVELOPMENT PARTNER</div><h1>Ship better code, <span>faster.</span></h1><p className="hero-sub">Your thoughtful coding companion for the tricky parts of building software.</p></div><div className="hero-decoration"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orb-core"><Code2 size={27}/></div><Sparkles className="spark spark-a" size={17}/><Sparkles className="spark spark-b" size={12}/></div></div>
        <div className="tool-tabs">{tasks.map(item => <button key={item.id} className={`tool-tab ${task === item.id ? 'active' : ''}`} onClick={() => {setTask(item.id);setResult(demoAnswers[item.id])}}><item.icon size={16}/>{item.label}</button>)}</div>
        <div className="workspace-grid">
          <section className="panel editor-panel"><div className="panel-head"><div className="panel-title"><FileCode2 size={17}/> <b>Code workspace</b><span className="file-chip">main.{language === 'Python' ? 'py' : language === 'TypeScript' ? 'ts' : 'js'}</span></div><div className="panel-tools"><select value={language} onChange={e => setLanguage(e.target.value)}><option>JavaScript</option><option>TypeScript</option><option>Python</option><option>Java</option><option>Go</option></select></div></div>
            <div className="editor"><div className="line-numbers">{Array.from({length: Math.max(lineCount, 1)}, (_,i) => <span key={i}>{i+1}</span>)}</div><textarea spellCheck="false" value={code} onChange={e => setCode(e.target.value)} aria-label="Code editor" /></div>
            <div className="editor-footer"><span><span className="green-dot"/> Ready</span><span>{lineCount} lines · {code.length} chars</span></div>
            <div className="context-box"><label>ADDITIONAL CONTEXT <span>OPTIONAL</span></label><input value={context} onChange={e => setContext(e.target.value)} placeholder="e.g. This function is part of my checkout flow…"/></div>
            <button className="run-btn" onClick={runAssistant} disabled={loading}><WandSparkles size={17}/>{loading ? 'Working on it…' : active.label}<ArrowUpRight size={16}/></button>
            <div className="privacy-note"><ShieldCheck size={13}/> Your code is sent to Gemini only when you run a live request.</div>
          </section>
          <section className="panel result-panel"><div className="panel-head"><div className="panel-title"><div className="result-icon"><Sparkles size={15}/></div><b>Assistant output</b><span className="ai-tag">AI GENERATED</span></div><div className="panel-tools"><button className="small-icon" onClick={copyResult} title="Copy result"><Copy size={15}/></button><button className="small-icon" onClick={() => setResult(demoAnswers[task])} title="Reset sample"><RefreshCw size={15}/></button></div></div>
            <div className="result-scroll"><div className="result-intro"><div className="result-badge"><active.icon size={16}/></div><div><b>{active.label}</b><small>{active.description}</small></div></div><div className="answer-content">{renderMarkdownLite(result)}</div></div>
            <div className="result-footer"><span><span className="green-dot"/> {notice}</span><button onClick={copyResult}><Copy size={13}/> Copy output</button></div>
          </section>
        </div>
        <div className="bottom-note"><div className="note-icon"><Terminal size={16}/></div><div><b>A better developer workflow starts here.</b><p>Use the sample code to explore, or paste your own snippet and choose a task above.</p></div><div className="note-right"><ShieldCheck size={15}/> Human review recommended</div></div>
        <footer>© 2026 DevMate <span>Made for curious developers</span><span className="footer-right">Privacy-first demo · v1.0.0</span></footer>
      </section>
    </main>
    <button className="key-fab" onClick={() => setShowKey(true)}><KeyRound size={16}/> Configure API key</button>
    {showKey && <div className="modal-backdrop" onClick={() => setShowKey(false)}><div className="key-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowKey(false)}><X size={18}/></button><div className="modal-icon"><KeyRound size={20}/></div><h2>Connect Gemini</h2><p>Add your Google AI Studio API key to enable live code assistance. It stays in this page's memory and is not saved to a server.</p><label>GEMINI API KEY</label><div className="key-input"><input type={showKey ? 'password' : 'text'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Paste your API key"/><button onClick={() => setShowKey(false)}><Check size={16}/></button></div><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Get an API key from Google AI Studio <ArrowUpRight size={13}/></a><div className="modal-warning">For a production app, move API requests to a backend and store secrets in environment variables. Never commit API keys to GitHub.</div><button className="save-key" onClick={() => {setNotice(apiKey.trim() ? 'Gemini key configured for this session' : 'Demo mode · Add your Gemini API key for live responses');setShowKey(false)}}>Save for this session</button></div></div>}
  </div>
}
createRoot(document.getElementById('root')).render(<App />)
