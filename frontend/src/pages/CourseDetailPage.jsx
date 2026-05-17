import React from 'react';
import { api } from '../services/api.js';
import { navigate } from '../router/hashRouter.js';

function LoadingBlock({ h = 14, w = '100%' }) {
  return <div style={{ height: h, width: w, borderRadius: 999, background: 'rgba(10,20,40,.08)' }} />;
}

function RatingStars({ rating }) {
  const r = Number(rating);
  const value = Number.isFinite(r) ? r : 0;
  const rounded = Math.round(value * 2) / 2;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: 'var(--amber)', fontWeight: 900 }}>⭐ {rounded.toFixed(1)}</span>
      <span style={{ color: 'var(--muted)' }}>{value > 0 ? `${value >= 4.6 ? 'Juda zo‘r' : 'Yaxshi'}` : ''}</span>
    </span>
  );
}

function VerifiedBadge({ verified }) {
  if (!verified) return null;
  return (
    <span className="verified-badge" title="Tasdiqlangan">
      ✅
    </span>
  );
}

function ReviewCard({ review, onVote, onOpenComments, onReport, onDelete }) {
  const [voteBusy, setVoteBusy] = React.useState(false);

  const rating = review?.rating ?? review?.score ?? 0;
  const title = review?.title || review?.name || 'Sharh';
  const body = review?.body || review?.text || '';

  return (
    <div className="compact-row" style={{ padding: 16, cursor: 'default' }}>
      <div style={{ display: 'grid', gap: 10, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <RatingStars rating={rating} />
              <VerifiedBadge verified={review?.is_verified || review?.verified} />
            </div>
            <div style={{ fontWeight: 900 }}>{title}</div>
          </div>

          <div style={{ display: 'grid', justifyItems: 'end', gap: 8 }}>
            <button
              className="ghost-btn"
              type="button"
              style={{ minHeight: 36, padding: '0 14px' }}
              onClick={async () => {
                setVoteBusy(true);
                try {
                  await onVote(review?.id || review?.uuid, 'like');
                } finally {
                  setVoteBusy(false);
                }
              }}
              disabled={voteBusy}
            >
              👍 Like
            </button>

            <button
              className="ghost-btn"
              type="button"
              style={{ minHeight: 36, padding: '0 14px' }}
              onClick={async () => {
                setVoteBusy(true);
                try {
                  await onVote(review?.id || review?.uuid, 'spam');
                } finally {
                  setVoteBusy(false);
                }
              }}
              disabled={voteBusy}
            >
              🧹 Spam
            </button>

            <button
              className="ghost-btn"
              type="button"
              style={{ minHeight: 36, padding: '0 14px' }}
              onClick={() => onReport(review?.id || review?.uuid)}
            >
              🚩 Report
            </button>

            {typeof onDelete === 'function' ? (
              <button
                className="ghost-btn"
                type="button"
                style={{ minHeight: 36, padding: '0 14px', color: '#b3213b' }}
                onClick={() => onDelete(review?.id || review?.uuid)}
              >
                🗑 Delete
              </button>
            ) : null}
          </div>
        </div>

        {body ? <div style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{body}</div> : null}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="pill-btn" type="button" onClick={() => onOpenComments(review?.id || review?.uuid)} style={{ minHeight: 40 }}>
            💬 Comments
          </button>

          <span style={{ color: 'var(--muted)', fontSize: 13 }}>
            {review?.created_at ? new Date(review.created_at).toLocaleString('uz-UZ') : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailPage({ slug }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [course, setCourse] = React.useState(null);
  const [reviews, setReviews] = React.useState([]);

  const [commentReviewId, setCommentReviewId] = React.useState('');
  const [comments, setComments] = React.useState([]);
  const [commentsLoading, setCommentsLoading] = React.useState(false);
  const [commentsError, setCommentsError] = React.useState('');

  const [reviewDraft, setReviewDraft] = React.useState({
    course: '',
    rating: 5,
    title: '',
    body: '',
    advantages: '',
    disadvantages: '',
  });

  const [commentDraft, setCommentDraft] = React.useState({ body: '' });
  const [formBusy, setFormBusy] = React.useState(false);

  const fetchAll = React.useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError('');
    try {
      const c = await api.getCourse(slug);
      setCourse(c);

      const courseIdForReview = c?.id || c?.uuid || c?.slug || slug;
      setReviewDraft((d) => ({
        ...d,
        course: String(courseIdForReview),
      }));

      const r = await api.getReviewsByCourse(slug);
      const list = r?.results || r?.data || r || [];
      setReviews(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'Kurs yuklanmadi');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openComments = React.useCallback(async (reviewIdOrUuid) => {
    const id = reviewIdOrUuid;
    setCommentReviewId(String(id || ''));
    setCommentsLoading(true);
    setCommentsError('');
    try {
      const res = await api.getCommentsByReview(id);
      const list = res?.results || res?.data || res || [];
      setComments(Array.isArray(list) ? list : []);
    } catch (e) {
      setCommentsError(e?.message || 'Comments yuklanmadi');
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const handleCreateReview = async () => {
    if (!reviewDraft.title.trim() || !reviewDraft.body.trim()) {
      alert('Iltimos, title va body kiriting.');
      return;
    }
    setFormBusy(true);
    try {
      await api.createReview({
        course: reviewDraft.course,
        rating: Number(reviewDraft.rating),
        title: reviewDraft.title,
        body: reviewDraft.body,
        advantages: reviewDraft.advantages || '',
        disadvantages: reviewDraft.disadvantages || '',
      });
      await fetchAll();
      setReviewDraft((d) => ({ ...d, title: '', body: '', advantages: '', disadvantages: '' }));
    } catch (e) {
      alert(e?.message || 'Review yaratilmay qoldi');
    } finally {
      setFormBusy(false);
    }
  };

  const handleCreateComment = async () => {
    if (!commentReviewId) return;
    if (!commentDraft.body.trim()) {
      alert('Comment matnini kiriting');
      return;
    }
    setFormBusy(true);
    try {
      await api.createComment({ review: commentReviewId, body: commentDraft.body });
      await openComments(commentReviewId);
      setCommentDraft({ body: '' });
    } catch (e) {
      alert(e?.message || 'Comment yaratilmadi');
    } finally {
      setFormBusy(false);
    }
  };

  const handleVote = async (reviewIdOrUuid, voteType) => {
    await api.voteReview({ review: reviewIdOrUuid, vote_type: voteType });
    await fetchAll();
  };

  const handleReport = async (reviewIdOrUuid) => {
    const reason = prompt('Report reason kiriting:', 'spam');
    if (!reason) return;
    try {
      await api.createReport({ review: reviewIdOrUuid, reason });
      alert('Report yuborildi');
    } catch (e) {
      alert(e?.message || 'Report yuborilmadi');
    }
  };

  const handleDeleteReview = async (reviewIdOrUuid) => {
    const ok = confirm('Ushbu reviewni o‘chirmoqchimisiz?');
    if (!ok) return;
    try {
      await api.deleteReview(reviewIdOrUuid);
      if (commentReviewId && String(commentReviewId) === String(reviewIdOrUuid)) {
        setCommentReviewId('');
        setComments([]);
      }
      await fetchAll();
      alert('Review o‘chirildi');
    } catch (e) {
      alert(e?.message || 'Review o‘chmadi');
    }
  };

  const handleDeleteComment = async (commentIdOrUuid) => {
    const ok = confirm('Ushbu commentni o‘chirmoqchimisiz?');
    if (!ok) return;
    try {
      await api.deleteComment(commentIdOrUuid);
      await openComments(commentReviewId);
      alert('Comment o‘chirildi');
    } catch (e) {
      alert(e?.message || 'Comment o‘chmadi');
    }
  };

  return (
    <main className="workspace">
      <div className="workspace-header">
        <div>
          <div className="crumbs">
            Asosiy • Kurs • <span style={{ color: 'var(--accent)' }}>{slug}</span>
          </div>
          <h2 style={{ marginTop: 6 }}>{course?.name || course?.title || 'Kurs'}</h2>
          <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {course?.rating != null || course?.avg_rating != null ? (
              <RatingStars rating={course?.rating ?? course?.avg_rating} />
            ) : (
              <span style={{ color: 'var(--muted)' }}>⭐ Reyting yo‘q</span>
            )}
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>
              {course?.address || course?.location ? `📍 ${course.address || course.location}` : ''}
            </span>
          </div>
        </div>

        <div className="top-actions" style={{ marginTop: 6 }}>
          <button className="pill-btn" type="button" onClick={() => navigate('/#/courses')}>
            Qidirish
          </button>
          <button className="ghost-btn" type="button" onClick={() => navigate('/#/favorites/my')}>
            Sevimlilar
          </button>
        </div>
      </div>

      {error ? <div className="api-alert">{error}</div> : null}

      <div className="detail-grid">
        <section className="detail-card" style={{ padding: 18 }}>
          <div className="section-head">
            <h3>Qisqa ma’lumot</h3>
            <p>Kurs/markaz</p>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <LoadingBlock h={14} w="80%" />
              <LoadingBlock h={14} w="60%" />
              <LoadingBlock h={14} w="90%" />
              <LoadingBlock h={14} w="70%" />
            </div>
          ) : (
            <div style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
              {course?.description || course?.course_description || 'Tavsif hali yo‘q.'}
              <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span className="tag-cloud">
                  <span style={{ display: 'inline-block', borderRadius: 999, padding: '7px 12px' }}>
                    🏢 {course?.center_name || 'Markaz'}
                  </span>
                </span>
                <span className="tag-cloud">
                  <span style={{ display: 'inline-block', borderRadius: 999, padding: '7px 12px' }}>
                    🗓 {course?.created_at ? new Date(course.created_at).toLocaleDateString('uz-UZ') : '—'}
                  </span>
                </span>
              </div>
            </div>
          )}
        </section>

        <section className="detail-card" style={{ padding: 18 }}>
          <div className="section-head">
            <h3>Review yozish</h3>
            <p>Realtime UX</p>
          </div>

          <div className="review-form-grid" style={{ marginTop: 10, gridTemplateColumns: '1fr 1fr' }}>
            <label>
              <span>Rating</span>
              <select value={reviewDraft.rating} onChange={(e) => setReviewDraft((d) => ({ ...d, rating: e.target.value }))} style={{ minHeight: 46 }}>
                {[1, 2, 3, 4, 5].map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Title</span>
              <input value={reviewDraft.title} onChange={(e) => setReviewDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Masalan: Ajoyib kurs!" />
            </label>

            <label className="wide" style={{ gridColumn: '1 / -1' }}>
              <span>Body</span>
              <textarea
                value={reviewDraft.body}
                onChange={(e) => setReviewDraft((d) => ({ ...d, body: e.target.value }))}
                placeholder="Qanday o‘tdi? Nimalar yoqdi?"
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </label>

            <label>
              <span>Advantages</span>
              <input value={reviewDraft.advantages} onChange={(e) => setReviewDraft((d) => ({ ...d, advantages: e.target.value }))} placeholder="Kuchli tomonlar" />
            </label>

            <label>
              <span>Disadvantages</span>
              <input value={reviewDraft.disadvantages} onChange={(e) => setReviewDraft((d) => ({ ...d, disadvantages: e.target.value }))} placeholder="Kamchiliklar" />
            </label>
          </div>

          <div className="composer-actions" style={{ marginTop: 12 }}>
            <button className="pill-btn" type="button" onClick={handleCreateReview} disabled={formBusy}>
              {formBusy ? 'Yaratilmoqda...' : '✅ Review qo‘shish'}
            </button>
          </div>
        </section>
      </div>

      <section className="content-panel" style={{ padding: 18, marginTop: 18 }}>
        <div className="section-head" style={{ marginBottom: 10 }}>
          <h3>Sharhlar</h3>
          <p>{loading ? '...' : `${reviews.length} ta sharh`}</p>
        </div>

        {loading ? (
          <div className="compact-list">
            <LoadingBlock h={40} w="100%" />
            <LoadingBlock h={40} w="100%" />
            <LoadingBlock h={40} w="100%" />
          </div>
        ) : null}

        {!loading && reviews.length === 0 ? <div className="api-alert">Hozircha sharhlar yo‘q.</div> : null}

        {!loading && reviews.length > 0 ? (
          <div className="compact-list" style={{ gap: 12 }}>
            {reviews.slice(0, 8).map((r) => {
              const reviewIdOrUuid = r?.id || r?.uuid;
              return (
                <ReviewCard
                  key={reviewIdOrUuid || r?.title}
                  review={r}
                  onVote={handleVote}
                  onOpenComments={openComments}
                  onReport={handleReport}
                  onDelete={handleDeleteReview}
                />
              );
            })}
          </div>
        ) : null}

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div className="section-head" style={{ marginBottom: 10 }}>
            <h3>Comments</h3>
            <p>{commentReviewId ? `Review: ${commentReviewId}` : 'Hech narsa tanlanmadi'}</p>
          </div>

          {commentsLoading ? <div className="api-alert">Comments yuklanmoqda...</div> : null}
          {commentsError ? <div className="api-alert">{commentsError}</div> : null}

          {!commentsLoading && !commentsError && commentReviewId ? (
            <>
              <div className="composer-actions" style={{ marginBottom: 12 }}>
                <input
                  value={commentDraft.body}
                  onChange={(e) => setCommentDraft({ body: e.target.value })}
                  placeholder="Comment yozing..."
                  style={{ flex: '1 1 auto', minHeight: 46, borderRadius: 14, border: '1px solid var(--border)', padding: '0 14px' }}
                />
                <button className="pill-btn" type="button" onClick={handleCreateComment} disabled={formBusy}>
                  ➕ Qo‘shish
                </button>
              </div>

              {comments.length === 0 ? (
                <div className="api-alert">Bu review bo‘yicha commentlar yo‘q.</div>
              ) : (
                <div className="compact-list" style={{ gap: 10 }}>
                  {comments.slice(0, 20).map((c) => {
                    const commentId = c?.id || c?.uuid;
                    return (
                      <div key={commentId || c?.body || Math.random()} className="compact-row" style={{ padding: 14 }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: 'var(--fg)', fontWeight: 800 }}>
                              {c?.user?.username || c?.author || 'Foydalanuvchi'}
                            </div>
                            <div style={{ color: 'var(--muted)', marginTop: 6, lineHeight: 1.7 }}>{c?.body || c?.text}</div>
                          </div>

                          <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                            <button
                              className="ghost-btn"
                              type="button"
                              style={{ minHeight: 34, padding: '0 12px', color: '#b3213b' }}
                              onClick={() => handleDeleteComment(commentId)}
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
