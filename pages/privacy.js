import InfoPage from '../components/InfoPage';

export default function Privacy() {
  return (
    <InfoPage eyebrow="LEGAL" title="Privacy Policy">
      <p><strong>Last updated: September 2026</strong></p>
      <p>ResumeFUT is designed to be data-light. This page explains what information is used when you create a card.</p>

      <h2>What we read</h2>
      <p>When you scout a resume, ResumeFUT processes the resume text or PDF you provide to extract the information needed to generate the card. Public GitHub or LeetCode profiles linked from the resume may also be fetched for additional scouting signal.</p>

      <h2>What we don't collect</h2>
      <ul>
        <li>No sign-up or account password is required.</li>
        <li>No private GitHub or LeetCode account data is intentionally accessed.</li>
        <li>We do not sell personal data to advertisers.</li>
      </ul>

      <h2>Third-party services</h2>
      <p>ResumeFUT may use GitHub and LeetCode public endpoints when a resume contains relevant public profile links. Hosting and analytics providers may also process standard technical information needed to operate the website.</p>

      <h2>Cookies</h2>
      <p>The site may use browser storage for local features such as the number of cards rated on your device. This is not a user account or authentication system.</p>

      <h2>Contact</h2>
      <p>Questions about privacy? Visit the <a href="/contact">contact page</a>.</p>
    </InfoPage>
  );
}
