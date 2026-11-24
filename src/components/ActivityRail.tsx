import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { timeAgo } from '../lib/format'
import { animate, stagger } from '../lib/motion'
import type { ActivityRow, Stats, User } from '../types'
import { Avatar } from './Avatar'

export default function ActivityRail() {
  const [activity, setActivity] = useState<ActivityRow[]>([])
  const [mentors, setMentors] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const barsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api<{ activity: ActivityRow[] }>('/activity?limit=6'),
      api<{ users: User[] }>('/users/suggested'),
      api<Stats>('/activity/stats'),
    ])
      .then(([activityData, peopleData, statsData]) => {
        if (cancelled) return
        setActivity(activityData.activity)
        setMentors(peopleData.users)
        setStats(statsData)
      })
      .catch(() => {
        /* the rail is secondary — the page still reads without it */
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!stats) return
    const bars = barsRef.current?.querySelectorAll<HTMLElement>('[data-bar]')
    if (bars && bars.length) {
      animate(bars, { scaleY: [0, 1], duration: 620, delay: stagger(45), ease: 'outQuad' })
    }
  }, [stats])

  const peak = Math.max(1, ...(stats?.last7Days.map((day) => day.count) ?? [1]))
  const weekTotal = stats?.last7Days.reduce((sum, day) => sum + day.count, 0) ?? 0

  return (
    <div className="space-y-7">
      <section>
        <h2 className="font-serif text-[15px] font-medium text-ink">What&apos;s happening</h2>
        <ul className="mt-1.5 border-t border-ink/15">
          {activity.map((row) => (
            <li key={row.id} className="border-b border-ink/10 py-2.5">
              <div className="flex items-start gap-2">
                {row.actor ? (
                  <Link to={`/profile/${row.actor.id}`} className="mt-0.5">
                    <Avatar name={row.actor.name} avatar={row.actor.avatar} size="xs" />
                  </Link>
                ) : null}
                <div className="min-w-0">
                  <p className="text-[12.5px] leading-snug text-ink/80">
                    {row.actor ? (
                      <Link
                        to={`/profile/${row.actor.id}`}
                        className="font-medium text-ink hover:text-pen"
                      >
                        {row.actor.name}
                      </Link>
                    ) : (
                      'A member'
                    )}{' '}
                    {row.text}
                  </p>
                  {row.postId && row.postTitle ? (
                    <Link
                      to={`/post/${row.postId}`}
                      className="mt-0.5 block font-serif text-[12.5px] italic leading-snug text-pen/90 hover:text-pen"
                    >
                      {row.postTitle}
                    </Link>
                  ) : null}
                  <p className="mt-0.5 text-[10.5px] text-inksoft">{timeAgo(row.createdAt)}</p>
                </div>
              </div>
            </li>
          ))}
          {!activity.length ? (
            <li className="py-3 text-[12px] text-inksoft">Nothing has happened yet today.</li>
          ) : null}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-[15px] font-medium text-ink">Mentors to reach out to</h2>
        <ul className="mt-1.5 border-t border-ink/15">
          {mentors.slice(0, 3).map((mentor) => (
            <li key={mentor.id} className="border-b border-ink/10 py-2.5">
              <Link to={`/profile/${mentor.id}`} className="group flex items-start gap-2">
                <Avatar name={mentor.name} avatar={mentor.avatar} size="xs" className="mt-0.5" />
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-medium text-ink group-hover:text-pen">
                    {mentor.name}
                  </span>
                  <span className="block truncate text-[11px] text-inksoft">{mentor.headline}</span>
                </span>
              </Link>
            </li>
          ))}
          {!mentors.length ? (
            <li className="py-3 text-[12px] text-inksoft">
              You already follow every mentor here.
            </li>
          ) : null}
        </ul>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-serif text-[15px] font-medium text-ink">Posts this week</h2>
          <span className="text-[11px] text-inksoft">{weekTotal} in seven days</span>
        </div>
        <div ref={barsRef} className="mt-3 flex h-20 items-end gap-2 border-b border-ink/15 pb-px">
          {stats?.last7Days.map((day, index, all) => (
            <div key={day.label} className="flex flex-1 flex-col items-center justify-end gap-1.5">
              <div className="flex h-16 w-full items-end">
                <div
                  data-bar
                  className={`w-full origin-bottom rounded-[1px] ${
                    index === all.length - 1 ? 'bg-pen' : 'bg-ink/30'
                  }`}
                  style={{ height: `${Math.max(6, (day.count / peak) * 100)}%` }}
                  title={`${day.count} ${day.count === 1 ? 'post' : 'posts'}`}
                />
              </div>
              <span className="text-[9.5px] text-inksoft">{day.label.slice(0, 1)}</span>
            </div>
          ))}
        </div>
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-inksoft">
          {stats
            ? `${stats.totals.members} members, ${stats.totals.mentors} of them mentors, and ${stats.totals.connections} mentorship${stats.totals.connections === 1 ? '' : 's'} agreed so far.`
            : 'Loading the week…'}
        </p>
      </section>
    </div>
  )
}
