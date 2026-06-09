/**
 * @fileoverview Climate education panel with curated YouTube content.
 */

import { trackEvent } from '../../services/analytics.js'

export default function EducationPanel() {
  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full items-stretch">
      {/* YouTube embed */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-eco-200 min-h-[260px] bg-stone-900 shadow-lg">
        <iframe
          title="Curated Google Climate Change Educational Video"
          src="https://www.youtube.com/embed/8q7_aV8eFRo?enablejsapi=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => trackEvent('youtube_video_played')}
        />
      </div>

      {/* Video description */}
      <div className="w-full lg:w-72 flex flex-col justify-center">
        <span className="text-[10px] font-bold text-eco-500 uppercase tracking-widest">Featured Media</span>
        <h4 className="font-bold text-eco-800 text-sm mt-1">Understanding Carbon Budgets</h4>
        <p className="text-xs text-eco-600 leading-relaxed mt-2">
          This Google-integrated YouTube player covers how personal choices directly impact global carbon budgets,
          showing how structural updates to housing, travel, and food supply chains combine to halt emissions.
        </p>
        <div className="mt-4 p-3 bg-eco-50 rounded-xl border border-eco-100 flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">💡</span>
          <p className="text-[10px] text-eco-600 font-medium">
            Use the Google Translate widget at the top right to instantly read recommendations in other languages.
          </p>
        </div>
      </div>
    </div>
  )
}
