import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AddProblem() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        difficulty: 'Easy',
        tags: '', 
        description: '',
        examples: [{ input: '', output: '', explanation: '' }],
        testCases: [{ input: '', expectedOutput: '' }]
    });
    const [status, setStatus] = useState('');

    const handleExampleChange = (index, field, value) => {
        const newExamples = [...formData.examples];
        newExamples[index][field] = value;
        setFormData({ ...formData, examples: newExamples });
    };

    const addExample = () => {
        setFormData({ ...formData, examples: [...formData.examples, { input: '', output: '', explanation: '' }] });
    };

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...formData.testCases];
        newTestCases[index][field] = value;
        setFormData({ ...formData, testCases: newTestCases });
    };

    const addTestCase = () => {
        setFormData({ ...formData, testCases: [...formData.testCases, { input: '', expectedOutput: '' }] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Saving...');
        try {
            const token = localStorage.getItem('token'); 

            const formattedTags = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag !== '');

            const payload = {
                ...formData,
                tags: formattedTags
            };
            
            await axios.post('/api/problems', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus('✅ Problem created successfully!');
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            setStatus('❌ Error creating problem.');
            console.error(error);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#e0e0e0', padding: '40px 20px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                
                <button onClick={() => navigate('/')} style={{ background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}>
                    ← Back to Dashboard
                </button>
                
                <h1 style={{ color: '#fff', marginTop: 0, marginBottom: '30px' }}>Create New Problem</h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#bbb' }}>Problem Title</label>
                        <input 
                            type="text" 
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            style={{ width: '100%', padding: '14px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#252526', color: '#fff', fontSize: '16px', boxSizing: 'border-box', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#bbb' }}>Difficulty</label>
                        <select 
                            value={formData.difficulty}
                            onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                            style={{ width: '100%', padding: '14px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#252526', color: '#fff', fontSize: '16px', boxSizing: 'border-box', outline: 'none' }}
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    {/* 🌟 NEW: Tags Input Field */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#bbb' }}>Tags (Comma Separated)</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Array, Two Pointers, Math"
                            value={formData.tags}
                            onChange={(e) => setFormData({...formData, tags: e.target.value})}
                            style={{ width: '100%', padding: '14px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#252526', color: '#fff', fontSize: '16px', boxSizing: 'border-box', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#bbb' }}>Problem Description (Supports Markdown)</label>
                        <textarea 
                            required
                            rows="8"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            style={{ width: '100%', padding: '14px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#252526', color: '#fff', fontSize: '16px', boxSizing: 'border-box', outline: 'none', resize: 'vertical' }}
                        />
                    </div>

                    {/* Example Test Cases Section */}
                    <div style={{ padding: '20px', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#181818' }}>
                        <h3 style={{ margin: '0 0 15px 0' }}>Example Test Cases</h3>
                        {formData.examples.map((ex, index) => (
                            <div key={index} style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <strong>Example {index + 1}</strong>
                                <input type="text" placeholder="Input (e.g., nums = [2,7,11,15], target = 9)" value={ex.input} onChange={(e) => handleExampleChange(index, 'input', e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#252526', color: '#fff' }} />
                                <input type="text" placeholder="Output (e.g., [0,1])" value={ex.output} onChange={(e) => handleExampleChange(index, 'output', e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#252526', color: '#fff' }} />
                                <input type="text" placeholder="Explanation (Optional)" value={ex.explanation} onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#252526', color: '#fff' }} />
                            </div>
                        ))}
                        <button type="button" onClick={addExample} style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Another Example</button>
                    </div>

                    {/* Hidden Test Cases Section (For Docker Engine) */}
                    <div style={{ padding: '20px', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#110517', borderLeft: '4px solid #9c27b0' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#e1bee7' }}>Engine Test Cases (Hidden from User)</h3>
                        <p style={{ fontSize: '14px', color: '#aaa', marginTop: '-10px', marginBottom: '15px' }}>These are the exact inputs injected into the Docker container.</p>
                        
                        {formData.testCases.map((tc, index) => (
                            <div key={index} style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                                <input type="text" placeholder={`Input ${index + 1}`} value={tc.input} onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#252526', color: '#fff' }} required />
                                <input type="text" placeholder={`Expected Output ${index + 1}`} value={tc.expectedOutput} onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#252526', color: '#fff' }} required />
                            </div>
                        ))}
                        <button type="button" onClick={addTestCase} style={{ padding: '8px 16px', background: '#4a148c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Hidden Test Case</button>
                    </div>

                    <button 
                        type="submit" 
                        style={{ padding: '16px', marginTop: '10px', backgroundColor: '#4facfe', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: '0.2s' }}
                    >
                        Save to Database
                    </button>
                    
                    {status && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: status.includes('✅') ? '#4caf50' : '#ff5252' }}>{status}</div>}
                </form>
            </div>
        </div>
    );
}