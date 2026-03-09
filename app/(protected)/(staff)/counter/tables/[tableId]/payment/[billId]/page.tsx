'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type PaymentMethod = 'cash' | 'upi' | 'card';

interface PaymentRow {
  method: PaymentMethod;
  amount: number;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();

  const billId = params.billId as string;
  const tableId = params.tableId as string;

  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [payments, setPayments] = useState<PaymentRow[]>([
    { method: 'cash', amount: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH BILL ---------------- */

  useEffect(() => {
    if (!billId) return;

    const fetchBill = async () => {
      const res = await fetch(`/api/counter/bills/${billId}`);
      const data = await res.json();

      if (res.ok && data?.bill?.totalAmount) {
        setTotalAmount(data.bill.totalAmount);
        setPayments([{ method: 'cash', amount: data.bill.totalAmount }]);
      }
    };

    fetchBill();
  }, [billId]);

  /* ---------------- CALCULATIONS ---------------- */

  const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const remaining = totalAmount - paidAmount;

  /* ---------------- UPDATE FUNCTIONS ---------------- */

  const updateMethod = (index: number, value: PaymentMethod) => {
    const updated = [...payments];
    updated[index].method = value;
    setPayments(updated);
  };

  const updateAmount = (index: number, value: number) => {
    const updated = [...payments];
    updated[index].amount = value;
    setPayments(updated);
  };

  const addPaymentRow = () => {
    setPayments([...payments, { method: 'cash', amount: 0 }]);
  };

  /* ---------------- COMPLETE PAYMENT ---------------- */

  const handlePayment = async () => {
    if (!billId) return;

    if (remaining !== 0) {
      alert('Payment total mismatch');
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/counter/bills/${billId}/pay`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payments,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      setLoading(false);
      return;
    }

    // 🔥 Get bill again to extract orderId
    const billRes = await fetch(`/api/counter/bills/${billId}`);
    const billData = await billRes.json();

    const orderId = billData?.bill?.orderId;

    setLoading(false);

    if (!orderId) {
      alert('Order not found');
      return;
    }

    router.push(`/counter/tables/${tableId}/feedback/${orderId}`);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Payment</h1>

      <div className="mb-4 text-lg font-semibold">Total: ₹{totalAmount}</div>

      {payments.map((p, i) => (
        <div key={i} className="mb-4 border p-4 rounded">
          <label htmlFor={`method-${i}`} className="block mb-1 font-medium">
            Payment Method
          </label>

          <select
            id={`method-${i}`}
            value={p.method}
            onChange={(e) => updateMethod(i, e.target.value as PaymentMethod)}
            className="border p-2 w-full mb-3 rounded"
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>

          <label htmlFor={`amount-${i}`} className="block mb-1 font-medium">
            Amount
          </label>

          <input
            id={`amount-${i}`}
            type="number"
            value={p.amount}
            onChange={(e) => updateAmount(i, Number(e.target.value))}
            className="border p-2 w-full rounded"
          />
        </div>
      ))}

      <button
        onClick={addPaymentRow}
        className="mb-4 bg-gray-200 px-4 py-2 rounded w-full"
      >
        + Add Split Payment
      </button>

      <div className="mb-2">Paid: ₹{paidAmount}</div>

      <div className="mb-4 font-semibold">Remaining: ₹{remaining}</div>

      <button
        onClick={handlePayment}
        disabled={loading || remaining !== 0}
        className="bg-green-600 text-white px-6 py-2 rounded w-full"
      >
        {loading ? 'Processing...' : 'Complete Payment'}
      </button>
    </div>
  );
}
