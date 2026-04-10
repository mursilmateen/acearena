export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="space-y-8">
          {/* Title */}
          <h1 className="text-4xl font-semibold text-black">
            AceArena
          </h1>

          {/* Intro */}
          <p className="text-base text-gray-600 leading-relaxed">
            AceArena is a modern platform built for game developers and players to connect, share, and explore games in one place.
          </p>

          {/* Vision */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-black mb-4">
              Our Vision
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              To create a space where developers can showcase their creativity and players can discover unique gaming experiences.
            </p>
          </div>

          {/* Mission */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-black mb-4">
              Our Mission
            </h2>
            <ul className="space-y-3">
              <li className="text-base text-gray-600 leading-relaxed flex gap-3">
                <span className="text-black font-semibold flex-shrink-0">•</span>
                <span>Provide a simple platform to upload and discover games</span>
              </li>
              <li className="text-base text-gray-600 leading-relaxed flex gap-3">
                <span className="text-black font-semibold flex-shrink-0">•</span>
                <span>Support indie developers with visibility and tools</span>
              </li>
              <li className="text-base text-gray-600 leading-relaxed flex gap-3">
                <span className="text-black font-semibold flex-shrink-0">•</span>
                <span>Build a growing and active gaming community</span>
              </li>
            </ul>
          </div>

          {/* What We Offer */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-black mb-6">
              What We Offer
            </h2>
            <div className="space-y-6">
              {/* Game Discovery */}
              <div>
                <h3 className="text-base font-semibold text-black mb-2">
                  Game Discovery
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Explore a variety of games created by developers.
                </p>
              </div>

              {/* Developer Platform */}
              <div>
                <h3 className="text-base font-semibold text-black mb-2">
                  Developer Platform
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Upload and manage your games easily.
                </p>
              </div>

              {/* Community */}
              <div>
                <h3 className="text-base font-semibold text-black mb-2">
                  Community
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Engage with developers and players through discussions.
                </p>
              </div>
            </div>
          </div>

          {/* Closing */}
          <div className="border-t border-gray-200 pt-6 pb-6">
            <p className="text-sm text-gray-600 leading-relaxed">
              AceArena is built to bring together creativity, development, and gaming into one unified experience.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
