import Header from './Header';

export default function InfoPage({ eyebrow, title, children }) {
  return (
    <div className="min-h-screen text-[#e7e9ee] font-body">
      <Header githubStars={null} />
      <main className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <p className="text-xs tracking-[0.22em] uppercase text-gold mb-3">{eyebrow}</p>
        <h1 className="font-display font-bold text-4xl md:text-6xl tracking-wide leading-none mb-10">{title}</h1>
        <article className="prose-resumefut">{children}</article>
      </main>
    </div>
  );
}
