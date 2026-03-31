'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapPin,
  faDollarSign,
  faArrowUpRightFromSquare,
  faHeartCrack,
  faMagnifyingGlass,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { useSwipesStore } from '@/app/stores/swipeStore';
import styles from './page.module.css';
import { GetLikedJobs } from '@/app/Services/JobService';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
  exit:     { opacity: 0, scale: 0.88, transition: { duration: 0.18 } },
};

export default function JobMatches({ accessToken }) {
  const likedJobs = useSwipesStore(s => s.likedJobs);
  const unlikeJob = useSwipesStore(s => s.unlikeJob);

  const [search, setSearch] = useState('');
  const [sort, setSort]     = useState('recent');

  useEffect(() => {
    if(!accessToken) return;

    getlikedJobs();
  }, [accessToken])

  const filtered = useMemo(() => {
    let list = [...likedJobs];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        j.company?.toLowerCase().includes(q)
      );
    }
    if (sort === 'salary-high') list.sort((a, b) => (b.salaryMax ?? 0) - (a.salaryMax ?? 0));
    if (sort === 'salary-low')  list.sort((a, b) => (a.salaryMin ?? 0) - (b.salaryMin ?? 0));
    return list;
  }, [likedJobs, search, sort]);

  const getlikedJobs = async () => {
    try{
      await GetLikedJobs(accessToken);
    } catch(error){
      console.error(error);
    }
  }

  return (
    <div className={styles.wrapper}>

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <h2 className={styles.count}>
          {likedJobs.length} liked job{likedJobs.length !== 1 ? 's' : ''}
        </h2>
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search by title or company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.selectWrapper}>
            <select
              className={styles.sortSelect}
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="salary-high">Salary: High to Low</option>
              <option value="salary-low">Salary: Low to High</option>
            </select>
            <FontAwesomeIcon icon={faChevronDown} className={styles.selectIcon} />
          </div>
        </div>
      </div>

      {/* ── Empty state ────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <motion.div
          className={styles.emptyState}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        >
          <span className={styles.emptyEmoji}>💼</span>
          <h3>{search ? 'No jobs match your search.' : 'No liked jobs yet.'}</h3>
          <p>{search ? 'Try a different search term.' : 'Start swiping to save jobs you like.'}</p>
        </motion.div>
      )}

      {/* ── Grid ──────────────────────────────────────────────── */}
      <motion.div
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {filtered.map(job => (
            <motion.div
              key={job.id}
              className={styles.card}
              variants={cardVariants}
              exit="exit"
              layout
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(11,45,114,0.15)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              {/* Header */}
              <div className={styles.cardHeader}>
                <div className={styles.logoBox} style={{ background: job.logoColor }}>
                  {job.logoEmoji}
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.companyName}>{job.company}</span>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                </div>
                <span className={styles.postedBadge}>{job.postedAt}</span>
              </div>

              {/* Meta */}
              <div className={styles.metaRow}>
                {job.location && (
                  <span className={styles.metaItem}>
                    <FontAwesomeIcon icon={faMapPin} className={styles.metaIcon} />
                    {job.location}
                  </span>
                )}
                {(job.salaryMin || job.salaryMax) && (
                  <span className={styles.metaItem}>
                    <FontAwesomeIcon icon={faDollarSign} className={styles.metaIcon} />
                    {job.salaryMin?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                    {' – '}
                    {job.salaryMax?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                  </span>
                )}
                {job.contractTime && (
                  <span className={styles.badge}>
                    {job.contractTime === 'full_time' ? 'Full Time' : 'Part Time'}
                  </span>
                )}
                {job.category && (
                  <span className={styles.badge}>{job.category}</span>
                )}
              </div>

              {/* Description */}
              <p className={styles.description}>{job.description}</p>

              {/* Skill tags */}
              {job.tags?.length > 0 && (
                <div className={styles.tagsRow}>
                  {job.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className={styles.cardFooter}>
                <a
                  href={job.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewBtn}
                  onClick={e => e.stopPropagation()}
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className={styles.btnIcon} />
                  View Job
                </a>
                <button className={styles.unlikeBtn} onClick={() => unlikeJob(job.id)}>
                  <FontAwesomeIcon icon={faHeartCrack} className={styles.btnIcon} />
                  Unlike
                </button>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

    </div>
  );
}
