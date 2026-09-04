import InfoPage from '../components/InfoPage';

export default function FAQ() {
  return (
    <InfoPage eyebrow="FAQ" title="Frequently asked questions">
      <h3>What is ResumeFUT?</h3>
      <p>ResumeFUT turns a resume into a FIFA-Ultimate-Team-style player card rated out of 99, based on signals found in the resume.</p>

      <h3>Do I need an account or password?</h3>
      <p>No. You upload a resume or paste its text. ResumeFUT does not require you to log in to create a card.</p>

      <h3>How is my rating calculated?</h3>
      <p>Six scouting signals — experience, skills, leadership, impact, education and versatility — are mapped to football-style stats and combined into the overall rating.</p>

      <h3>What data does ResumeFUT use?</h3>
      <p>The service uses the information contained in the resume you provide. Public GitHub or LeetCode links found in a resume may also be used as additional scouting signals.</p>

      <h3>Can I customize my card?</h3>
      <p>Yes. You can edit the displayed name and add a photo or nationality to your card before downloading or sharing it.</p>

      <h3>What is Derby Mode?</h3>
      <p>Derby Mode lets you scout another resume and compare the two player cards head-to-head across their scouting stats.</p>

      <h3>Why is my score higher or lower than I expected?</h3>
      <p>The score reflects the strength and balance of the signals found in your resume. Missing details, limited evidence or uneven experience can affect individual stats.</p>

      <h3>Is ResumeFUT affiliated with GitFut, LeetFut or LinkedIn?</h3>
      <p>No. ResumeFUT is an independent open-source project and is not affiliated with those services.</p>
    </InfoPage>
  );
}
