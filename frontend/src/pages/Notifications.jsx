import { useEffect, useState } from 'react';
import http from '../api/http';
import { FaBell, FaCheckCircle, FaTrash, FaInfoCircle, FaReceipt, FaClock } from 'react-icons/fa';

const TypeIcon = ({ type }) => {
  if (type === 'ALERT') return <FaBell className="text-red-500" />;
  if (type === 'REMINDER') return <FaClock className="text-yellow-600" />;
  if (type === 'BILLING') return <FaReceipt className="text-green-600" />;
  return <FaInfoCircle className="text-blue-600" />;
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await http.get('/notifications');
      setItems(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    await http.patch('/notifications/read-all');
    load();
  };
  const markOne = async (id) => {
    await http.patch(`/notifications/${id}/read`);
    load();
  };
  const removeOne = async (id) => {
    await http.delete(`/notifications/${id}`);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-24" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#6C0B14] flex items-center gap-2"><FaBell /> Notifications</h1>
          <div className="flex gap-2">
            <button onClick={markAll} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Mark all as read</button>
            <button onClick={load} className="px-3 py-2 rounded-lg bg-[#6C0B14] text-white text-sm hover:bg-[#8a1220]">Refresh</button>
          </div>
        </div>

        {loading && <div className="bg-white rounded-lg shadow p-6">Loading…</div>}
        {error && <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-4">{error}</div>}

        {!loading && items.length === 0 && (
          <div className="bg-white rounded-lg shadow p-10 text-center text-gray-600">No notifications yet.</div>
        )}

        <div className="space-y-3">
          {items.map(n => (
            <div key={n._id} className={`bg-white rounded-lg shadow p-4 flex items-start justify-between border ${n.read ? 'border-gray-100' : 'border-[#F2D7D9]'}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1"> <TypeIcon type={n.type} /> </div>
                <div>
                  <div className="font-semibold text-gray-800">{n.title}</div>
                  <div className="text-gray-600 text-sm">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!n.read && (
                  <button onClick={() => markOne(n._id)} title="Mark as read" className="p-2 rounded hover:bg-gray-50">
                    <FaCheckCircle className="text-green-600" />
                  </button>
                )}
                <button onClick={() => removeOne(n._id)} title="Delete" className="p-2 rounded hover:bg-gray-50">
                  <FaTrash className="text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
