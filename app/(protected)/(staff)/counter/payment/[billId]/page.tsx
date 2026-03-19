'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type PaymentMethod = 'cash' | 'upi' | 'card';

interface PaymentRow {
  method: PaymentMethod;
  amount: number;
}

export default function PaymentPage() {
  const params = useParams<{ billId: string }>();
  const router = useRouter();

  const billId = params.billId;

  const [totalAmount, setTotalAmount] = useState(0);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH BILL ================= */

  useEffect(() => {
    if (!billId) return;

    const load = async () => {
      const res = await fetch(`/api/counter/bills/${billId}`, {
        cache: 'no-store',
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data?.bill?.totalAmount) {
        setTotalAmount(data.bill.totalAmount);

        setPayments([{ method: 'cash', amount: data.bill.totalAmount }]);
      }
    };

    load();
  }, [billId]);

  /* ================= CALCULATIONS ================= */

  const paidAmount = useMemo(
    () => payments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments],
  );

  const remaining = useMemo(
    () => totalAmount - paidAmount,
    [totalAmount, paidAmount],
  );

  /* ================= HELPERS ================= */

  const updateMethod = (i: number, method: PaymentMethod) => {
    const updated = [...payments];
    updated[i].method = method;
    setPayments(updated);
  };

  const updateAmount = (i: number, amount: number) => {
    const updated = [...payments];
    updated[i].amount = amount;
    setPayments(updated);
  };

  const addSplit = () => {
    setPayments([...payments, { method: 'cash', amount: 0 }]);
  };

  const fillFull = (method: PaymentMethod) => {
    setPayments([{ method, amount: totalAmount }]);
  };

  /* ================= PAYMENT ================= */

const handlePayment = async () => {
  if (!billId || loading) return;

  if (remaining !== 0) {
    alert('Amount mismatch');
    return;
  }

  try {
    setLoading(true);

    const res = await fetch(`/api/counter/bills/${billId}/pay`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payments }),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      setLoading(false);
      return;
    }

    /* 🔥 IMPORTANT FIX */
    setLoading(false);

    /* 🔥 SAFE REDIRECT */
    router.replace(`/counter/feedback/${data.orderId}`);

  } catch (err) {
    console.error(err);
    setLoading(false);
  }
};

  /* ================= UI ================= */

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-5">

      <h1 className="text-2xl font-bold text-center">
        Payment
      </h1>

      <div className="border rounded-xl p-5 text-center bg-white">
        <p className="text-sm text-gray-500">Total Amount</p>
        <p className="text-3xl font-bold mt-1">₹{totalAmount}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => fillFull('cash')} className="bg-gray-200 py-2 rounded-lg">Cash</button>
        <button onClick={() => fillFull('upi')} className="bg-gray-200 py-2 rounded-lg">UPI</button>
        <button onClick={() => fillFull('card')} className="bg-gray-200 py-2 rounded-lg">Card</button>
      </div>

      <div className="space-y-3">
        {payments.map((p, i) => (
          <div key={i} className="border rounded-xl p-3 grid grid-cols-2 gap-3 bg-white">

            <div>
              <label htmlFor={`method-${i}`} className="text-xs text-gray-500">
                Method
              </label>
              <select
                id={`method-${i}`}
                value={p.method}
                onChange={(e) => updateMethod(i, e.target.value as PaymentMethod)}
                className="border p-2 rounded-lg w-full mt-1"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div>
              <label htmlFor={`amount-${i}`} className="text-xs text-gray-500">
                Amount
              </label>
              <input
                id={`amount-${i}`}
                type="number"
                value={p.amount}
                onChange={(e) => updateAmount(i, Number(e.target.value))}
                className="border p-2 rounded-lg w-full mt-1"
              />
            </div>

          </div>
        ))}
      </div>

      <button onClick={addSplit} className="w-full py-2 bg-gray-100 rounded-lg">
        + Split Payment
      </button>

      <div className="border rounded-xl p-4 bg-white">
        <div className="flex justify-between text-sm">
          <span>Paid</span>
          <span>₹{paidAmount}</span>
        </div>

        <div className="flex justify-between font-bold text-lg mt-2">
          <span>Remaining</span>
          <span className={remaining === 0 ? 'text-green-600' : 'text-red-600'}>
            ₹{remaining}
          </span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading || remaining !== 0}
        className="w-full py-3 bg-green-600 text-white rounded-xl text-lg font-semibold"
      >
        {loading ? 'Processing...' : 'Complete Payment'}
      </button>

    </div>
  );
}