'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RecoveryConfirmRedirect() {
  const router = useRouter();
  const params = useParams();
  const tripId = params?.tripId || 'trip_001';

  useEffect(() => {
    router.replace(`/trips/${tripId}/confirm`);
  }, [router, tripId]);

  return null;
}
