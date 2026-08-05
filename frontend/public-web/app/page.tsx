import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4">
      <div className="max-w-3xl text-center space-y-8 animate-slide-up">
        <h1 className="text-5xl md:text-7xl font-bold text-ink-900 tracking-tight">
          Master Chinese<br />
          <span className="text-primary-600 font-serif font-normal">一步一步</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-ink-600 max-w-2xl mx-auto leading-relaxed">
          The most efficient way to learn Chinese vocabulary, characters, and grammar. Built for serious learners.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/register" className="btn-primary text-lg px-8 py-4">
            Start Learning Free
          </Link>
          <Link href="/dictionary" className="btn-secondary text-lg px-8 py-4">
            Browse Dictionary
          </Link>
        </div>
        
        <div className="mt-16 pt-16 border-t border-ink-100 flex flex-col md:flex-row gap-8 text-left">
          <div className="flex-1 card">
            <h3 className="text-xl font-bold text-ink-900 mb-2">HSK Aligned</h3>
            <p className="text-ink-600">Structured vocabulary lists perfectly aligned with the standard HSK levels 1-6.</p>
          </div>
          <div className="flex-1 card">
            <h3 className="text-xl font-bold text-ink-900 mb-2">Spaced Repetition</h3>
            <p className="text-ink-600">Our algorithm ensures you review words right before you forget them.</p>
          </div>
          <div className="flex-1 card">
            <h3 className="text-xl font-bold text-ink-900 mb-2">Deep Dictionary</h3>
            <p className="text-ink-600">Detailed character breakdowns, audio pronunciation, and example sentences.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
