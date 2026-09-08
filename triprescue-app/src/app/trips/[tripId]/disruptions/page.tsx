'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function DisruptionsRedirect() {
  const router = useRouter();
  const params = useParams();
  const tripId = params?.tripId || 'trip_001';

  useEffect(() => {
    router.replace(`/trips/${tripId}/disruption`);
  }, [router, tripId]);

  return null;
}
