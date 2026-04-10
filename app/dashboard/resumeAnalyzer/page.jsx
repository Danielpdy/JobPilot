'use client';
import Preview from './_components/preview/preview';
import EmptyState from './_components/emptyState/emptyState';
import { useSession } from 'next-auth/react';

export default function ResumeAnalyzer() {
  const { data: session } = useSession();
  return (
    <div>
      
      <EmptyState token={session.accessToken}/>
    </div>
  );
}
