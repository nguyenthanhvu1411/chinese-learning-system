import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink-900 mb-8 animate-fade-in">
          Chinh phục tiếng Trung <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
            dễ dàng hơn bao giờ hết
          </span>
        </h1>
        
        <p className="mt-4 max-w-2xl text-xl text-ink-500 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Hệ thống học tiếng Trung thông minh với phương pháp lặp lại ngắt quãng (Spaced Repetition) giúp bạn ghi nhớ từ vựng lâu hơn và hiệu quả hơn.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link href="/register" className="btn-primary text-lg px-8 py-4">
            Bắt đầu học miễn phí
          </Link>
          <Link href="/vocabularies" className="btn-secondary text-lg px-8 py-4">
            Tra cứu từ vựng
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="w-full bg-white border-y border-ink-100 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-ink-900">Tại sao chọn HANYU?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center p-8">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-4">Lặp lại ngắt quãng</h3>
              <p className="text-ink-500">Thuật toán thông minh tự động lên lịch ôn tập vào thời điểm tối ưu nhất giúp bạn không bao giờ quên từ đã học.</p>
            </div>
            
            <div className="card text-center p-8">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-4">Kho từ vựng chuẩn HSK</h3>
              <p className="text-ink-500">Hệ thống từ vựng bám sát giáo trình HSK mới nhất, đầy đủ pinyin, nghĩa, và ví dụ sinh động.</p>
            </div>
            
            <div className="card text-center p-8">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-4">Trải nghiệm mượt mà</h3>
              <p className="text-ink-500">Giao diện tối giản, tập trung tối đa vào việc học giúp bạn không bị phân tâm.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
