import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { approveAccess } from '../api/ice';

export default function IceApprove() {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const res = await approveAccess(token);
        setResult(res);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to approve');
      }
    };
    if (token) run();
  }, [token]);

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!result) return <div className="min-h-screen flex items-center justify-center">Processing…</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-[#6C0B14] mb-4">Access Approved</h1>
        <p className="mb-4 text-gray-700">Full medical history has been approved for viewing.</p>
        <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
{JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
}
