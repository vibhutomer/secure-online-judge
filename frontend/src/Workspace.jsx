import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Editor } from '@monaco-editor/react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

export default function Workspace() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState("#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}");
    const [verdict, setVerdict] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [theme, setTheme] = useState('vs-dark');

    const [failCount, setFailCount] = useState(0);
    const [aiHint, setAiHint] = useState(null);
    const [isHintLoading, setIsHintLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('description'); 
    const [history, setHistory] = useState([]);

    const [language, setLanguage] = useState('cpp');
    
    const boilerplates = {
        cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    \n    return 0;\n}",
        c: "#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    \n    return 0;\n}",
        java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your Java code here\n        \n    }\n}",
        python: "def solve():\n    # Write your Python code here\n    pass\n\nif __name__ == '__main__':\n    solve()"
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        setCode(boilerplates[newLang]); 
    };

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await axios.get('/api/problems');
                const currentProblem = res.data.problems.find(p => p._id === id);
                setProblem(currentProblem);
            } catch (error) {
                console.error("Error fetching problem:", error);
            }
        };
        fetchProblem();
    }, [id]);

    const submitCode = async () => {
        setIsSubmitting(true);
        setVerdict(null);
        setAiHint(null); 
        
        try {
            const token = localStorage.getItem('token');
            
            const res = await axios.post('/api/submit', {
                language: language,
                problemId: id,
                code: code
            }, {
                headers: { Authorization: `Bearer ${token}` } 
            });
            
            setVerdict(res.data);

            if (res.data.success) {
                setFailCount(0); 
                toast.success("Accepted! Excellent work.");
            } else if (res.data.verdict === "Wrong Answer") {
                setFailCount(prev => prev + 1); 
                toast.error("Wrong Answer. Check your logic!");
            }

        } catch (error) {
            if (error.response?.status === 401) {
                setVerdict({ success: false, verdict: "Authentication Error", error: "You must be logged in to submit code." });
                toast.error("You must be logged in to submit.");
            } else {
                setVerdict(error.response?.data || { success: false, error: "Server Error" });
                toast.error("Compilation or Server Error");
            }
        }
        setIsSubmitting(false);
    };

    const requestHint = async () => {
        setIsHintLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.post('/api/submit/hint', {
                problemId: id,
                userCode: code,
                failedTestCase: {
                    input: verdict.input, 
                    expectedOutput: verdict.expected,
                    actualOutput: verdict.received
                }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setAiHint(response.data.hint);
        } catch (error) {
            console.error("Failed to fetch hint", error);
            setAiHint("I'm having trouble connecting to the AI right now. Are you logged in?");
        } finally {
            setIsHintLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return; 

            const res = await axios.get(`/api/submit/history/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data.submissions);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    useEffect(() => {
        if (activeTab === 'submissions') {
            fetchHistory();
        }
    }, [activeTab, verdict]);

    if (!problem) return (
        <SkeletonTheme baseColor="#1e1e1e" highlightColor="#333">
            <div style={{ display: 'flex', height: '100vh', background: '#121212', padding: '20px' }}>
                {/* Left Side Skeleton */}
                <div style={{ flex: 1, paddingRight: '20px' }}>
                    <Skeleton height={40} width={250} style={{ marginBottom: '20px' }} />
                    <Skeleton count={1} height={30} width={80} style={{ marginBottom: '30px' }} />
                    <Skeleton count={8} style={{ marginBottom: '10px' }} />
                    <Skeleton height={100} style={{ marginTop: '20px' }} />
                </div>
                {/* Right Side Skeleton */}
                <div style={{ flex: 1, borderLeft: '1px solid #333', paddingLeft: '20px' }}>
                    <Skeleton height={50} style={{ marginBottom: '20px' }} />
                    <Skeleton height={400} />
                </div>
            </div>
        </SkeletonTheme>
    );

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'sans-serif' }}>
            
            {/* ---------------- LEFT SIDE: TABS & CONTENT ---------------- */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #333', background: '#1e1e1e' }}>
                
                {/* Top Nav & Tabs */}
                <div style={{ padding: '20px 30px 0 30px', borderBottom: '1px solid #333' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', marginBottom: '15px', padding: 0 }}>
                        ← Back to Dashboard
                    </button>
                    
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button 
                            onClick={() => setActiveTab('description')}
                            style={{ background: 'none', border: 'none', color: activeTab === 'description' ? '#fff' : '#888', paddingBottom: '10px', borderBottom: activeTab === 'description' ? '2px solid #4facfe' : '2px solid transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                        >
                            Description
                        </button>
                        <button 
                            onClick={() => setActiveTab('submissions')}
                            style={{ background: 'none', border: 'none', color: activeTab === 'submissions' ? '#fff' : '#888', paddingBottom: '10px', borderBottom: activeTab === 'submissions' ? '2px solid #4facfe' : '2px solid transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                        >
                            Submissions
                        </button>
                    </div>
                </div>

                {/* Tab Content Area */}
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                    
                    {/* --- TAB 1: DESCRIPTION --- */}
                    {activeTab === 'description' && (
                        <>
                            <h1 style={{ color: '#fff', fontSize: '32px', marginTop: 0, marginBottom: '10px' }}>{problem.title}</h1>
                            <span style={{ background: problem.difficulty === 'Easy' ? '#1e4620' : problem.difficulty === 'Medium' ? '#5c430a' : '#5c1a1a', color: problem.difficulty === 'Easy' ? '#4caf50' : problem.difficulty === 'Medium' ? '#ff9800' : '#f44336', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                                {problem.difficulty}
                            </span>
                            
                            <div style={{ marginTop: '20px', lineHeight: '1.7', fontSize: '16px', color: '#e1e4e8' }}>
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({node, inline, className, children, ...props}) {
                                            return (
                                                <code 
                                                    style={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        fontFamily: 'monospace',
                                                        color: '#4facfe'
                                                    }} 
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            )
                                        },
                                        pre({node, children, ...props}) {
                                            return (
                                                <pre style={{
                                                    backgroundColor: '#1e1e1e',
                                                    padding: '15px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #333',
                                                    overflowX: 'auto',
                                                    marginTop: '15px',
                                                    marginBottom: '15px'
                                                }} {...props}>
                                                    {children}
                                                </pre>
                                            )
                                        }
                                    }}
                                >
                                    {problem.description}
                                </ReactMarkdown>
                            </div>

                            {/* Examples */}
                            {problem.examples && problem.examples.length > 0 && (
                                <div style={{ marginTop: '40px' }}>
                                    <h3 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Examples</h3>
                                    {problem.examples.map((ex, index) => (
                                        <div key={index} style={{ marginBottom: '25px' }}>
                                            <strong style={{ color: '#fff', fontSize: '16px' }}>Example {index + 1}:</strong>
                                            <div style={{ marginTop: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #4facfe', fontFamily: 'monospace', lineHeight: '1.6' }}>
                                                <div style={{ color: '#d4d4d4' }}><strong style={{ color: '#fff' }}>Input:</strong> {ex.input}</div>
                                                <div style={{ color: '#d4d4d4' }}><strong style={{ color: '#fff' }}>Output:</strong> {ex.output}</div>
                                                {ex.explanation && (
                                                    <div style={{ color: '#d4d4d4', marginTop: '8px' }}><strong style={{ color: '#fff' }}>Explanation:</strong> {ex.explanation}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* --- TAB 2: SUBMISSIONS --- */}
                    {activeTab === 'submissions' && (
                        <div>
                            <h2 style={{ color: '#fff', marginTop: 0 }}>Your Submissions</h2>
                            {history.length === 0 ? (
                                <p style={{ color: '#888' }}>You haven't submitted any code for this problem yet.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #444', textAlign: 'left', color: '#aaa' }}>
                                            <th style={{ padding: '12px 0' }}>Status</th>
                                            <th style={{ padding: '12px 0' }}>Language</th>
                                            <th style={{ padding: '12px 0' }}>Time Submitted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((sub, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                                                <td style={{ padding: '15px 0', fontWeight: 'bold', color: sub.verdict === 'Accepted' ? '#4caf50' : '#f44336' }}>
                                                    {sub.verdict}
                                                </td>
                                                <td style={{ padding: '15px 0', color: '#ddd' }}>{sub.language}</td>
                                                <td style={{ padding: '15px 0', color: '#888', fontSize: '14px' }}>
                                                    {new Date(sub.createdAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ---------------- RIGHT SIDE: EDITOR & OUTPUT ---------------- */}
            {/* 🎨 UPDATED: Uses `theme` state for background colors */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: theme === 'vs-dark' ? '#1e1e1e' : '#fff' }}>
                
                {/* EDITOR TOOLBAR & LANGUAGE SELECTOR */}
                <div style={{ padding: '10px 20px', backgroundColor: theme === 'vs-dark' ? '#2d2d2d' : '#f3f3f3', borderBottom: theme === 'vs-dark' ? '1px solid #1e1e1e' : '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: theme === 'vs-dark' ? '#fff' : '#333', fontSize: '14px', fontWeight: 'bold' }}>Code Editor</div>
                    
                    {/* 🎨 NEW: Theme Toggle & Select Container */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button 
                            onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
                            style={{ padding: '6px 12px', background: 'transparent', color: theme === 'vs-dark' ? '#aaa' : '#555', border: '1px solid', borderColor: theme === 'vs-dark' ? '#555' : '#ccc', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            {theme === 'vs-dark' ? '☀️ Light' : '🌙 Dark'}
                        </button>

                        <select 
                            value={language} 
                            onChange={handleLanguageChange}
                            style={{ padding: '6px 12px', backgroundColor: theme === 'vs-dark' ? '#1e1e1e' : '#fff', color: theme === 'vs-dark' ? '#fff' : '#333', border: '1px solid #444', borderRadius: '4px', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="cpp">C++</option>
                            <option value="c">C</option>
                            <option value="java">Java</option>
                            <option value="python">Python</option>
                        </select>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <Editor
                        height="100%"
                        language={language === 'c' ? 'cpp' : language} // Monaco uses 'cpp' highlighting for C
                        theme={theme} // 🎨 NEW: Applied theme state here
                        value={code}
                        onChange={(value) => setCode(value)}
                        options={{ minimap: { enabled: false }, fontSize: 16, padding: { top: 20 }, scrollBeyondLastLine: false }}
                    />
                </div>

                <div style={{ padding: '20px', borderTop: '1px solid #333', background: '#1e1e1e' }}>
                    <button 
                        onClick={submitCode} 
                        disabled={isSubmitting}
                        // 🌀 UPDATED: Added flexbox to align the spinner with the text
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '14px', background: isSubmitting ? '#555' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px', transition: '0.2s' }}
                    >
                        {isSubmitting ? (
                            <>
                                {/* 🌀 NEW: Animated SVG Spinner */}
                                <svg style={{ animation: 'spin 1s linear infinite', marginRight: '10px', height: '20px', width: '20px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3"></circle>
                                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Judging Engine Running...
                                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                            </>
                        ) : 'Submit to Engine'}
                    </button>

                    {verdict && (
                        <div style={{ marginTop: '15px', padding: '15px', borderRadius: '4px', background: verdict.success ? '#155724' : '#721c24', border: `1px solid ${verdict.success ? '#c3e6cb' : '#f5c6cb'}` }}>
                            <h3 style={{ margin: '0 0 10px 0', color: verdict.success ? '#d4edda' : '#f8d7da' }}>{verdict.verdict}</h3>
                            {verdict.message && <p style={{ margin: 0, color: '#d4edda' }}>{verdict.message}</p>}
                            {verdict.error && <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#f8d7da' }}>{verdict.error}</pre>}
                            
                            {verdict.expected && (
                                <div style={{ marginTop: '10px', fontSize: '14px', color: '#f8d7da' }}>
                                    <strong>Failed Test Case:</strong><br/>
                                    <em>Expected:</em> {verdict.expected}<br/>
                                    <em>Received:</em> {verdict.received}
                                </div>
                            )}

                            {/* 🤖 AI MENTOR BUTTON (Appears after 2 fails) */}
                            {failCount >= 2 && !aiHint && verdict.verdict === "Wrong Answer" && (
                                <button 
                                    onClick={requestHint}
                                    disabled={isHintLoading}
                                    style={{ marginTop: '20px', width: '100%', padding: '12px', background: isHintLoading ? '#555' : 'linear-gradient(145deg, #1e3c72, #2a5298)', color: 'white', border: 'none', borderRadius: '6px', cursor: isHintLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                                >
                                    {isHintLoading ? "🤖 Analyzing your code..." : "🤖 Stuck? Ask AI Mentor for a Hint"}
                                </button>
                            )}

                            {/* 🤖 AI HINT DISPLAY BOX */}
                            {aiHint && (
                                <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', background: 'linear-gradient(145deg, #0f2027, #203a43, #2c5364)', border: '1px solid #4facfe', boxShadow: '0 4px 15px rgba(79, 172, 254, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '20px' }}>🤖</span>
                                        <strong style={{ color: '#4facfe', fontSize: '16px', letterSpacing: '0.5px' }}>Agentic Code Mentor</strong>
                                    </div>
                                    <p style={{ margin: 0, color: '#e0e0e0', lineHeight: '1.6', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                                        {aiHint}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}