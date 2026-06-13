import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get('/api/submit/leaderboard');
                setLeaders(res.data.leaderboard);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#121212', padding: '50px 20px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#1e1e1e', borderRadius: '12px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#fff', margin: 0, fontSize: '32px' }}>🏆 Global Leaderboard</h1>
                    <button onClick={() => navigate('/')} style={{ background: '#333', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>
                        Back to Dashboard
                    </button>
                </div>

                {loading ? (
                    <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading rankings...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #333', textAlign: 'left', color: '#aaa', fontSize: '14px', textTransform: 'uppercase' }}>
                                <th style={{ padding: '15px' }}>Rank</th>
                                <th style={{ padding: '15px' }}>Coder</th>
                                <th style={{ padding: '15px', textAlign: 'right' }}>Problems Solved</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaders.map((user, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #2a2a2a', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '20px 15px', fontSize: '18px', fontWeight: 'bold', color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : '#fff' }}>
                                        #{user.rank}
                                    </td>
                                    <td style={{ padding: '20px 15px', fontSize: '16px' }}>{user.username}</td>
                                    <td style={{ padding: '20px 15px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>
                                        {user.solved}
                                    </td>
                                </tr>
                            ))}
                            {leaders.length === 0 && (
                                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No submissions yet! Be the first!</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}