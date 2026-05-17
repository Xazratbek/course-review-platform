import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api, getStoredUser, login, logout } from './services/api.js';
import './styles/app.css';

const normalizeList = (payload) => (Array.isArray(payload) ? payload : payload?.results || payload?.data || []);

function App() {
  const [user, setUser] = useState(getStoredUser());
  const [tab, setTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [history, setHistory] = useState([]);
  const [activities, setActivities] = useState([]);
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [editForm, setEditForm] = useState({});
  const [reportForm, setReportForm] = useState({ review: '', reason: '' });
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });

  const loadAll = async () => {
    if (!user) return;
    const [rv, hs, ac, rp] = await Promise.allSettled([api.getMyReviews(), api.getHistory(), api.getMyActivities(), api.getMyReports()]);
    if (rv.status === 'fulfilled') setReviews(normalizeList(rv.value));
    if (hs.status === 'fulfilled') setHistory(normalizeList(hs.value));
    if (ac.status === 'fulfilled') setActivities(normalizeList(ac.value));
    if (rp.status === 'fulfilled') setReports(normalizeList(rp.value));
  };

  useEffect(() => { loadAll(); }, [user]);

  const run = async (fn) => {
    setError('');
    setStatus('Jarayon...');
    try { await fn(); setStatus('Bajarildi'); } catch (e) { setError(e.message); setStatus(''); }
  };

  if (!user) return <main className="workspace-view"><h2>Login</h2><form onSubmit={(e)=>{e.preventDefault();run(async()=>setUser(await login(credentials)));}}><input placeholder='username' value={credentials.username} onChange={(e)=>setCredentials({...credentials, username:e.target.value})}/><input type='password' placeholder='password' value={credentials.password} onChange={(e)=>setCredentials({...credentials, password:e.target.value})}/><button>Kirish</button>{error && <p>{error}</p>}</form></main>;

  return <main className="workspace-view"><h1>Production Account UI</h1>
    <div><button onClick={()=>setTab('reviews')}>Reviews</button><button onClick={()=>setTab('report')}>Report</button><button onClick={()=>setTab('activity')}>History/Activity</button><button onClick={()=>setTab('security')}>Security</button><button onClick={()=>{logout();setUser(null);}}>Logout</button></div>
    {status && <p>{status}</p>}{error && <p>{error}</p>}

    {tab==='reviews' && <section>
      <h2>Review update/delete/media delete</h2>
      {reviews.map((r)=><article key={r.id}><h4>{r.title}</h4><input placeholder='Title' value={editForm[r.id]?.title ?? r.title ?? ''} onChange={(e)=>setEditForm({...editForm,[r.id]:{...(editForm[r.id]||r),title:e.target.value}})} /><textarea placeholder='Body' value={editForm[r.id]?.body ?? r.body ?? ''} onChange={(e)=>setEditForm({...editForm,[r.id]:{...(editForm[r.id]||r),body:e.target.value}})} />
      <button onClick={()=>run(async()=>{await api.updateReview(r.id,{title:editForm[r.id]?.title||r.title,body:editForm[r.id]?.body||r.body,advantages:editForm[r.id]?.advantages||r.advantages||'-',disadvantages:editForm[r.id]?.disadvantages||r.disadvantages||'-'});await loadAll();})}>Update</button>
      <button onClick={()=>run(async()=>{await api.deleteReviewMedia(r.id);await loadAll();})}>Delete Media</button>
      <button onClick={()=>run(async()=>{await api.deleteReview(r.id);await loadAll();})}>Delete Review</button></article>)}
    </section>}

    {tab==='report' && <section><h2>Dynamic report form</h2>
      <select value={reportForm.review} onChange={(e)=>setReportForm({...reportForm,review:e.target.value})}><option value=''>Review tanlang</option>{reviews.map((r)=><option key={r.id} value={r.id}>{r.title}</option>)}</select>
      <select value={reportForm.reason} onChange={(e)=>setReportForm({...reportForm,reason:e.target.value})}><option value=''>Reason</option><option value='spam'>Spam</option><option value='hate'>Hate speech</option><option value='fake'>Fake info</option><option value='other'>Other</option></select>
      <button onClick={()=>run(async()=>{await api.createReport(reportForm);await loadAll();})}>Report yuborish</button>
      {reports.map((r)=><p key={r.id}>{r.reason} - {r.status}</p>)}
    </section>}

    {tab==='activity' && <section><h2>Course history</h2>{history.map((h)=><p key={h.id}>{h.course?.title || h.id}</p>)}<h2>My activity</h2>{activities.map((a)=><p key={a.id}>{a.activity_type}</p>)}</section>}

    {tab==='security' && <section><h2>Password change & profile delete</h2>
      <input type='password' placeholder='old_password' value={passwordForm.old_password} onChange={(e)=>setPasswordForm({...passwordForm,old_password:e.target.value})}/>
      <input type='password' placeholder='new_password' value={passwordForm.new_password} onChange={(e)=>setPasswordForm({...passwordForm,new_password:e.target.value})}/>
      <input type='password' placeholder='confirm_password' value={passwordForm.confirm_password} onChange={(e)=>setPasswordForm({...passwordForm,confirm_password:e.target.value})}/>
      <button onClick={()=>run(async()=>api.changePassword(passwordForm))}>Change password</button>
      <button onClick={()=>run(async()=>{await api.deleteProfile();logout();setUser(null);})}>Delete profile</button>
    </section>}
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
