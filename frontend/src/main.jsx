import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api, getStoredUser, login, logout, normalizeList } from './services/api.js';
import './styles/app.css';

const Box = ({ title, children }) => <section className="workspace-view" style={{ marginBottom: 16 }}><h3>{title}</h3>{children}</section>;

function App() {
  const [user, setUser] = useState(getStoredUser());
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [data, setData] = useState({});
  const [auth, setAuth] = useState({ username: '', password: '' });
  const [inputs, setInputs] = useState({ slug: '', uuid: '', review: '', course: '', notification_id: '', vote_type: 'like', reason: 'spam' });

  const run = async (label, fn) => {
    setErr(''); setMsg(`${label}...`);
    try { const x = await fn(); setData((d) => ({ ...d, [label]: x })); setMsg(`${label} OK`); }
    catch (e) { setErr(e.message); setMsg(''); }
  };

  if (!user) return <main className='workspace-view'><h2>Login</h2><form onSubmit={(e)=>{e.preventDefault();run('login', async()=>setUser(await login(auth)));}}><input placeholder='username' value={auth.username} onChange={(e)=>setAuth({...auth,username:e.target.value})}/><input type='password' placeholder='password' value={auth.password} onChange={(e)=>setAuth({...auth,password:e.target.value})}/><button>Kirish</button></form><p>{err}</p></main>;

  return <main className='workspace-view'>
    <h1>Course Review Platform — IMDb Style API Console</h1>
    <p>Backenddagi barcha URL/API viewlar UI orqali ishlatiladi.</p>
    <button onClick={()=>{logout();setUser(null);}}>Logout</button>
    {msg && <p>{msg}</p>}{err && <p style={{color:'crimson'}}>{err}</p>}

    <Box title='Universal Inputs'>
      <input placeholder='course slug' value={inputs.slug} onChange={(e)=>setInputs({...inputs,slug:e.target.value})}/>
      <input placeholder='uuid/id' value={inputs.uuid} onChange={(e)=>setInputs({...inputs,uuid:e.target.value})}/>
      <input placeholder='review id' value={inputs.review} onChange={(e)=>setInputs({...inputs,review:e.target.value})}/>
      <input placeholder='course id' value={inputs.course} onChange={(e)=>setInputs({...inputs,course:e.target.value})}/>
      <input placeholder='notification id' value={inputs.notification_id} onChange={(e)=>setInputs({...inputs,notification_id:e.target.value})}/>
    </Box>

    <Box title='Accounts API'>
      <button onClick={()=>run('profile',()=>api.getProfile())}>GET my/profile</button>
      <button onClick={()=>run('update_profile',()=>{const f=new FormData();f.append('first_name','IMDb');return api.updateProfile(f);})}>PATCH update</button>
      <button onClick={()=>run('change_password',()=>api.changePassword({old_password:'old',new_password:'new12345A!',confirm_password:'new12345A!'}))}>POST password/change</button>
      <button onClick={()=>run('delete_profile',()=>api.deleteProfile())}>DELETE profile</button>
    </Box>

    <Box title='Course API'>
      <button onClick={()=>run('categories',()=>api.getCategories())}>GET categories</button><button onClick={()=>run('centers',()=>api.getCenters())}>GET centers</button><button onClick={()=>run('center',()=>api.getCenter(inputs.slug))}>GET center/:slug</button>
      <button onClick={()=>run('mentors',()=>api.getMentors())}>GET mentors</button><button onClick={()=>run('mentor',()=>api.getMentor(inputs.slug))}>GET mentor/:slug</button>
      <button onClick={()=>run('tags',()=>api.getTags())}>GET tags</button><button onClick={()=>run('tag_items',()=>api.getTagItemsByCourseSlug(inputs.slug))}>GET tags/:slug</button>
      <button onClick={()=>run('courses',()=>api.getCourses())}>GET courses</button><button onClick={()=>run('course',()=>api.getCourse(inputs.slug))}>GET course/:slug</button>
    </Box>

    <Box title='Reviews & Comments API'>
      <button onClick={()=>run('reviews_by_course',()=>api.getReviewsByCourse(inputs.slug))}>GET by_course/:slug</button>
      <button onClick={()=>run('create_review',()=>api.createReview({course:inputs.course,rating:5,title:'Great',body:'IMDb style',advantages:'UI',disadvantages:'none'}))}>POST create review</button>
      <button onClick={()=>run('my_reviews',()=>api.getMyReviews())}>GET my reviews</button>
      <button onClick={()=>run('review',()=>api.getReview(inputs.uuid))}>GET review/:uuid</button>
      <button onClick={()=>run('update_review',()=>api.updateReview(inputs.uuid,{rating:4,title:'Updated',body:'Updated',advantages:'a',disadvantages:'b'}))}>PUT update review</button>
      <button onClick={()=>run('vote',()=>api.voteReview({review:inputs.review,vote_type:inputs.vote_type}))}>POST vote</button>
      <button onClick={()=>run('delete_media',()=>api.deleteReviewMedia(inputs.uuid))}>DELETE media/:uuid</button>
      <button onClick={()=>run('delete_review',()=>api.deleteReview(inputs.uuid))}>DELETE review/:uuid</button>
      <button onClick={()=>run('comments',()=>api.getCommentsByReview(inputs.review))}>GET comments/by_review/:uuid</button>
      <button onClick={()=>run('create_comment',()=>api.createComment({review:inputs.review,body:'Nice!'}))}>POST comment</button>
      <button onClick={()=>run('delete_comment',()=>api.deleteComment(inputs.uuid))}>DELETE comment/:uuid</button>
    </Box>

    <Box title='Interactions API'>
      <button onClick={()=>run('toggle_fav',()=>api.toggleFavorite({course:inputs.course}))}>POST favorites/toggle</button>
      <button onClick={()=>run('favorites',()=>api.getFavorites())}>GET favorites/my</button>
      <button onClick={()=>run('history',()=>api.getHistory())}>GET course/history</button>
      <button onClick={()=>run('activities_my',()=>api.getMyActivities())}>GET activities/my</button>
      <button onClick={()=>run('activities_all',()=>api.getAllActivities())}>GET activities/</button>
      <button onClick={()=>run('activities_user',()=>api.getActivitiesByUser(inputs.uuid))}>GET activities/:uuid</button>
    </Box>

    <Box title='Notifications API'>
      <button onClick={()=>run('notifications',()=>api.getNotifications())}>GET notifications</button>
      <button onClick={()=>run('notification',()=>api.getNotification(inputs.uuid))}>GET notifications/:uuid</button>
      <button onClick={()=>run('mark_all',()=>api.markAllNotifications())}>POST mark_all</button>
      <button onClick={()=>run('mark_one',()=>api.markOneNotification(inputs.notification_id))}>POST mark_one</button>
    </Box>

    <Box title='Moderation API'>
      <button onClick={()=>run('my_reports',()=>api.getMyReports())}>GET my_reports</button>
      <button onClick={()=>run('create_report',()=>api.createReport({review:inputs.review,reason:inputs.reason}))}>POST report/create</button>
    </Box>

    <Box title='Live JSON result'>{Object.entries(data).map(([k,v])=><details key={k}><summary>{k}</summary><pre>{JSON.stringify(Array.isArray(v)?normalizeList(v):v,null,2)}</pre></details>)}</Box>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
