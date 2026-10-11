'use client';

import { useEffect, useState } from 'react';
import { CallView, pickCall } from '../CallPopup/CallPopup';
import { DEFAULT_CALL } from '../../constants/call';

// Уведомление о вызове на отдельной странице. /call — вызов по умолчанию,
// /call?doctor=smirnova — вызов от конкретного врача (как callPatient('smirnova'))
export default function CallScreen() {
  const [call, setCall] = useState(DEFAULT_CALL);

  useEffect(() => {
    const doctorId = new URLSearchParams(window.location.search).get('doctor');
    if (doctorId) setCall(pickCall(doctorId));
  }, []);

  return <CallView call={call} />;
}
