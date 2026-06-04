'use client';
import dynamic from 'next/dynamic';
import EmptyState from './_components/emptyState/emptyState';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { existResume } from '@/app/Services/ResumeService';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import skStyles from './_components/preview/preview.module.css';

const Preview = dynamic(() => import('./_components/preview/preview'), { ssr: false });

function ResumeAnalyzerSkeleton() {
  return (
    <SkeletonTheme baseColor="#F3F4F6" highlightColor="#E5E7EB">
      <div className={skStyles.wrapper}>

        {/* ── Left column ──────────────────────────────────────── */}
        <div className={skStyles.leftCol}>

          {/* File bar */}
          <div className={skStyles.fileBar}>
            <Skeleton circle width={18} height={18} />
            <Skeleton width={110} height={13} borderRadius={4} style={{ flex: 1 }} />
            <Skeleton width={40} height={12} borderRadius={4} />
            <Skeleton width={88} height={28} borderRadius={6} />
            <Skeleton circle width={22} height={22} />
          </div>

          {/* Preview area */}
          <div className={skStyles.previewArea}>
            <div className={skStyles.skeletonPage}>
              <Skeleton width="55%" height={14} borderRadius={6} />
              <Skeleton width="75%" height={10} borderRadius={6} />
              <Skeleton width="90%" height={10} borderRadius={6} />
              <Skeleton width="45%" height={10} borderRadius={6} />
              <Skeleton width="90%" height={10} borderRadius={6} />
              <Skeleton width="75%" height={10} borderRadius={6} />
              <Skeleton width="60%" height={10} borderRadius={6} />
              <Skeleton width="85%" height={10} borderRadius={6} />
              <Skeleton width="45%" height={10} borderRadius={6} />
              <div className={skStyles.skChipsRow}>
                <Skeleton width={60} height={10} borderRadius={999} />
                <Skeleton width={60} height={10} borderRadius={999} />
              </div>
            </div>
          </div>

          {/* Download bar */}
          <div className={skStyles.downloadBar}>
            <Skeleton width={96} height={30} borderRadius={8} />
          </div>

        </div>

        {/* ── Right column ─────────────────────────────────────── */}
        <div className={skStyles.rightCol}>

          {/* Score card */}
          <div className={skStyles.card}>
            <div className={skStyles.scoreRow}>
              <Skeleton circle width={120} height={120} />
              <div className={skStyles.scoreInfo}>
                <Skeleton width={90} height={11} borderRadius={4} />
                <Skeleton width={150} height={26} borderRadius={6} />
                <Skeleton width="90%" height={13} borderRadius={4} />
                <Skeleton width="80%" height={13} borderRadius={4} />
                <Skeleton width={120} height={12} borderRadius={4} />
              </div>
            </div>
          </div>

          {/* Improvements card */}
          <div className={skStyles.card}>
            <div className={skStyles.sectionHeader}>
              <Skeleton circle width={20} height={20} />
              <Skeleton width={110} height={16} borderRadius={6} />
            </div>
            <div className={skStyles.section}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={skStyles.bulletItem}>
                  <Skeleton circle width={8} height={8} />
                  <Skeleton width={`${[85, 72, 90, 65][i]}%`} height={13} borderRadius={4} />
                </div>
              ))}
            </div>
          </div>

          {/* Re-analyze card */}
          <div className={skStyles.card}>
            <Skeleton width="100%" height={48} borderRadius={12} />
            <Skeleton width={120} height={13} borderRadius={4} style={{ display: 'block', margin: '10px auto 0' }} />
          </div>

        </div>
      </div>
    </SkeletonTheme>
  );
}

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

  if (loading) return <ResumeAnalyzerSkeleton />;

  return hasResume
      ? <Preview token={session.accessToken} onUploadNew={() => setHasResume(false)}/>
      : <EmptyState token={session.accessToken} onAnalyzed={(result) => { setHasResume(true) }}/>
}
