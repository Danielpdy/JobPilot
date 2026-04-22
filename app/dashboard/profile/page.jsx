'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  Pencil, Briefcase, Tag, FileText, ExternalLink,
  Clock, BarChart2, Activity, RefreshCw, Mail,
} from 'lucide-react';
import { getResume, getAnalysis, existResume } from '@/app/Services/ResumeService';
import { GetUserProfile, GetAnalysesUsed, GetJobRefreshesLeft } from '@/app/Services/UserService';
import styles from './page.module.css';

function Initials({ name }) {
  const letter = (name ?? '?').trim()[0] ?? '?';
  return <div className={styles.avatar}>{letter.toUpperCase()}</div>;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [profile,      setProfile]      = useState(null);
  const [resume,       setResume]       = useState(null);
  const [score,        setScore]        = useState(null);
  const [hasResume,    setHasResume]    = useState(false);
  const [analysesLeft,  setAnalysesLeft]  = useState(null);
  const [refreshesLeft, setRefreshesLeft] = useState(null);

  useEffect(() => {
    if (!token) return;

    GetUserProfile(token)
      .then(data => setProfile(data))
      .catch(err => console.error(err));

    GetAnalysesUsed(token)
      .then(data => setAnalysesLeft(data.resumeAnalyses))
      .catch(() => {});

    GetJobRefreshesLeft(token)
      .then(data => setRefreshesLeft(data.refreshesLeft))
      .catch(err => console.error('[JobRefreshesLeft]', err));

    existResume(token)
      .then(() => {
        setHasResume(true);
        return Promise.all([getResume(token), getAnalysis(token)]);
      })
      .then(([resumeData, analysisData]) => {
        setResume({ fileName: resumeData.fileName, fileSize: resumeData.fileSize });
        setScore(analysisData.resumeScore ?? null);
      })
      .catch(() => {});
  }, [token]);

  const fullName   = profile ? `${profile.userFirstName} ${profile.userLastName}` : '—';
  const scoreColor = score === null ? '#D1D5DB'
    : score >= 80 ? '#22c55e'
    : score >= 60 ? '#0992C2'
    : '#ef4444';

  return (
    <div className={styles.page}>

      {/* ── Left column ────────────────────────────────────────── */}
      <div className={styles.left}>

        {/* User header */}
        <div className={styles.card}>
          <div className={styles.userRow}>
            <Initials name={fullName} />
            <div className={styles.userInfo}>
              <p className={styles.userName}>{fullName}</p>
              <p className={styles.userTitle}>{profile?.userJobTitle ?? '—'}</p>
              <div className={styles.userMeta}>
                <span className={styles.userMetaItem}>
                  <Mail className={styles.userMetaIcon} />{profile?.userEmail ?? '—'}
                </span>
              </div>
            </div>
            <button className={styles.editBtn}>
              <Pencil className={styles.editIcon} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Career Information */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <Briefcase className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Career Information</h2>
          </div>
          <div className={styles.grid2}>
            <div className={styles.infoCell}>
              <p className={styles.infoCellLabel}>JOB TITLE</p>
              <p className={styles.infoCellValue}>{profile?.userJobTitle ?? '—'}</p>
            </div>
            <div className={styles.infoCell}>
              <p className={styles.infoCellLabel}>EXPERIENCE LEVEL</p>
              <p className={styles.infoCellValue}>{profile?.userExperienceLevel ?? '—'}</p>
            </div>
            <div className={styles.infoCell}>
              <p className={styles.infoCellLabel}>WORK TYPE</p>
              <p className={styles.infoCellValue}>{profile?.userWorkType ?? '—'}</p>
            </div>
            <div className={styles.infoCell}>
              <p className={styles.infoCellLabel}>SALARY RANGE</p>
              <p className={styles.infoCellValue}>{profile?.userSalaryRange ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* Skills & Tags */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <Tag className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Skills &amp; Tags</h2>
            <button className={styles.addSkillBtn}>
              <span className={styles.addSkillPlus}>+</span> Add Skill
            </button>
          </div>
          <div className={styles.chips}>
            {(profile?.userSkills ?? []).map(s => (
              <span key={s} className={styles.chip}>{s}</span>
            ))}
            {!profile?.userSkills?.length && (
              <p className={styles.noResume}>No skills added yet.</p>
            )}
          </div>
        </div>

        {/* Resume Context */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <FileText className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Resume Context</h2>
          </div>
          {hasResume && resume ? (
            <div className={styles.resumeRow}>
              <div className={styles.resumeIconWrap}>
                <FileText className={styles.resumeFileIcon} />
              </div>
              <div className={styles.resumeInfo}>
                <p className={styles.resumeName}>{resume.fileName}</p>
                {score !== null && (
                  <p className={styles.resumeSub}>
                    Last analyzed · Score&nbsp;
                    <strong style={{ color: scoreColor }}>{score}/100</strong>
                  </p>
                )}
                <div className={styles.scoreBarTrack}>
                  <div
                    className={styles.scoreBarFill}
                    style={{ width: `${score ?? 0}%`, background: scoreColor }}
                  />
                </div>
              </div>
              <button className={styles.viewBtn}>
                View <ExternalLink className={styles.viewIcon} />
              </button>
            </div>
          ) : (
            <p className={styles.noResume}>No resume uploaded yet.</p>
          )}
        </div>

      </div>

      {/* ── Right column ───────────────────────────────────────── */}
      <div className={styles.right}>

        {/* Resume Score */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <BarChart2 className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Resume Score</h2>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Latest score</span>
            <span className={styles.statValue} style={{ color: scoreColor }}>
              {score !== null ? score : '—'}
            </span>
          </div>
        </div>

        {/* Activity */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <Activity className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Activity</h2>
          </div>
          <div className={styles.activityList}>
            {[
              { Icon: Clock,     label: 'Last analysis',       value: 'April 17, 2026' },
              { Icon: FileText,  label: 'Resume analyses left', value: analysesLeft !== null ? `${analysesLeft}` : '—' },
              { Icon: RefreshCw, label: 'Job refreshes left',   value: refreshesLeft !== null ? `${refreshesLeft}` : '—' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className={styles.activityItem}>
                <div className={styles.activityIconWrap}>
                  <Icon className={styles.activityIcon} />
                </div>
                <div>
                  <p className={styles.activityLabel}>{label}</p>
                  <p className={styles.activityValue}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
