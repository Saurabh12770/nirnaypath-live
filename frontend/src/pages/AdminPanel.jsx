import { useState, useEffect } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import api from '../services/api';
import { Shield, BarChart3, BookOpen, Users, FlaskConical, RefreshCcw, Trash2, Edit3, Plus, CheckCircle, X, Code, ChevronDown, ChevronRight, Save } from 'lucide-react';

function ReportCard({ label, value, icon: Icon, color }) {
  return (
    <div className="glass-card" style={{ padding:24, textAlign:'center', border: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ width:44, height:44, background:`rgba(${color},0.15)`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
        <Icon size={22} color={`rgb(${color})`} />
      </div>
      <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#f8fafc', fontFamily:'Outfit,sans-serif' }}>
        {typeof value === 'number' && String(value).includes('.') ? value.toFixed(1) : value}
      </div>
      <div style={{ color:'#94a3b8', fontSize:13, marginTop:4, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:100, background: type==='success'?'rgba(34,197,94,0.95)':'rgba(239,68,68,0.95)', color:'white', padding:'12px 20px', borderRadius:10, fontWeight:600, fontSize:14, display:'flex', alignItems:'center', gap:10, backdropFilter:'blur(10px)', boxShadow:'0 8px 24px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {type==='success'? <CheckCircle size={16}/> : <X size={16}/>} {msg}
    </div>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState('reports');
  const [report, setReport] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qPage, setQPage] = useState(1);
  const [qPages, setQPages] = useState(1);
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const emptyForm = { exam:'', subject:'', topic:'', subtopic:'', introduction:'', detailedExplanation:'', revisionNotes:'', importantFacts:[], tables:[], pyqs:[] };
  const [contentForm, setContentForm] = useState(emptyForm);
  const [cmsExamSyllabus, setCmsExamSyllabus] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);

  // Syllabus Editor State
  const [selectedSyllabusExam, setSelectedSyllabusExam] = useState('');
  const [syllabusJson, setSyllabusJson] = useState('');
  const [syllabusData, setSyllabusData] = useState(null);
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' or 'raw'
  const [expandedNodes, setExpandedNodes] = useState({});
  const [savingSyllabus, setSavingSyllabus] = useState(false);

  const showToast = (msg, type='success') => setToast({ msg, type });

  const toggleNode = (key) => {
    setExpandedNodes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (tab === 'reports') {
      api.get('/admin/reports').then(r => setReport(r.data.report)).catch(console.error);
    } else if (tab === 'questions') {
      api.get(`/admin/questions?page=${qPage}&limit=20`).then(r => { setQuestions(r.data.questions); setQPages(r.data.pages); }).catch(console.error);
    } else if (tab === 'users') {
      api.get('/admin/users').then(r => setUsers(r.data.users)).catch(console.error);
    }
  }, [tab, qPage]);

  // Load syllabus JSON on select change
  useEffect(() => {
    if (selectedSyllabusExam) {
      api.get(`/admin/syllabus/${selectedSyllabusExam.toLowerCase()}`)
        .then(res => {
          setSyllabusJson(JSON.stringify(res.data.syllabus, null, 2));
          setSyllabusData(res.data.syllabus);
        })
        .catch(err => {
          showToast('Failed to fetch syllabus.', 'error');
          setSyllabusJson('');
          setSyllabusData(null);
        });
    } else {
      setSyllabusJson('');
      setSyllabusData(null);
    }
  }, [selectedSyllabusExam]);

  const deleteQuestion = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      setQuestions(prev => prev.filter(q => q._id !== id));
      showToast('Question deleted successfully.');
    } catch { showToast('Failed to delete question.', 'error'); }
  };

  const toggleRole = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/role`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: res.data.user.role } : u));
      showToast('User role toggled.');
    } catch { showToast('Failed to update user role.', 'error'); }
  };

  // Load CMS exam syllabus when exam changes
  useEffect(() => {
    if (contentForm.exam) {
      api.get(`/admin/syllabus/${contentForm.exam.toLowerCase()}`)
        .then(res => setCmsExamSyllabus(res.data.syllabus))
        .catch(() => setCmsExamSyllabus(null));
      setContentForm(f => ({ ...f, subject:'', topic:'', subtopic:'' }));
    } else {
      setCmsExamSyllabus(null);
    }
  }, [contentForm.exam]);

  const cmsSubjects = cmsExamSyllabus?.subjects || [];
  const cmsTopics = cmsSubjects.find(s => s.name === contentForm.subject)?.topics || [];
  const cmsSubtopics = cmsTopics.find(t => t.name === contentForm.topic)?.subtopics || [];

  const loadExistingContent = async () => {
    if (!contentForm.exam || !contentForm.subject || !contentForm.topic || !contentForm.subtopic) {
      showToast('Select all four fields before loading.', 'error'); return;
    }
    setLoadingContent(true);
    try {
      const res = await api.get(`/admin/content/${encodeURIComponent(contentForm.exam)}/${encodeURIComponent(contentForm.subject)}/${encodeURIComponent(contentForm.topic)}/${encodeURIComponent(contentForm.subtopic)}`);
      const c = res.data.content;
      if (c) {
        setContentForm(f => ({
          ...f,
          introduction: c.introduction || '',
          detailedExplanation: c.detailedExplanation || '',
          revisionNotes: c.revisionNotes || '',
          importantFacts: c.importantFacts || [],
          tables: c.tables || [],
          pyqs: c.pyqs || []
        }));
        showToast('Existing content loaded for editing.');
      } else {
        showToast('No existing content found — start fresh.', 'error');
      }
    } catch { showToast('Failed to fetch existing content.', 'error'); }
    finally { setLoadingContent(false); }
  };

  const saveContent = async () => {
    if (!contentForm.exam || !contentForm.subtopic) { showToast('Exam and Subtopic fields are required.','error'); return; }
    setSaving(true);
    try {
      await api.post('/admin/content', contentForm);
      showToast('Learning content saved successfully!');
    } catch (e) { 
      showToast(e.response?.data?.message || 'Failed to save content.', 'error'); 
    } finally { 
      setSaving(false); 
    }
  };

  // Dynamic array helpers
  const addFact = () => setContentForm(f => ({ ...f, importantFacts: [...f.importantFacts, ''] }));
  const updateFact = (i, val) => setContentForm(f => { const a=[...f.importantFacts]; a[i]=val; return {...f, importantFacts:a}; });
  const removeFact = (i) => setContentForm(f => ({ ...f, importantFacts: f.importantFacts.filter((_,idx)=>idx!==i) }));

  const addTable = () => setContentForm(f => ({ ...f, tables: [...f.tables, { title:'', headers:['Column A','Column B'], rows:[['','']] }] }));
  const updateTableTitle = (ti, val) => setContentForm(f => { const t=[...f.tables]; t[ti]={...t[ti],title:val}; return {...f,tables:t}; });
  const addTableRow = (ti) => setContentForm(f => { const t=[...f.tables]; t[ti]={...t[ti],rows:[...t[ti].rows, t[ti].headers.map(()=>'')]}; return {...f,tables:t}; });
  const updateTableCell = (ti, ri, ci, val) => setContentForm(f => { const t=f.tables.map((tbl,tidx)=>tidx!==ti?tbl:{...tbl,rows:tbl.rows.map((r,ridx)=>ridx!==ri?r:r.map((c,cidx)=>cidx!==ci?c:val))}); return {...f,tables:t}; });
  const removeTable = (ti) => setContentForm(f => ({ ...f, tables: f.tables.filter((_,i)=>i!==ti) }));

  const addPYQ = () => setContentForm(f => ({ ...f, pyqs: [...f.pyqs, { year:'', question:{en:'',hi:''}, options:[{en:'',hi:''},{en:'',hi:''},{en:'',hi:''},{en:'',hi:''}], answer:0, explanation:{en:'',hi:''} }] }));
  const updatePYQ = (i, path, val) => setContentForm(f => {
    const pyqs=[...f.pyqs];
    const p=[...path];
    let obj=pyqs[i];
    while(p.length>1){const k=p.shift(); obj=obj[k];}
    obj[p[0]]=val;
    return {...f,pyqs};
  });
  const removePYQ = (i) => setContentForm(f => ({ ...f, pyqs: f.pyqs.filter((_,idx)=>idx!==i) }));

  const updateSyllabusTree = (newData) => {
    setSyllabusData(newData);
    setSyllabusJson(JSON.stringify(newData, null, 2));
  };

  const addSubject = () => {
    if (!syllabusData) return;
    const name = prompt('Enter Subject Name:');
    if (!name) return;
    const updated = {
      ...syllabusData,
      subjects: [...(syllabusData.subjects || []), { name, topics: [] }]
    };
    updateSyllabusTree(updated);
    showToast(`Subject "${name}" added.`);
  };

  const deleteSubject = (sIndex) => {
    if (!syllabusData) return;
    if (!confirm('Are you sure you want to delete this subject and all its topics?')) return;
    const updatedSubjects = [...syllabusData.subjects];
    const removed = updatedSubjects.splice(sIndex, 1);
    updateSyllabusTree({ ...syllabusData, subjects: updatedSubjects });
    showToast(`Subject "${removed[0].name}" removed.`);
  };

  const renameSubject = (sIndex, newName) => {
    if (!syllabusData || !newName) return;
    const updatedSubjects = [...syllabusData.subjects];
    updatedSubjects[sIndex].name = newName;
    updateSyllabusTree({ ...syllabusData, subjects: updatedSubjects });
  };

  const addTopic = (sIndex) => {
    if (!syllabusData) return;
    const name = prompt('Enter Topic Name:');
    if (!name) return;
    const updatedSubjects = [...syllabusData.subjects];
    updatedSubjects[sIndex].topics = [...(updatedSubjects[sIndex].topics || []), { name, subtopics: [] }];
    updateSyllabusTree({ ...syllabusData, subjects: updatedSubjects });
    showToast(`Topic "${name}" added.`);
  };

  const deleteTopic = (sIndex, tIndex) => {
    if (!syllabusData) return;
    if (!confirm('Are you sure you want to delete this topic?')) return;
    const updatedSubjects = [...syllabusData.subjects];
    const removed = updatedSubjects[sIndex].topics.splice(tIndex, 1);
    updateSyllabusTree({ ...syllabusData, subjects: updatedSubjects });
    showToast(`Topic "${removed[0].name}" removed.`);
  };

  const renameTopic = (sIndex, tIndex, newName) => {
    if (!syllabusData || !newName) return;
    const updatedSubjects = [...syllabusData.subjects];
    updatedSubjects[sIndex].topics[tIndex].name = newName;
    updateSyllabusTree({ ...syllabusData, subjects: updatedSubjects });
  };

  const addSubtopic = (sIndex, tIndex) => {
    if (!syllabusData) return;
    const name = prompt('Enter Subtopic Name:');
    if (!name) return;
    const updatedSubjects = [...syllabusData.subjects];
    updatedSubjects[sIndex].topics[tIndex].subtopics = [...(updatedSubjects[sIndex].topics[tIndex].subtopics || []), name];
    updateSyllabusTree({ ...syllabusData, subjects: updatedSubjects });
    showToast(`Subtopic "${name}" added.`);
  };

  const deleteSubtopic = (sIndex, tIndex, subIndex) => {
    if (!syllabusData) return;
    const updatedSubjects = [...syllabusData.subjects];
    const removed = updatedSubjects[sIndex].topics[tIndex].subtopics.splice(subIndex, 1);
    updateSyllabusTree({ ...syllabusData, subjects: updatedSubjects });
    showToast(`Subtopic "${removed[0]}" removed.`);
  };

  const renameSubtopic = (sIndex, tIndex, subIndex, newName) => {
    if (!syllabusData || !newName) return;
    const updatedSubjects = [...syllabusData.subjects];
    updatedSubjects[sIndex].topics[tIndex].subtopics[subIndex] = newName;
    updateSyllabusTree({ ...syllabusData, subjects: updatedSubjects });
  };

  const saveSyllabus = async () => {
    if (!selectedSyllabusExam) { showToast('Please select an exam first.', 'error'); return; }
    
    let parsed;
    try {
      parsed = JSON.parse(syllabusJson);
    } catch (err) {
      showToast('Invalid JSON syntax. Please format check.', 'error');
      return;
    }

    if (!parsed.exam || !parsed.subjects || !Array.isArray(parsed.subjects)) {
      showToast('Structure mismatch. Must contain "exam" string and "subjects" array.', 'error');
      return;
    }

    setSavingSyllabus(true);
    try {
      await api.put(`/admin/syllabus/${selectedSyllabusExam.toLowerCase()}`, parsed);
      showToast('Syllabus updated and stored successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to store syllabus.', 'error');
    } finally {
      setSavingSyllabus(false);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(syllabusJson);
      setSyllabusJson(JSON.stringify(parsed, null, 2));
      showToast('Formatted successfully.');
    } catch (err) {
      showToast('JSON validation failed. Check syntax.', 'error');
    }
  };

  const TABS = [
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'questions', label: 'Questions', icon: FlaskConical },
    { id: 'content', label: 'Study Content', icon: BookOpen },
    { id: 'syllabus', label: 'Syllabus Editor', icon: Code },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const EXAM_OPTIONS = [
    { id: 'UPSC', label: 'UPSC Civil Services' },
    { id: 'BPSC', label: 'BPSC Civil Services' },
    { id: 'SSC-CGL', label: 'SSC CGL' },
    { id: 'SSC-CHSL', label: 'SSC CHSL' },
    { id: 'Railway', label: 'Railway RRB' },
    { id: 'Banking', label: 'Banking Exams' },
    { id: 'State-PCS', label: 'State PCS' },
  ];

  const inputStyle = { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', color:'#e2e8f0', padding:'10px 14px', borderRadius:8, width:'100%', outline:'none', fontFamily:'Outfit,sans-serif', fontSize:14, marginBottom:12 };
  const taStyle = { ...inputStyle, minHeight:110, resize:'vertical' };

  return (
    <AppLayout>
      <div style={{ padding:'28px 24px', maxWidth:1100, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
          <div style={{ width:44, height:44, background:'linear-gradient(135deg,#6366f1,#a855f7)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}>
            <Shield size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize:'1.6rem', fontWeight:800, color:'#f8fafc', fontFamily:'Outfit,sans-serif' }}>Admin Panel</h1>
            <p style={{ color:'#64748b', fontSize:13 }}>Administrative override for system syllabus JSONs and study modules</p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:4, borderBottom:'1px solid rgba(255,255,255,0.05)', marginBottom:28, overflowX:'auto' }}>
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} id={`admin-tab-${t.id}`} onClick={() => setTab(t.id)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'12px 18px', background:'none', border:'none', cursor:'pointer', fontSize:13.5, fontWeight:tab===t.id?700:500,
                  color: tab===t.id?'#818cf8':'#64748b', borderBottom:tab===t.id?'2px solid #6366f1':'2px solid transparent', marginBottom:-1, transition:'all 0.2s', whiteSpace:'nowrap' }}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Reports Tab */}
        {tab === 'reports' && report && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:20, marginBottom:24 }}>
              <ReportCard label="Active Accounts" value={report.totalUsers} icon={Users} color="99,102,241" />
              <ReportCard label="Questions Database" value={report.totalQuestions} icon={FlaskConical} color="249,115,22" />
              <ReportCard label="Mock Sessions taken" value={report.totalAttempts} icon={BarChart3} color="20,184,166" />
              <ReportCard label="Study Notes Modules" value={report.totalContent} icon={BookOpen} color="34,197,94" />
              <ReportCard label="Avg Global Score" value={report.globalAccuracy} icon={BarChart3} color="168,85,247" />
            </div>
            <div className="glass-card" style={{ padding:20, border: '1px solid rgba(255,255,255,0.03)' }}>
              <p style={{ color:'#94a3b8', fontSize:13.5, lineHeight: 1.6 }}>
                📊 <strong style={{ color:'#818cf8' }}>NirnayPath Engine v3.0</strong> is online. The relational indices for <code style={{ color: '#ffffff' }}>questions</code> and <code style={{ color: '#ffffff' }}>learningcontents</code> are active, resolving full mock tests and progress markers in sub-second timelines.
              </p>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {tab === 'questions' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <span style={{ color:'#94a3b8', fontSize:13, fontWeight: 500 }}>Showing Page {qPage} of {qPages}</span>
              <div style={{ display:'flex', gap:8 }}>
                <button id="q-prev" className="btn-secondary" style={{ padding:'7px 14px', fontSize:13 }} disabled={qPage<=1} onClick={() => setQPage(p => Math.max(1, p-1))}>← Prev</button>
                <button id="q-next" className="btn-secondary" style={{ padding:'7px 14px', fontSize:13 }} disabled={qPage>=qPages} onClick={() => setQPage(p => Math.min(qPages, p+1))}>Next →</button>
              </div>
            </div>
            <div style={{ overflowX:'auto', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 12 }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Exam Track','Subject Area','Topic Scope','Question snippet (EN)','Difficulty','System Override'].map(h => (
                      <th key={h} style={{ background:'rgba(99,102,241,0.08)', color:'#818cf8', padding:'14px 16px', textAlign:'left', fontSize:12, fontWeight: 700, letterSpacing: '0.03em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questions.map(q => (
                    <tr key={q._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding:'14px 16px', color:'#818cf8', fontSize:12.5, fontWeight:600 }}>{q.exam}</td>
                      <td style={{ padding:'14px 16px', color:'#cbd5e1', fontSize:12.5 }}>{q.subject}</td>
                      <td style={{ padding:'14px 16px', color:'#94a3b8', fontSize:12.5 }}>{q.topic}</td>
                      <td style={{ padding:'14px 16px', color:'#e2e8f0', fontSize:12.5, maxWidth:260 }}>
                        <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{q.question?.en}</div>
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        <span className={`badge badge-${q.difficulty}`} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{q.difficulty}</span>
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        <button id={`del-q-${q._id.slice(-6)}`} onClick={() => deleteQuestion(q._id)}
                          style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'6px 12px', color:'#f87171', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:4, fontWeight: 600 }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Study Content Editor Tab */}
        {tab === 'content' && (
          <div style={{ maxWidth:860 }}>
            <div className="glass-card" style={{ padding:28, border: '1px solid rgba(255,255,255,0.03)', marginBottom: 20 }}>
              <h3 style={{ color:'#f8fafc', fontWeight:800, marginBottom:20, display:'flex', alignItems:'center', gap:8, fontSize: 16, fontFamily: 'Outfit, sans-serif' }}>
                <Plus size={18} color="#818cf8" /> Content Management System
              </h3>

              {/* Row 1: Exam Selector */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display:'block', color:'#94a3b8', fontSize:11, fontWeight:600, marginBottom:6, letterSpacing:'0.05em', textTransform:'uppercase' }}>EXAM TRACK</label>
                <select id="content-exam" style={{ ...inputStyle, marginBottom:0 }} value={contentForm.exam}
                  onChange={e => setContentForm(f => ({ ...f, exam: e.target.value, subject:'', topic:'', subtopic:'' }))}>
                  <option value="">-- Select Exam --</option>
                  {EXAM_OPTIONS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                </select>
              </div>

              {/* Row 2: Subject / Topic (Cascading) */}
              {contentForm.exam && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
                  <div>
                    <label style={{ display:'block', color:'#94a3b8', fontSize:11, fontWeight:600, marginBottom:6, letterSpacing:'0.05em', textTransform:'uppercase' }}>SUBJECT</label>
                    <select id="content-subject" style={{ ...inputStyle, marginBottom:0 }} value={contentForm.subject}
                      onChange={e => setContentForm(f => ({ ...f, subject: e.target.value, topic:'', subtopic:'' }))}>
                      <option value="">-- Select Subject --</option>
                      {cmsSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', color:'#94a3b8', fontSize:11, fontWeight:600, marginBottom:6, letterSpacing:'0.05em', textTransform:'uppercase' }}>TOPIC</label>
                    <select id="content-topic" style={{ ...inputStyle, marginBottom:0 }} value={contentForm.topic}
                      onChange={e => setContentForm(f => ({ ...f, topic: e.target.value, subtopic:'' }))}>
                      <option value="">-- Select Topic --</option>
                      {cmsTopics.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Row 3: Subtopic + Load */}
              {contentForm.topic && (
                <div style={{ display:'flex', gap:14, marginBottom:20, alignItems:'flex-end' }}>
                  <div style={{ flex:1 }}>
                    <label style={{ display:'block', color:'#94a3b8', fontSize:11, fontWeight:600, marginBottom:6, letterSpacing:'0.05em', textTransform:'uppercase' }}>SUBTOPIC</label>
                    <select id="content-subtopic" style={{ ...inputStyle, marginBottom:0 }} value={contentForm.subtopic}
                      onChange={e => setContentForm(f => ({ ...f, subtopic: e.target.value }))}>
                      <option value="">-- Select Subtopic --</option>
                      {cmsSubtopics.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>
                  <button id="btn-load-content" className="btn-secondary" onClick={loadExistingContent} disabled={loadingContent}
                    style={{ padding:'10px 18px', fontSize:13, fontWeight:600, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6 }}>
                    <Edit3 size={14} /> {loadingContent ? 'Loading...' : 'Load Existing'}
                  </button>
                </div>
              )}

              {/* Divider */}
              {contentForm.subtopic && <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', marginBottom:20 }} />}

              {/* Text Fields */}
              {[['introduction','Introduction Summary (1-2 paragraphs)'],['detailedExplanation','Detailed Explanation (Markdown supported: ## ## ### **bold**)'],['revisionNotes','Quick Revision Notes (bullet points)']].map(([field, label]) => (
                <div key={field}>
                  <label style={{ display:'block', color:'#94a3b8', fontSize:11, fontWeight:600, marginBottom:4, letterSpacing:'0.05em', textTransform:'uppercase' }}>{label}</label>
                  <textarea id={`content-${field}`} style={taStyle} placeholder={label} value={contentForm[field]}
                    onChange={e => setContentForm(f => ({ ...f, [field]: e.target.value }))} />
                </div>
              ))}

              {/* ─── Important Facts Array ─── */}
              <div style={{ marginBottom:20, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <label style={{ color:'#94a3b8', fontSize:11, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>IMPORTANT FACTS ({contentForm.importantFacts.length})</label>
                  <button id="btn-add-fact" className="btn-secondary" onClick={addFact} style={{ padding:'4px 10px', fontSize:11, display:'flex', alignItems:'center', gap:4 }}>
                    <Plus size={12}/> Add Fact
                  </button>
                </div>
                {contentForm.importantFacts.map((fact, i) => (
                  <div key={i} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'flex-start' }}>
                    <div style={{ color:'#818cf8', fontSize:12, fontWeight:800, paddingTop:10, minWidth:20 }}>{i+1}</div>
                    <textarea value={fact} onChange={e => updateFact(i, e.target.value)}
                      style={{ ...taStyle, minHeight:56, flex:1, marginBottom:0 }} placeholder={`Fact ${i+1}...`} />
                    <button onClick={() => removeFact(i)} style={{ marginTop:6, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:6, padding:'6px 8px', color:'#f87171', cursor:'pointer', display:'flex', alignItems:'center' }}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                ))}
                {contentForm.importantFacts.length === 0 && <p style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No facts added. Click "Add Fact" to begin.</p>}
              </div>

              {/* ─── Tables Array ─── */}
              <div style={{ marginBottom:20, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <label style={{ color:'#94a3b8', fontSize:11, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>SUMMARY TABLES ({contentForm.tables.length})</label>
                  <button id="btn-add-table" className="btn-secondary" onClick={addTable} style={{ padding:'4px 10px', fontSize:11, display:'flex', alignItems:'center', gap:4 }}>
                    <Plus size={12}/> Add Table
                  </button>
                </div>
                {contentForm.tables.map((table, ti) => (
                  <div key={ti} style={{ background:'rgba(255,255,255,0.01)', border:'1px solid rgba(255,255,255,0.04)', borderRadius:10, padding:16, marginBottom:14 }}>
                    <div style={{ display:'flex', gap:10, marginBottom:10, alignItems:'center' }}>
                      <input value={table.title} onChange={e => updateTableTitle(ti, e.target.value)}
                        style={{ ...inputStyle, marginBottom:0, flex:1 }} placeholder="Table Title" />
                      <button onClick={() => removeTable(ti)} style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:6, padding:'8px', color:'#f87171', cursor:'pointer', display:'flex', alignItems:'center' }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                    <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
                        <thead><tr>{table.headers.map((h, hi) => (
                          <th key={hi} style={{ border:'1px solid rgba(255,255,255,0.06)', padding:'8px 10px', background:'rgba(99,102,241,0.08)', color:'#818cf8', fontWeight:700, minWidth:120 }}>{h}</th>
                        ))}</tr></thead>
                        <tbody>{table.rows.map((row, ri) => (
                          <tr key={ri}>{row.map((cell, ci) => (
                            <td key={ci} style={{ border:'1px solid rgba(255,255,255,0.04)', padding:4 }}>
                              <input value={cell} onChange={e => updateTableCell(ti, ri, ci, e.target.value)}
                                style={{ ...inputStyle, marginBottom:0, fontSize:12 }} />
                            </td>
                          ))}</tr>
                        ))}</tbody>
                      </table>
                    </div>
                    <button onClick={() => addTableRow(ti)} className="btn-secondary" style={{ marginTop:8, padding:'4px 10px', fontSize:11, display:'flex', alignItems:'center', gap:4 }}>
                      <Plus size={11}/> Add Row
                    </button>
                  </div>
                ))}
                {contentForm.tables.length === 0 && <p style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No tables added. Click "Add Table".</p>}
              </div>

              {/* ─── PYQ Array ─── */}
              <div style={{ marginBottom:20, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <label style={{ color:'#94a3b8', fontSize:11, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>PREVIOUS YEAR QUESTIONS ({contentForm.pyqs.length})</label>
                  <button id="btn-add-pyq" className="btn-secondary" onClick={addPYQ} style={{ padding:'4px 10px', fontSize:11, display:'flex', alignItems:'center', gap:4 }}>
                    <Plus size={12}/> Add PYQ
                  </button>
                </div>
                {contentForm.pyqs.map((q, qi) => (
                  <div key={qi} style={{ background:'rgba(255,255,255,0.01)', border:'1px solid rgba(255,255,255,0.04)', borderRadius:10, padding:16, marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <span style={{ color:'#818cf8', fontWeight:700, fontSize:13 }}>PYQ #{qi+1}</span>
                      <button onClick={() => removePYQ(qi)} style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:6, padding:'5px 8px', color:'#f87171', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:11 }}>
                        <Trash2 size={11}/> Remove
                      </button>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <div>
                        <label style={{ color:'#64748b', fontSize:10, fontWeight:600 }}>Year</label>
                        <input value={q.year} onChange={e => updatePYQ(qi,['year'],e.target.value)} style={{ ...inputStyle, marginBottom:0 }} placeholder="2022" />
                      </div>
                      <div>
                        <label style={{ color:'#64748b', fontSize:10, fontWeight:600 }}>Correct Option (0–3)</label>
                        <select value={q.answer} onChange={e => updatePYQ(qi,['answer'],parseInt(e.target.value))} style={{ ...inputStyle, marginBottom:0 }}>
                          {[0,1,2,3].map(n => <option key={n} value={n}>Option {String.fromCharCode(65+n)}</option>)}
                        </select>
                      </div>
                    </div>
                    <label style={{ color:'#64748b', fontSize:10, fontWeight:600, marginTop:8, display:'block' }}>Question (English)</label>
                    <textarea value={q.question.en} onChange={e => updatePYQ(qi,['question','en'],e.target.value)}
                      style={{ ...taStyle, minHeight:56, marginBottom:8 }} placeholder="Question in English" />
                    <label style={{ color:'#64748b', fontSize:10, fontWeight:600 }}>Question (Hindi)</label>
                    <textarea value={q.question.hi} onChange={e => updatePYQ(qi,['question','hi'],e.target.value)}
                      style={{ ...taStyle, minHeight:40, marginBottom:8 }} placeholder="प्रश्न हिंदी में" />
                    {q.options.map((opt, oi) => (
                      <div key={oi} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:6 }}>
                        <input value={opt.en} onChange={e => updatePYQ(qi,['options',oi,'en'],e.target.value)} style={{ ...inputStyle, marginBottom:0 }} placeholder={`Option ${String.fromCharCode(65+oi)} (EN)`} />
                        <input value={opt.hi} onChange={e => updatePYQ(qi,['options',oi,'hi'],e.target.value)} style={{ ...inputStyle, marginBottom:0 }} placeholder={`विकल्प ${String.fromCharCode(65+oi)} (HI)`} />
                      </div>
                    ))}
                    <label style={{ color:'#64748b', fontSize:10, fontWeight:600, marginTop:6, display:'block' }}>Explanation (English)</label>
                    <textarea value={q.explanation.en} onChange={e => updatePYQ(qi,['explanation','en'],e.target.value)}
                      style={{ ...taStyle, minHeight:56 }} placeholder="Explanation in English" />
                  </div>
                ))}
                {contentForm.pyqs.length === 0 && <p style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No PYQs added. Click "Add PYQ".</p>}
              </div>

              <div style={{ display:'flex', gap:12, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <button id="btn-save-content" className="btn-primary" onClick={saveContent} disabled={saving}
                  style={{ padding:'12px 28px', fontWeight: 700, opacity:saving?0.7:1, display:'flex', alignItems:'center', gap:8 }}>
                  <Save size={16}/> {saving ? 'Writing Database...' : 'Save Learning Module'}
                </button>
                <button className="btn-secondary" onClick={() => setContentForm(emptyForm)}
                  style={{ padding:'12px 20px', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                  <X size={14}/> Clear Form
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Syllabus JSON Editor Tab */}
        {tab === 'syllabus' && (
          <div style={{ maxWidth: 850 }}>
            <div className="glass-card" style={{ padding:28, border: '1px solid rgba(255,255,255,0.03)' }}>
              <h3 style={{ color:'#f8fafc', fontWeight:800, marginBottom:20, display:'flex', alignItems:'center', gap:8, fontSize: 16, fontFamily: 'Outfit, sans-serif' }}>
                <Code size={18} color="#818cf8" /> Syllabus Structure Editor
              </h3>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display:'block', color:'#94a3b8', fontSize:11, fontWeight:600, marginBottom:6, letterSpacing:'0.05em' }}>SELECT EXAM TRACK</label>
                <select id="sel-syllabus-exam" style={{ ...inputStyle, maxWidth: 300 }} value={selectedSyllabusExam} onChange={e => setSelectedSyllabusExam(e.target.value)}>
                  <option value="">-- Choose Syllabus File --</option>
                  {EXAM_OPTIONS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                </select>
              </div>

              {selectedSyllabusExam ? (
                <div>
                  {/* Mode Toggle Bar */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16 }}>
                    <button className={editorMode === 'visual' ? 'btn-primary' : 'btn-secondary'}
                      onClick={() => setEditorMode('visual')} style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Code size={14} /> Visual Tree Editor
                    </button>
                    <button className={editorMode === 'raw' ? 'btn-primary' : 'btn-secondary'}
                      onClick={() => setEditorMode('raw')} style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Code size={14} /> Raw JSON Editor
                    </button>
                  </div>

                  {editorMode === 'raw' ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <label style={{ color:'#94a3b8', fontSize:11, fontWeight:600, letterSpacing:'0.05em' }}>RAW SYLLABUS JSON</label>
                        <button onClick={formatJson} className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                          Format JSON
                        </button>
                      </div>
                      <textarea
                        id="syllabus-json-textarea"
                        value={syllabusJson}
                        onChange={e => setSyllabusJson(e.target.value)}
                        style={{ ...taStyle, minHeight: 320, fontFamily: 'monospace', fontSize: 13, background: '#070a13', color: '#818cf8', border: '1px solid rgba(255,255,255,0.05)' }}
                      />
                    </div>
                  ) : (
                    <div>
                      {/* Visual Tree Builder */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <label style={{ color:'#94a3b8', fontSize:11, fontWeight:600, letterSpacing:'0.05em' }}>VISUAL SYLLABUS HIERARCHY</label>
                        <button onClick={addSubject} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, borderColor: 'rgba(99,102,241,0.4)', color: '#818cf8' }}>
                          <Plus size={14} /> Add Subject
                        </button>
                      </div>

                      {syllabusData && syllabusData.subjects && syllabusData.subjects.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                          {syllabusData.subjects.map((subj, sIdx) => {
                            const isSubjExpanded = expandedNodes[`subj-${sIdx}`];
                            return (
                              <div key={sIdx} className="glass-card" style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)', borderRadius: '10px' }}>
                                {/* Subject Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: '250px' }}>
                                    <button onClick={() => toggleNode(`subj-${sIdx}`)} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                                      {isSubjExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                    <input
                                      value={subj.name}
                                      onChange={e => renameSubject(sIdx, e.target.value)}
                                      placeholder="Subject Name"
                                      style={{ ...inputStyle, marginBottom: 0, fontWeight: 700, fontSize: 15, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '2px 4px', width: '90%' }}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => addTopic(sIdx)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Plus size={12} /> Add Topic
                                    </button>
                                    <button onClick={() => deleteSubject(sIdx)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>
                                      <Trash2 size={12} /> Delete
                                    </button>
                                  </div>
                                </div>

                                {/* Topics Level */}
                                {isSubjExpanded && (
                                  <div style={{ paddingLeft: '18px', borderLeft: '1px dashed rgba(255,255,255,0.08)', marginTop: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {subj.topics && subj.topics.length > 0 ? (
                                      subj.topics.map((topic, tIdx) => {
                                        const isTopicExpanded = expandedNodes[`topic-${sIdx}-${tIdx}`];
                                        return (
                                          <div key={tIdx} style={{ background: 'rgba(255,255,255,0.01)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                                            {/* Topic Header */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: '200px' }}>
                                                <button onClick={() => toggleNode(`topic-${sIdx}-${tIdx}`)} style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                                                  {isTopicExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                </button>
                                                <input
                                                  value={topic.name}
                                                  onChange={e => renameTopic(sIdx, tIdx, e.target.value)}
                                                  placeholder="Topic Name"
                                                  style={{ ...inputStyle, marginBottom: 0, fontWeight: 600, fontSize: 13.5, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '2px 4px', width: '90%' }}
                                                />
                                              </div>
                                              <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => addSubtopic(sIdx, tIdx)} className="btn-secondary" style={{ padding: '3px 6px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                  <Plus size={10} /> Add Subtopic
                                                </button>
                                                <button onClick={() => deleteTopic(sIdx, tIdx)} className="btn-secondary" style={{ padding: '3px 6px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 2, color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>
                                                  <Trash2 size={10} /> Delete
                                                </button>
                                              </div>
                                            </div>

                                            {/* Subtopics Level */}
                                            {isTopicExpanded && (
                                              <div style={{ paddingLeft: '18px', borderLeft: '1px dashed rgba(255,255,255,0.08)', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                {topic.subtopics && topic.subtopics.length > 0 ? (
                                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                    {topic.subtopics.map((sub, subIdx) => (
                                                      <div key={subIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <input
                                                          value={sub}
                                                          onChange={e => renameSubtopic(sIdx, tIdx, subIdx, e.target.value)}
                                                          placeholder="Subtopic Name"
                                                          style={{ ...inputStyle, marginBottom: 0, fontSize: 13, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '6px 10px', flex: 1 }}
                                                        />
                                                        <button onClick={() => deleteSubtopic(sIdx, tIdx, subIdx)} className="btn-secondary" style={{ padding: '6px', display: 'flex', alignItems: 'center', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>
                                                          <Trash2 size={13} />
                                                        </button>
                                                      </div>
                                                    ))}
                                                  </div>
                                                ) : (
                                                  <span style={{ color: '#64748b', fontSize: 12, fontStyle: 'italic' }}>No subtopics added yet. Click "Add Subtopic".</span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <span style={{ color: '#64748b', fontSize: 12, fontStyle: 'italic' }}>No topics added yet. Click "Add Topic".</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                          No subjects defined for this syllabus yet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save Button */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                    <button id="btn-save-syllabus" className="btn-primary" onClick={saveSyllabus} disabled={savingSyllabus} style={{ padding: '12px 28px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Save size={16} /> {savingSyllabus ? 'Writing to Disk...' : 'Save Syllabus Configuration'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
                  <Code size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p>Choose an exam track to load and edit its syllabus JSON file.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div style={{ border: '1px solid rgba(255,255,255,0.03)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Registered Name','Email Address','Privilege Class','Account Age','System Override'].map(h => (
                    <th key={h} style={{ background:'rgba(99,102,241,0.08)', color:'#818cf8', padding:'14px 16px', textAlign:'left', fontSize:12, fontWeight: 700, letterSpacing: '0.03em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding:'14px 16px', color:'#f8fafc', fontSize:13, fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding:'14px 16px', color:'#94a3b8', fontSize:13 }}>{u.email}</td>
                    <td style={{ padding:'14px 16px' }}>
                      <span style={{ background:u.role==='admin'?'rgba(249,115,22,0.12)':'rgba(99,102,241,0.12)', color:u.role==='admin'?'#f97316':'#818cf8', border:`1px solid ${u.role==='admin'?'rgba(249,115,22,0.2)':'rgba(99,102,241,0.2)'}`, borderRadius:6, padding:'4px 10px', fontSize:11.5, fontWeight:700, textTransform: 'uppercase' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding:'14px 16px', color:'#64748b', fontSize:12.5 }}>{new Date(u.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}</td>
                    <td style={{ padding:'14px 16px' }}>
                      <button id={`toggle-role-${u._id.slice(-6)}`} onClick={() => toggleRole(u._id)}
                        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'6px 12px', color:'#a5b4fc', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:6, fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                        <RefreshCcw size={12} /> Change Privilege
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  );
}
