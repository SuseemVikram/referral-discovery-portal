import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api-config';
import AnimatedSection, { AnimatedCounter } from './components/AnimatedSection';
import FloatingCard from './components/FloatingCard';

// Fetch stats from backend with caching
async function getStats() {
  try {
    // Use API_BASE_URL for consistency (works in both client and server)
    const apiUrl = API_BASE_URL;
    const response = await fetch(`${apiUrl}/api/candidates?limit=1`, {
      next: { revalidate: 60 }, // Cache for 60 seconds (ISR)
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const total = data.pagination?.total || 0;
      return {
        totalCandidates: total,
      };
    }
    // Silently fail in production, log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Stats fetch failed:', response.status, response.statusText);
    }
  } catch (error) {
    // Silently fail in production, log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch stats:', error);
    }
  }
  // Return 0 if fetch fails (fallback)
  return { totalCandidates: 0 };
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section - CodingNinjas style gradient */}
      <section className="relative overflow-hidden">
        {/* Background - Peachy pink to mint gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fce4ec] via-[#fff8e1] to-[#e8f5e9]" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 left-0 w-96 h-96 bg-[#ffccbc] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#c8e6c9] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <AnimatedSection animation="fade" delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur border border-orange-200 rounded-full text-sm font-medium text-slate-700 mb-8 shadow-sm">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                {stats.totalCandidates > 0 ? (
                  <span>{stats.totalCandidates}+ verified candidates ready for referral</span>
                ) : (
                  <span>Freshers to Senior Professionals</span>
                )}
              </div>
            </AnimatedSection>

            {/* Headline */}
            <AnimatedSection animation="reveal" delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                Refer{' '}
                <span className="text-orange-500">
                  Verified Tech Talent
                </span>
                {' '}to Your Company
          </h1>
            </AnimatedSection>

            {/* Subheadline */}
            <AnimatedSection animation="reveal" delay={200}>
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                From fresh graduates to experienced professionals - browse verified candidates with proven skills, 
                real projects, and strong fundamentals. Find the perfect match for any role at your company.
              </p>
            </AnimatedSection>

            {/* CTA Buttons */}
            <AnimatedSection animation="reveal" delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/candidates"
                  className="w-full sm:w-auto px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 text-center"
                >
                  Find Candidates to Refer
                </Link>
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all hover:-translate-y-0.5 text-center"
                >
                  Create Referrer Account
                </Link>
              </div>
            </AnimatedSection>

            {/* Trust Indicators */}
            <AnimatedSection animation="fade" delay={400}>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Freshers to 5+ YOE</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Verified skills & projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Interview ready</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 50L48 45.7C96 41.3 192 32.7 288 35.8C384 39 480 54 576 60.2C672 66.3 768 63.7 864 56.5C960 49.3 1056 37.7 1152 35.8C1248 34 1344 42 1392 46L1440 50V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Candidate Experience Levels */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection animation="reveal" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Candidates for Every Role</h2>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">From freshers to seasoned professionals — find the right fit for your team</p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatedSection animation="reveal" delay={0}>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 text-center border border-orange-100 hover:shadow-md transition-all hover:-translate-y-1 h-full flex flex-col">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-lg font-bold text-slate-900 mb-2 flex-shrink-0">Freshers</div>
                <div className="text-sm text-slate-500 flex-1 flex items-center justify-center">Training program graduates ready for first role</div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="reveal" delay={100}>
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 text-center border border-amber-100 hover:shadow-md transition-all hover:-translate-y-1 h-full flex flex-col">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-lg font-bold text-slate-900 mb-2 flex-shrink-0">1-3 Years</div>
                <div className="text-sm text-slate-500 flex-1 flex items-center justify-center">Junior developers with hands-on experience</div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="reveal" delay={200}>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-100 hover:shadow-md transition-all hover:-translate-y-1 h-full flex flex-col">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="text-lg font-bold text-slate-900 mb-2 flex-shrink-0">3-5 Years</div>
                <div className="text-sm text-slate-500 flex-1 flex items-center justify-center">Mid-level professionals with proven track record</div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="reveal" delay={300}>
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 text-center border border-teal-100 hover:shadow-md transition-all hover:-translate-y-1 h-full flex flex-col">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="text-lg font-bold text-slate-900 mb-2 flex-shrink-0">5+ Years</div>
                <div className="text-sm text-slate-500 flex-1 flex items-center justify-center">Senior engineers & leads</div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* What We Verify */}
      <section id="verification" className="py-16 md:py-20 bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection animation="reveal" className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100/50 border border-orange-200 rounded-full text-sm font-medium text-orange-700 mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Quality Assurance
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Every Candidate is Verified</h2>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Whether fresher or experienced, every candidate goes through our comprehensive verification process to ensure quality and readiness
            </p>
          </AnimatedSection>

          <div className="relative">
            {/* Connection Line - Enhanced */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-orange-200 via-amber-200 to-green-200 -translate-y-1/2 rounded-full opacity-60" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
              {/* Step 1 */}
              <AnimatedSection animation="fade-left" delay={0}>
                <div className="group bg-white border-2 border-slate-200 rounded-2xl p-5 lg:p-6 relative z-10 hover:border-orange-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white mb-5 mx-auto shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Profile Review</h3>
                    <p className="text-sm text-slate-600 text-center leading-relaxed flex-1">
                      Background, education, and experience verification
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              {/* Step 2 */}
              <AnimatedSection animation="fade-left" delay={100}>
                <div className="group bg-white border-2 border-slate-200 rounded-2xl p-6 lg:p-8 relative z-10 hover:border-amber-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white mb-5 mx-auto shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Skills Assessment</h3>
                    <p className="text-sm text-slate-600 text-center leading-relaxed flex-1">
                      Technical skills validated through assessments or project review
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              {/* Step 3 */}
              <AnimatedSection animation="fade-left" delay={200}>
                <div className="group bg-white border-2 border-slate-200 rounded-2xl p-5 lg:p-6 relative z-10 hover:border-yellow-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-white mb-5 mx-auto shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Project Portfolio</h3>
                    <p className="text-sm text-slate-600 text-center leading-relaxed flex-1">
                      Real projects showcasing practical skills and problem-solving
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              {/* Step 4 */}
              <AnimatedSection animation="fade-left" delay={300}>
                <div className="group bg-white border-2 border-slate-200 rounded-2xl p-6 lg:p-8 relative z-10 hover:border-green-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white mb-5 mx-auto shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Ready to Refer</h3>
                    <p className="text-sm text-slate-600 text-center leading-relaxed flex-1">
                      Candidates are interview-ready and actively looking
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* How Referral Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection animation="reveal" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How to Refer a Candidate</h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              It takes just 3 simple steps to refer a trained candidate to your company
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <AnimatedSection animation="scale" delay={0}>
              <div className="bg-white border border-slate-200 rounded-2xl p-8 h-full hover:shadow-lg transition-all hover:-translate-y-1 hover:border-orange-200">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-xl mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Browse & Filter</h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Search candidates by skills, roles, location, and availability. View their profiles, projects, and training background.
                </p>
              </div>
            </AnimatedSection>

            {/* Step 2 */}
            <AnimatedSection animation="scale" delay={100}>
              <div className="bg-white border border-slate-200 rounded-2xl p-8 h-full hover:shadow-lg transition-all hover:-translate-y-1 hover:border-orange-200">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold text-xl mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Express Interest</h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Select candidates who match your company&apos;s requirements and send an expression of interest with one click.
                </p>
              </div>
            </AnimatedSection>

            {/* Step 3 */}
            <AnimatedSection animation="scale" delay={200}>
              <div className="bg-white border border-slate-200 rounded-2xl p-8 h-full hover:shadow-lg transition-all hover:-translate-y-1 hover:border-orange-200">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold text-xl mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Connect & Refer</h3>
                <p className="text-slate-600">
                  Candidate receives your interest. Connect directly and submit your referral through your company&apos;s portal.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Featured Candidates Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection animation="reveal" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Featured Candidates</h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              A preview of verified professionals ready for your referral
            </p>
          </AnimatedSection>

          {/* Preview Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Fresher Card */}
            <AnimatedSection animation="reveal" delay={0}>
              <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">RS</span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Rahul S.</div>
                      <div className="text-sm text-slate-500">Full Stack Developer</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Open</span>
                </div>
                <div className="text-xs text-slate-500 mb-3">
                  <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded font-medium">Fresher</span>
                  <span className="mx-1">•</span> Bangalore
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">React</span>
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">Node.js</span>
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">PostgreSQL</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">
                  Built 5+ full-stack projects including an e-commerce platform. Strong DSA and system design fundamentals.
                </p>
              </div>
            </AnimatedSection>

            {/* Mid-level Card */}
            <AnimatedSection animation="reveal" delay={100}>
              <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">PM</span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Priya M.</div>
                      <div className="text-sm text-slate-500">Backend Engineer</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Open</span>
                </div>
                <div className="text-xs text-slate-500 mb-3">
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-medium">4 YOE</span>
                  <span className="mx-1">•</span> Remote OK
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">Python</span>
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">Django</span>
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">AWS</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">
                  Ex-Razorpay. Specialized in API design and microservices. Led a team of 3 engineers.
                </p>
              </div>
            </AnimatedSection>

            {/* Senior Card */}
            <AnimatedSection animation="reveal" delay={200}>
              <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">AK</span>
                    </div>
                    <div>
                      <div className="font-bold text-base text-slate-900">Amit K.</div>
                      <div className="text-sm text-slate-500">Tech Lead</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Open</span>
                </div>
                <div className="text-xs text-slate-500 mb-3">
                  <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-medium">5 YOE</span>
                  <span className="mx-1">•</span> Hyderabad
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">System Design</span>
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">Kubernetes</span>
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">Go</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">
                  Ex-Google. Architected systems serving 1M+ users. Looking for engineering leadership roles.
                </p>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection animation="reveal" delay={300} className="text-center">
            <Link
              href="/candidates"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all hover:-translate-y-0.5"
            >
              View All Candidates
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Skills Available */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection animation="reveal" className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Skills You Can Find</h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Our candidates are trained in the most in-demand technologies</p>
          </AnimatedSection>

          <AnimatedSection animation="fade" delay={100}>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
                'C++', 'Go', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker',
                'Kubernetes', 'Git', 'REST APIs', 'GraphQL', 'System Design',
                'Data Structures', 'Algorithms', 'HTML/CSS', 'Next.js', 'Express.js'
              ].map((skill, idx) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-default"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Dark Impact Section - CodingNinjas style */}
      <section className="py-16 bg-[#0a0a12] relative overflow-hidden">
        <AnimatedSection animation="reveal" className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4a4a5a] leading-tight mb-10">
            Connecting Trained Talent with Great Opportunities
          </h2>
          
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <AnimatedSection animation="scale" delay={0}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-1">
                  {stats.totalCandidates > 0 ? (
                    <AnimatedCounter end={stats.totalCandidates} suffix="+" />
                  ) : (
                    <span>3+</span>
                  )}
                </div>
                <div className="text-[#6a6a7a] text-xs">Verified Candidates</div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="scale" delay={100}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-1">
                  <AnimatedCounter end={50} suffix="+" />
                </div>
                <div className="text-[#6a6a7a] text-xs">Partner Companies</div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="scale" delay={200}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-1">
                  <AnimatedCounter end={100} suffix="+" />
                </div>
                <div className="text-[#6a6a7a] text-xs">Successful Referrals</div>
              </div>
            </AnimatedSection>
          </div>
        </AnimatedSection>
      </section>

      {/* Floating CTA Card - appears above footer with float animation */}
      <section className="py-12 px-6 bg-[#0a0a12] relative -mb-16">
        <FloatingCard />
      </section>
    </div>
  );
}
