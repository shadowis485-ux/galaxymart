import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Plus, Send } from 'lucide-react';
import { reviewsApi } from '../lib/api';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_name: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    reviewsApi.getAll().then(setReviews).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.comment) {
      toast.error('Please fill all fields');
      return;
    }
    setSubmitting(true);
    try {
      const review = await reviewsApi.create(form);
      setReviews(prev => [review, ...prev]);
      setForm({ customer_name: '', rating: 5, comment: '' });
      setShowForm(false);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-white mb-4">Customer <span className="gold-text">Reviews</span></h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={28} className="text-yellow-400" fill="currentColor" />
            ))}
          </div>
          <p className="text-4xl font-bold gold-text mb-1">{avgRating} / 5</p>
          <p className="text-gray-500">{reviews.length} verified reviews</p>
        </motion.div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-gold px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
            data-testid="button-write-review"
          >
            <Plus size={16} />
            Write a Review
          </button>
        </div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 mb-6"
          >
            <h3 className="text-white font-semibold text-lg mb-4">Share Your Experience</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={form.customer_name}
                onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))}
                className="input-gold w-full px-4 py-3 text-sm"
                data-testid="input-review-name"
              />
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, rating: r }))}
                      data-testid={`button-rating-${r}`}
                    >
                      <Star
                        size={28}
                        className={r <= form.rating ? 'text-yellow-400' : 'text-gray-700'}
                        fill={r <= form.rating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Tell us about your experience..."
                value={form.comment}
                onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                rows={4}
                className="input-gold w-full px-4 py-3 text-sm resize-none"
                data-testid="input-review-comment"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                  data-testid="button-submit-review"
                >
                  <Send size={14} />
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.form>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5"
                data-testid={`card-review-${review.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-yellow-400/15 flex items-center justify-center text-yellow-400 font-bold">
                      {review.customer_name[0].toUpperCase()}
                    </div>
                    <span className="text-white font-medium text-sm">{review.customer_name}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} size={13} className="text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">"{review.comment}"</p>
                <p className="text-gray-600 text-xs mt-3">{new Date(review.created_at).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
