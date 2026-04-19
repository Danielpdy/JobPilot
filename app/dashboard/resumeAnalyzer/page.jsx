'use client';
import dynamic from 'next/dynamic';
import EmptyState from './_components/emptyState/emptyState';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { existResume } from '@/app/Services/ResumeService';

const Preview = dynamic(() => import('./_components/preview/preview'), { ssr: false });

export default function ResumeAnalyzer() {
  const { data: session } = useSession();
  const [hasResume, setHasResume] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  {/* useEffect(() => {
    if (!session?.accessToken) return;

    fetch(`${API_BASE_URL}/resumeanalyzer/preview`, {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    })
      .then(res => {
        setHasResume(res.ok);
      })
      .finally(() => setLoading(false));
  }, [session]);*/}

  useEffect(() => {
    if (!session?.accessToken) return;

    isResume();
  }, [session]);

  const isResume = async () => {
    try{
      await existResume(session.accessToken);
      setHasResume(true);
      
    } catch(error){
      setHasResume(false);
    } finally{
      setLoading(false);
    }
  }

  if (loading) return null;

  return hasResume
      ? <Preview token={session.accessToken} onUploadNew={() => setHasResume(false)}/>
      : <EmptyState token={session.accessToken} onAnalyzed={(result) => { setHasResume(true) }}/>
}
