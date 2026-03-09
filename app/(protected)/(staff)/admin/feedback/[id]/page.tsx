'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FeedbackDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/feedback?id=${id}`);
  }, []);

  return <div className="p-6">Feedback Detail Page</div>;
}
