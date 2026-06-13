import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ActivityCalendar } from 'react-activity-calendar';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const CircularProgress = ({ label, solved, total, color }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const safeTotal = total > 0 ? total : 1; 
    const strokeDashoffset = circumference - (solved / safeTotal) * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} stroke="#333" strokeWidth="8" fill="none" />
                <circle 
                    cx="50" cy="50" r={radius} stroke={color} strokeWidth="8" fill="none" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round" 
                    transform="rotate(-90 50 50)" 
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
                <text x="50%" y="45%" textAnchor="middle" fill="#fff" fontSize="14px" fontWeight="bold">
                    {solved}/{total}
                </text>
                <text x="50%" y="65%" textAnchor="middle" fill="#aaa" fontSize="12px">
                    {label}
                </text>
            </svg>
        </div>
    );
};

export default function Profile() {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const res = await axios.get('/api/submit/metrics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMetrics(res.data);
            } catch (error) {
                console.error("Failed to fetch metrics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, [navigate]);

    if (loading) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading your stats...</div>;
    if (!metrics) return <div style={{ color: '#ff5252', padding: '50px', textAlign: 'center' }}>Error loading stats.</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#3b3b4f', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
            
            <div style={{ backgroundColor: '#2a2a35', padding: '40px', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', width: '100%', maxWidth: '1000px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#fff', margin: 0, fontSize: '28px' }}>Developer Profile</h1>
                    <button onClick={() => navigate('/')} style={{ background: '#444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                        Back to Dashboard
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '30px' }}>
                    
                    {/* LEFT COLUMN: Original Stats & Heatmap */}
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: '#1e1e24', padding: '20px', borderRadius: '12px' }}>
                            <CircularProgress label="Easy" solved={metrics.solved.easy} total={metrics.solved.totalEasy} color="#4caf50" />
                            <CircularProgress label="Medium" solved={metrics.solved.medium} total={metrics.solved.totalMedium} color="#ff9800" />
                            <CircularProgress label="Hard" solved={metrics.solved.hard} total={metrics.solved.totalHard} color="#f44336" />
                        </div>

                        {/* 📈 NEW: Tooltip-Enabled Heatmap */}
                        <div style={{ backgroundColor: '#1e1e24', padding: '25px', borderRadius: '12px' }}>
                            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px' }}>Submission Activity</h3>
                            <ActivityCalendar 
                                data={metrics.heatmapData} 
                                blockSize={14}     
                                blockMargin={4}
                                colorScheme="dark"
                                theme={{
                                    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                                }}
                                labels={{
                                    totalCount: '{{count}} submissions in the last year',
                                }}
                                renderBlock={(block, activity) => 
                                    React.cloneElement(block, {
                                        'data-tooltip-id': 'heatmap-tooltip',
                                        'data-tooltip-content': `${activity.count} submissions on ${new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
                                    })
                                }
                            />
                            <ReactTooltip 
                                id="heatmap-tooltip" 
                                style={{ backgroundColor: '#2d333b', color: '#adbac7', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', border: '1px solid #444c56', zIndex: 100 }} 
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={{ backgroundColor: '#28a745', padding: '20px', borderRadius: '8px', color: '#fff', gridColumn: 'span 2', textAlign: 'center' }}>
                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Acceptance Rate</div>
                                <div style={{ fontSize: '32px', marginTop: '5px' }}>{metrics.acceptanceRate}%</div>
                            </div>
                            <div style={{ backgroundColor: '#d97706', padding: '15px', borderRadius: '8px', color: '#fff', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.9 }}>Total Submissions</div>
                                <div style={{ fontSize: '20px', marginTop: '5px' }}>{metrics.submissions.total}</div>
                            </div>
                            <div style={{ backgroundColor: '#4a148c', padding: '15px', borderRadius: '8px', color: '#fff', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.9 }}>Total Solved</div>
                                <div style={{ fontSize: '20px', marginTop: '5px' }}>{metrics.solved.easy + metrics.solved.medium + metrics.solved.hard}</div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Recent Submissions Feed */}
                    <div style={{ flex: 1, backgroundColor: '#1e1e24', padding: '25px', borderRadius: '12px', maxHeight: '800px', overflowY: 'auto' }}>
                        <h3 style={{ color: '#fff', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '15px' }}>Recent Activity</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                            {metrics.recentSubmissions.length === 0 ? (
                                <p style={{ color: '#888' }}>No recent submissions.</p>
                            ) : (
                                metrics.recentSubmissions.map((sub) => (
                                    <div key={sub.id} style={{ background: '#252526', padding: '15px', borderRadius: '8px', borderLeft: `4px solid ${sub.verdict === 'Accepted' ? '#2ea043' : '#f85149'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <strong style={{ color: '#c9d1d9', fontSize: '14px' }}>{sub.problemTitle}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '8px' }}>
                                            <span style={{ color: sub.verdict === 'Accepted' ? '#3fb950' : '#f85149', fontWeight: 'bold' }}>
                                                {sub.verdict}
                                            </span>
                                            <span style={{ color: '#8b949e' }}>{sub.language}</span>
                                        </div>
                                        <div style={{ color: '#666', fontSize: '11px', marginTop: '5px', textAlign: 'right' }}>
                                            {new Date(sub.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}