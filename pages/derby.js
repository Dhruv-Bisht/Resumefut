import { useState } from 'react';
import Header from '../components/Header';
import ResumeUploader from '../components/ResumeUploader';
import PlayerCard from '../components/PlayerCard';

const STAT_LABELS = {
  exp: 'Experience',
  skl: 'Skills',
  led: 'Leadership',
  imp: 'Impact',
  edu: 'Education',
  ver: 'Versatility',
};

function decideWinner(cardA, cardB) {
  let winsA = 0;
  let winsB = 0;
  const rows = cardA.statList.map((statA, i) => {
    const statB = cardB.statList[i];
    let winner = null;
    if (statA.value > statB.value) {
      winner = 'a';
      winsA += 1;
    } else if (statB.value > statA.value) {
      winner = 'b';
      winsB += 1;
    }
    return { key: statA.key, label: STAT_LABELS[statA.key], a: statA.value, b: statB.value, winner };
  });

  let overallWinner = null;
  if (winsA > winsB) overallWinner = 'a';
  else if (winsB > winsA) overallWinner = 'b';
  else if (cardA.overall > cardB.overall) overallWinner = 'a';
  else if (cardB.overall > cardA.overall) overallWinner = 'b';

  return { rows, winsA, winsB, overallWinner };
}

export default function Derby() {
  const [slotA, setSlotA] = useState({ text: '', photo: '', flag: '' });
  const [slotB, setSlotB] = useState({ text: '', photo: '', flag: '' });
  const [status, setStatus] = useState('idle'); // idle | scoring | done | error
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { cardA, cardB, battle }

  async function scoreOne(text) {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    return data.card;
  }

  async function startDerby() {
    if (!slotA.text || slotA.text.trim().length < 30) {
      setError('Player A needs a full resume — upload a PDF or paste more text.');
      return;
    }
    if (!slotB.text || slotB.text.trim().length < 30) {
      setError('Player B needs a full resume — upload a PDF or paste more text.');
      return;
    }
    setError('');
    setStatus('scoring');
    try {
      const [cardA, cardB] = await Promise.all([scoreOne(slotA.text), scoreOne(slotB.text)]);
      cardA.photo = slotA.photo;
      cardA.flag = slotA.flag;
      cardB.photo = slotB.photo;
      cardB.flag = slotB.flag;
      const battle = decideWinner(cardA, cardB);
      setResult({ cardA, cardB, battle });
      setStatus('done');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong running the derby.');
      setStatus('error');
    }
  }

  function reset() {
    setResult(null);
    setStatus('idle');
    setError('');
    setSlotA({ text: '', photo: '', flag: '' });
    setSlotB({ text: '', photo: '', flag: '' });
  }

  if (result) {
    const { cardA, cardB, battle } = result;
    const winnerName = battle.overallWinner === 'a' ? cardA.name : battle.overallWinner === 'b' ? cardB.name : null;

    return (
      <div className="min-h-screen bg-ink text-[#e7e9ee] font-body">
        <Header onBack={reset} />

        <main className="max-w-5xl mx-auto px-6 md:px-10 py-10">
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-3xl tracking-wide">
              {winnerName ? (
                <>
                  <span className="text-gold">{winnerName}</span> wins the derby
                </>
              ) : (
                "It's a draw"
              )}
            </h1>
            <p className="text-sm text-[#9aa0b0] mt-2">
              {battle.winsA} categories to {battle.winsB}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mb-10">
            <div className={battle.overallWinner === 'a' ? 'scale-105 transition' : 'opacity-80 transition'}>
              <PlayerCard card={cardA} cardRef={null} />
            </div>
            <div className="font-display font-bold text-2xl text-[#565c6b] px-4">VS</div>
            <div className={battle.overallWinner === 'b' ? 'scale-105 transition' : 'opacity-80 transition'}>
              <PlayerCard card={cardB} cardRef={null} />
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-panel border border-hairline rounded-lg p-6">
            <div className="flex items-center justify-between text-xs tracking-[0.15em] text-[#9aa0b0] mb-4">
              <span className="w-24 truncate">{cardA.name}</span>
              <span>STAT</span>
              <span className="w-24 text-right truncate">{cardB.name}</span>
            </div>
            {battle.rows.map((row) => (
              <div key={row.key} className="flex items-center justify-between py-2 border-b border-hairline/60 last:border-0">
                <span
                  className={`w-16 text-lg font-display font-bold ${
                    row.winner === 'a' ? 'text-gold' : 'text-[#c7cbd6]'
                  }`}
                >
                  {row.a}
                </span>
                <span className="text-xs text-[#9aa0b0] tracking-wide">{row.label}</span>
                <span
                  className={`w-16 text-lg font-display font-bold text-right ${
                    row.winner === 'b' ? 'text-gold' : 'text-[#c7cbd6]'
                  }`}
                >
                  {row.b}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-3 mt-2 border-t border-hairline">
              <span className="w-16 text-xl font-display font-bold">{cardA.overall}</span>
              <span className="text-xs tracking-[0.15em] text-[#9aa0b0]">OVERALL</span>
              <span className="w-16 text-xl font-display font-bold text-right">{cardB.overall}</span>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              type="button"
              onClick={reset}
              className="bg-gold text-[#20180a] font-display font-semibold tracking-wide px-6 py-2.5 rounded-md"
            >
              Run another derby
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-[#e7e9ee] font-body">
      <Header onBack={reset} />

      <main className="max-w-4xl mx-auto px-6 md:px-10 py-14">
        <div className="text-center max-w-lg mx-auto mb-10">
          <h1 className="font-display font-bold text-4xl tracking-wide">
            DERBY <span className="text-gold">MODE</span>
          </h1>
          <p className="mt-3 text-[#b7bcc9] text-[15px] leading-relaxed">
            Upload two resumes and settle it stat by stat — like a card-battle
            game, but the deck is your career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResumeUploader title="Player A" compact onChange={setSlotA} />
          <ResumeUploader title="Player B" compact onChange={setSlotB} />
        </div>

        {error && <p className="text-sm text-red-400 mt-6 text-center">{error}</p>}

        <div className="text-center mt-8">
          <button
            type="button"
            onClick={startDerby}
            disabled={status === 'scoring'}
            className="bg-gold text-[#20180a] font-display font-semibold tracking-wide px-8 py-3 rounded-md disabled:opacity-50"
          >
            {status === 'scoring' ? 'Scouting both…' : '⚔️ Start Derby'}
          </button>
        </div>
      </main>
    </div>
  );
}
