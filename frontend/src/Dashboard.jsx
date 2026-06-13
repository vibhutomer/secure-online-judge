import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Search, Trophy, User, Plus, LogOut, Code2 } from 'lucide-react';

export default function Dashboard({ handleLogout }) {
    const [problems, setProblems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await axios.get('/api/problems');
                setProblems(res.data.problems);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching problems:", error);
                toast.error("Error fetching problems!");
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    const logout = () => {
        handleLogout();
        toast.success("Logged out successfully");
    };

    const filteredProblems = problems.filter(problem => 
        problem.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
            style={{ minHeight: '100vh', backgroundColor: '#0d1117', color: '#c9d1d9', padding: '40px 20px', fontFamily: 'sans-serif' }}
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                
                {/* 🌟 NEW: Premium Header with Lucide Icons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #2ea043, #238636)', padding: '10px', borderRadius: '8px', display: 'flex' }}>
                            <Code2 size={28} color="white" />
                        </div>
                        <h1 style={{ margin: 0, color: '#fff', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Problemset</h1>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/leaderboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#161b22', color: '#e3b341', border: '1px solid #30363d', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
                            <Trophy size={18} /> Leaderboard
                        </button>
                        <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#161b22', color: '#a371f7', border: '1px solid #30363d', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
                            <User size={18} /> My Profile
                        </button>
                        <button onClick={() => navigate('/add-problem')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#238636', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
                            <Plus size={18} /> Create Problem
                        </button>
                        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'transparent', color: '#f85149', border: '1px solid #f85149', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>

                {/* 🌟 NEW: Sleek Search Bar */}
                <div style={{ position: 'relative', marginBottom: '30px' }}>
                    <Search size={20} color="#8b949e" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <input 
                        type="text" 
                        placeholder="Search for algorithmic challenges..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '8px', border: '1px solid #30363d', backgroundColor: '#0d1117', color: '#fff', fontSize: '16px', outline: 'none', boxSizing: 'border-box', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                </div>
                
                {/* 🌟 NEW: LeetCode-Style Data Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#8b949e', marginTop: '50px' }}>Fetching challenges...</div>
                ) : (
                    <div style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#0d1117', borderBottom: '1px solid #30363d', color: '#8b949e', fontSize: '14px', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '20px', width: '60%', textAlign: 'left' }}>Title</th>
                                    <th style={{ padding: '20px', width: '20%', textAlign: 'center' }}>Difficulty</th>
                                    <th style={{ padding: '20px', width: '20%', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProblems.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>No challenges found matching "{searchQuery}"</td>
                                    </tr>
                                ) : (
                                    filteredProblems.map((problem) => (
                                        <tr key={problem._id} style={{ borderBottom: '1px solid #21262d', transition: 'background 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1c2128'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <td style={{ padding: '20px', textAlign: 'left' }}>
                                                <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                                                    {problem.title}
                                                </div>
                                                {/* 🌟 NEW: Render Tags (if they exist in the DB) */}
                                                {problem.tags && problem.tags.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                        {problem.tags.map((tag, idx) => (
                                                            <span key={idx} style={{ backgroundColor: '#2d333b', color: '#adbac7', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', border: '1px solid #444c56' }}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '20px', textAlign: 'center' }}>
                                                <span style={{ 
                                                    color: problem.difficulty === 'Easy' ? '#3fb950' : problem.difficulty === 'Medium' ? '#d29922' : '#f85149',
                                                    backgroundColor: problem.difficulty === 'Easy' ? 'rgba(63, 185, 80, 0.1)' : problem.difficulty === 'Medium' ? 'rgba(210, 153, 34, 0.1)' : 'rgba(248, 81, 73, 0.1)',
                                                    padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold'
                                                }}>
                                                    {problem.difficulty}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px', textAlign: 'right' }}>
                                                <button 
                                                    onClick={() => navigate(`/problem/${problem._id}`)}
                                                    style={{ padding: '8px 20px', backgroundColor: '#238636', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.2s' }}
                                                >
                                                    Solve
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    );
}