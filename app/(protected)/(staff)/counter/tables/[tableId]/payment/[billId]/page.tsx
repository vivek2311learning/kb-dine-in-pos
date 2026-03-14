'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type PaymentMethod = 'cash' | 'upi' | 'card';

interface PaymentRow {
method: PaymentMethod;
amount: number;
}

export default function PaymentPage() {

const params = useParams<{ billId: string; tableId: string }>();
const router = useRouter();

const billId = params.billId;
const tableId = params.tableId;

const [totalAmount, setTotalAmount] = useState(0);

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

    setPayments([
      { method: 'cash', amount: data.bill.totalAmount }
    ]);

  }

};

fetchBill();

}, [billId]);

/* ---------------- CALCULATIONS ---------------- */

const paidAmount = payments.reduce(
(sum, p) => sum + Number(p.amount || 0),
0
);

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

setPayments([
  ...payments,
  { method: 'cash', amount: 0 }
]);

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
  body: JSON.stringify({ payments }),
});

const data = await res.json();

if (!res.ok) {
  alert(data.error);
  setLoading(false);
  return;
}

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
<div className="p-8 max-w-xl mx-auto space-y-6">

  <h1 className="text-3xl font-bold text-center">
    Payment
  </h1>

  {/* TOTAL CARD */}

  <div className="border rounded-xl p-6 text-center">

    <p className="text-sm">
      Total Amount
    </p>

    <p className="text-3xl font-bold mt-1">
      ₹{totalAmount}
    </p>

  </div>

  {/* PAYMENT ROWS */}

  <div className="space-y-4">

    {payments.map((p, i) => (

      <div
        key={i}
        className="border rounded-xl p-4 grid grid-cols-2 gap-4"
      >

        <div>

          <label className="text-sm font-medium" htmlFor={`method-${i}`}>
            Method
          </label>

          <select
            id={`method-${i}`}
            value={p.method}
            onChange={(e) =>
              updateMethod(i, e.target.value as PaymentMethod)
            }
            className="border rounded-lg p-2 w-full mt-1"
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>

        </div>

        <div>

          <label className="text-sm font-medium" htmlFor={`amount-${i}`}>
            Amount
          </label>

          <input
            id={`amount-${i}`}
            type="number"
            value={p.amount}
            onChange={(e) =>
              updateAmount(i, Number(e.target.value))
            }
            className="border rounded-lg p-2 w-full mt-1"
          />

        </div>

      </div>

    ))}

  </div>

  {/* ADD SPLIT */}

  <button
    onClick={addPaymentRow}
    className="w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
  >
    + Add Split Payment
  </button>

  {/* SUMMARY */}

  <div className="border rounded-xl p-4 space-y-2">

    <div className="flex justify-between">
      <span>Paid</span>
      <span>₹{paidAmount}</span>
    </div>

    <div className="flex justify-between font-semibold text-lg">

      <span>Remaining</span>

      <span className={remaining === 0 ? 'text-green-600' : 'text-red-600'}>
        ₹{remaining}
      </span>

    </div>

  </div>

  {/* COMPLETE PAYMENT */}

  <button
    onClick={handlePayment}
    disabled={loading || remaining !== 0}
    className="w-full py-3 bg-green-600 text-white rounded-xl text-lg font-semibold hover:bg-green-700 transition"
  >

    {loading ? 'Processing...' : 'Complete Payment'}

  </button>

</div>

);

}