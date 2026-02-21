import Link from "next/link";
import {
  MicrophoneIcon,
  HeartIcon,
  BriefcaseIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UsersIcon,
  ServerIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Community Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-2.5 px-4 text-center text-sm font-semibold border-b-2 border-blue-700 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1"></div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Community Support Portal</span>
            <span className="hidden sm:inline text-blue-200 mx-2">•</span>
            <span className="hidden sm:inline text-xs text-blue-200">
              Powered by Local Services
            </span>
          </div>
          <div className="flex-1 flex justify-end">
            <Link
              href="/health"
              className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
              title="System Health Dashboard"
            >
              <ServerIcon className="w-4 h-4" />
              <span>Status</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section - Matching Screenshot Style */}
      <section className="relative py-16 md:py-24">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Hero Card */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-900 rounded-full text-sm font-bold mb-6 border border-blue-200">
                  <UsersIcon className="w-4 h-4" />
                  <span>
                    A collaboration between local government and community
                    partners
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                  Welcome to
                  <br />
                  <span className="text-blue-800">CareConnect</span>
                </h1>

                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  A Community-Supported Portal for People Experiencing
                  Homelessness
                </p>

                <div className="space-y-4 mb-8">
                  <h3 className="font-bold text-gray-900 text-lg">
                    What You Can Do:
                  </h3>

                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Share Your Story
                      </h4>
                      <p className="text-sm text-gray-600">
                        Record your voice to help others understand your journey
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Get Support Tools
                      </h4>
                      <p className="text-sm text-gray-600">
                        Create QR codes and fundraising materials
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Connect with Community
                      </h4>
                      <p className="text-sm text-gray-600">
                        Make it easy for people to help you
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - CTA */}
              <div className="flex flex-col items-center justify-center">
                <Link href="/tell-your-story">
                  <div className="relative group cursor-pointer">
                    <div className="w-56 h-56 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-4 border-white animate-breathing">
                      <div className="text-center text-white px-4">
                        <MicrophoneIcon className="w-16 h-16 mx-auto mb-2 drop-shadow-lg" />
                        <div className="font-extrabold text-base leading-tight tracking-wider">
                          PRESS TO
                          <br />
                          TELL YOUR
                          <br />
                          STORY
                        </div>
                      </div>
                    </div>
                    <div className="absolute -inset-4 bg-red-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                  </div>
                </Link>

                <div className="mt-8 text-center max-w-xs">
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">
                    You're in control. You can stop at any time.
                    <br />
                    <span className="text-gray-800">
                      Your story helps connect you with support and resources.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Support Tools Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Additional Support Tools
            </h2>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
              Everything you need to connect with your community
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How CareConnect Helps
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              transcription with native language support creates Our platform
              provides comprehensive support through technology, compassion, and
              community connection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Story Sharing */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MicrophoneIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Share Your Story</h4>
              <p className="text-gray-600">
                Record your story with our easy-to-use voice recorder. AI helps
                create your profile while preserving your unique voice.
              </p>
            </div>

            {/* Job Opportunities */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BriefcaseIcon className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Find Work</h4>
              <p className="text-gray-600">
                Get personalized job recommendations, cover letter assistance,
                and connect with employers who value your skills.
              </p>
            </div>

            {/* Local Resources */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Access Resources</h4>
              <p className="text-gray-600">
                Find local shelters, food banks, healthcare, job training, and
                other essential services in your area.
              </p>
            </div>

            {/* Community Support */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Receive Support</h4>
              <p className="text-gray-600">
                Connect with donors who want to help, access an AI assistant for
                guidance, and join a supportive community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Fundraising & Support Tools
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create professional fundraising materials and connect with donors
              through our AI-powered platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Story Recording */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MicrophoneIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-center mb-3">
                Record Your Story
              </h4>
              <p className="text-gray-600 text-center mb-6">
                Tell your story with our voice recorder. AI analyzes it and
                creates your profile automatically.
              </p>
              <Link
                href="/tell-story"
                className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Recording
              </Link>
            </div>

            {/* GoFundMe Creator */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-center mb-3">
                GoFundMe Creator
              </h4>
              <p className="text-gray-600 text-center mb-6">
                AI helps create complete GoFundMe campaigns with auto-filled
                forms and step-by-step guidance.
              </p>
              <Link
                href="/gfm/extract"
                className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Campaign
              </Link>
            </div>

            {/* QR Donations */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-center mb-3">
                QR Code Donations
              </h4>
              <p className="text-gray-600 text-center mb-6">
                Generate QR codes for instant donations. People scan and donate
                with debit/credit cards securely.
              </p>
              <div className="text-center">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                  Generated with campaigns
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Share Your Story?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Your experiences, skills, and dreams matter. Let us help you connect
            with the resources and opportunities you need.
          </p>
          <Link
            href="/tell-story"
            className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-3"
          >
            <MicrophoneIcon className="w-6 h-6" />
            <span>Get Started Now</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="col-span-2">
              <h4 className="text-lg font-semibold mb-4 gradient-text">
                CareConnect
              </h4>
              <p className="text-gray-600 mb-4">
                Empowering individuals experiencing homelessness through
                technology, resources, and community support.
              </p>
              <p className="text-sm text-gray-500">
                Built with privacy, dignity, and respect at its core.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Individuals</h5>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/tell-story" className="hover:text-gray-900">
                    Share Your Story
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="hover:text-gray-900">
                    Find Resources
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-gray-900">
                    Job Search
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-gray-900">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Supporters</h5>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/browse-profiles" className="hover:text-gray-900">
                    Support Someone
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer" className="hover:text-gray-900">
                    Volunteer
                  </Link>
                </li>
                <li>
                  <Link href="/organizations" className="hover:text-gray-900">
                    Partner With Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-900">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">System Admin</h5>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/health" className="hover:text-gray-900">
                    System Health
                  </Link>
                </li>
                <li>
                  <Link href="/admin/knowledge" className="hover:text-gray-900">
                    Knowledge Vault
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/knowledge/incidents"
                    className="hover:text-gray-900"
                  >
                    Pipeline Incidents
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/knowledge/audit"
                    className="hover:text-gray-900"
                  >
                    Audit Logs
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2024 CareConnect. Made with ❤️ for our community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
