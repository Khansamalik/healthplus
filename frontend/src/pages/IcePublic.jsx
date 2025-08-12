import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getIcePublic, requestFullHistory } from '../api/ice';

export default function IcePublic() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getIcePublic(code);
        setData(res);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    if (code) run();
  }, [code]);

  const handleRequestFull = async () => {
    try {
      await requestFullHistory(code, {});
      setRequested(true);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to request access');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
        <div className="h-24"></div>
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-[#6C0B14] mb-4">Emergency Information</h1>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-600">Name</div>
            <div className="font-medium">{data?.patientInfo?.name || 'Not provided'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Blood Group</div>
            <div className="font-medium">{data?.patientInfo?.bloodGroup || 'Not provided'}</div>
          </div>
          {data?.patientInfo?.medicalHistory && (
            <div>
              <div className="text-sm text-gray-600">Medical History</div>
              <div className="font-medium whitespace-pre-wrap">{data.patientInfo.medicalHistory}</div>
            </div>
          )}
          {Array.isArray(data?.contacts) && data.contacts.length > 0 && (
            <div>
              <div className="text-sm text-gray-600">Emergency Contacts</div>
              <ul className="list-disc ml-5">
                {data.contacts.map((c, i) => (
                  <li key={i}>{c.name} — {c.number}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            Full medical history requires approval from the patient’s emergency contacts.
          </p>
          <button
            onClick={handleRequestFull}
            disabled={requested}
            className="mt-3 px-4 py-2 rounded bg-[#6C0B14] text-white disabled:opacity-60"
          >
            {requested ? 'Request sent. Waiting for approval…' : 'Request Full History'}
          </button>
        </div>
      </div>
    </div>
  );
}
