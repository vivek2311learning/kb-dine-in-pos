'use client';

import { useEffect, useState } from 'react';

export default function BillingConfigPage() {
  const [gst, setGst] = useState(5);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */

  useEffect(() => {
    fetch('/api/counter/billing/config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.gstPercent !== undefined) {
          setGst(data.gstPercent);
        }
      });
  }, []);

  /* ================= SAVE ================= */

  const save = async () => {
    setLoading(true);

    await fetch('/api/counter/billing/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gstPercent: Number(gst) }),
    });

    setLoading(false);
    alert('Saved!');
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Billing Config</h1>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor='gst'>
          GST %
        </label>

        <input
          type="number"
          id='gst'
          value={gst}
          onChange={(e) => setGst(Number(e.target.value))}
          className="border rounded-lg p-2 w-full"
        />
      </div>

      <button
        onClick={save}
        disabled={loading}
        className="w-full py-3 bg-black text-white rounded-xl"
      >
        {loading ? 'Saving...' : 'Save Config'}
      </button>
    </div>
  );
}