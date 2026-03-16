'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ParcelPage() {
  const router = useRouter();

  useEffect(() => {
    const createParcel = async () => {
      try {
        const res = await fetch('/api/counter/parcel/create', {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          const text = await res.text();
          console.error('Parcel API error:', text);
          return;
        }

        const data = await res.json();

        router.replace(`/counter/parcel/order?orderId=${data.order._id}`);
      } catch (err) {
        console.error('Parcel create failed:', err);
      }
    };

    createParcel();
  }, [router]);

  return <div className="p-6 text-gray-500">Creating parcel order...</div>;
}
