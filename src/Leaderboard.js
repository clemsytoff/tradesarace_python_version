'use client';

import { useEffect, useState } from 'react';

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    let intervalId;

    async function loadLeaderboard(showLoading = false) {
      if (showLoading) setIsLoading(true);

      try {
        const response = await fetch('/api/leaderboard?limit=10', {
          cache: 'no-store',
        });
        const payload = await response.json();

        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.message || 'Failed to load leaderboard.');
        }

        if (isActive) {
          setRows(payload.leaderboard || []);
          setError('');
        }
      } catch (fetchError) {
        if (isActive) {
          setError(fetchError.message || 'Unable to load leaderboard.');
        }
      } finally {
        if (isActive && showLoading) setIsLoading(false);
      }
    }

    loadLeaderboard(true);
    intervalId = setInterval(() => loadLeaderboard(false), 10000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="leaderboard-panel">
      <div className="leaderboard-head">
        <h2>Leaderboard</h2>
        <span>Wallet USD</span>
      </div>

      {isLoading && <p className="leaderboard-note">Loading leaderboard...</p>}
      {!isLoading && error && <p className="leaderboard-note error">{error}</p>}
      {!isLoading && !error && rows.length === 0 && (
        <p className="leaderboard-note">No ranked users yet.</p>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <div className="leaderboard-list">
          {rows.map((entry) => (
            <article key={entry.id} className="leaderboard-row">
              <span className="leaderboard-rank">#{entry.rank}</span>
              <div className="leaderboard-user">
                <strong>{entry.name}</strong>
                {/* <small>{entry.emailMasked}</small> */}
              </div>
              <strong className="leaderboard-balance">{formatCurrency(entry.usdBalance)}</strong>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
