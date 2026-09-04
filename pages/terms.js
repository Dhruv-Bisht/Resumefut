import InfoPage from '../components/InfoPage';

export default function Terms() {
  return (
    <InfoPage eyebrow="LEGAL" title="Terms & Conditions">
      <p><strong>Last updated: September 2026</strong></p>
      <p>By using ResumeFUT, you agree to these terms. ResumeFUT is a free, open-source fan project provided for entertainment and informational purposes.</p>

      <h2>Ratings are for fun</h2>
      <p>Cards, stats, positions, archetypes and ratings are playful interpretations of resume information. They are not an official assessment of skill, employability or professional ability.</p>

      <h2>Provided “as is”</h2>
      <p>The service is provided without warranties. Resume information or third-party profile data may be incomplete, delayed or inaccurate, and upstream services may occasionally be unavailable.</p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not use the service to harass, defame or target individuals.</li>
        <li>Do not attempt to overload, disrupt or abuse the service.</li>
        <li>Do not misrepresent ResumeFUT as an official product of another service.</li>
      </ul>

      <h2>Open source</h2>
      <p>ResumeFUT's source is available on <a href="https://github.com/Dhruv-Bisht/Resumefut" target="_blank" rel="noreferrer">GitHub</a>. Your use of the source code is governed by the project's license.</p>

      <h2>Changes</h2>
      <p>These terms may be updated over time. Continued use of the site after changes means you accept the updated terms.</p>
    </InfoPage>
  );
}
