import InfoPage from '../components/InfoPage';

export default function About() {
  return (
    <InfoPage eyebrow="ABOUT" title="What is ResumeFUT?">
      <p><strong>ResumeFUT</strong> turns a resume into a World-Cup / FIFA-Ultimate-Team-style <strong>player card rated out of 99</strong>. Upload a resume, and it scouts the profile, reads the signals inside it, and prints a card with a position, an archetype and a finish.</p>
      <p>There are no surveys and nothing to fill out. The goal is simple: turn a traditional resume into a visual, shareable snapshot of the candidate.</p>

      <h2>How the scouting works</h2>
      <p>ResumeFUT reads the resume and maps the information it finds into six football-style scouting stats:</p>
      <ul>
        <li><strong>Experience (EXP)</strong> — roles, years, tenure and seniority.</li>
        <li><strong>Skills (SKL)</strong> — technologies, tools and technical breadth.</li>
        <li><strong>Leadership (LED)</strong> — ownership, mentoring and leadership signals.</li>
        <li><strong>Impact (IMP)</strong> — quantified achievements, outcomes and project results.</li>
        <li><strong>Education (EDU)</strong> — degrees, certifications and academic credentials.</li>
        <li><strong>Versatility (VER)</strong> — different roles, industries and technical areas represented.</li>
      </ul>
      <p>Your <strong>overall</strong> is a weighted blend of these signals rather than a simple flat average.</p>

      <h2>Card &amp; customization</h2>
      <p>Every card gets a position, archetype and tier based on the scouting profile. You can then personalize the card with your name, photo and nationality before downloading or sharing it.</p>

      <h2>Built with</h2>
      <p>Next.js, React and Tailwind CSS. ResumeFUT is an open-source fan project inspired by <a href="https://gitfut.com/" target="_blank" rel="noreferrer">GitFut</a> and <a href="https://leetfut-one.vercel.app/" target="_blank" rel="noreferrer">LeetFut</a>.</p>
    </InfoPage>
  );
}
