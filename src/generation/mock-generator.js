/**
 * Mock Creative Generator
 * Returns realistic structured text per outputFormat
 * Used when REPLICATE_API_TOKEN is absent or API errors occur
 */

import { OUTPUT_FORMAT } from '../engine/rules/rule-types.js';

/**
 * Generate mock creative output based on format and constraints
 * @param {string} prompt - The generation prompt
 * @param {string} outputFormat - The desired output format
 * @param {Object} constraints - Constraints to respect
 * @returns {string} Formatted creative output
 */
export function generateMockOutput(prompt, outputFormat, constraints) {
  switch (outputFormat) {
    case OUTPUT_FORMAT.BUDGET_BREAKDOWN:
      return generateBudgetBreakdown(constraints);
    
    case OUTPUT_FORMAT.TREATMENT_WITH_SHOT_LIST:
      return generateTreatmentWithShotList(constraints);
    
    case OUTPUT_FORMAT.TREATMENT:
      return generateTreatment(constraints);
    
    case OUTPUT_FORMAT.SHOT_LIST:
      return generateShotList(constraints);
    
    case OUTPUT_FORMAT.CAPTION_STRATEGY:
      return generateCaptionStrategy(constraints);
    
    case OUTPUT_FORMAT.RELEASE_TIMELINE:
      return generateReleaseTimeline(constraints);
    
    default:
      return generateGenericOutput(prompt, constraints);
  }
}

/**
 * Generate budget breakdown
 */
function generateBudgetBreakdown(constraints) {
  const maxBudget = constraints.maxBudget || 500;
  
  // Handle special case: regional PR alternatives
  if (constraints.option1 && constraints.option2) {
    return `TWO STRATEGIC ALTERNATIVES FOR ESTABLISHED STAGE

OPTION 1: 3-MONTH PR RETAINER ($1,200)

MONTH 1 - FOUNDATION ($400)
• Relationship building with journalists and bloggers
• Pitch development and press kit refinement
• Target list creation (20-30 relevant outlets)
• Initial outreach to warm contacts
• Expected: 2-3 responses, relationship groundwork

MONTH 2 - OUTREACH ($400)
• Full pitch campaign to target list
• Follow-up with interested journalists
• Secure interview opportunities
• Coordinate feature timing with release
• Expected: 3-5 confirmed placements in pipeline

MONTH 3 - PLACEMENTS ($400)
• Placements go live (blogs, magazines, podcasts)
• Amplify coverage across social channels
• Leverage placements for playlist pitching
• Document results and ROI
• Expected: 5-8 published features/interviews

TOTAL: $1,200 over 3 months
REALISTIC OUTCOME: 5-8 press placements, 2-3 podcast interviews, increased credibility for playlist pitching

WHY 3 MONTHS MINIMUM:
Month 1 is setup, Month 2 is execution, Month 3 is when results materialize. Shorter retainers pay for setup without reaching the payoff phase.

---

OPTION 2: DIRECT OUTREACH STRATEGY ($1,200)

PLAYLIST CURATOR OUTREACH ($500)
• Research and target 50-100 independent curators
• Personalized pitches via SubmitHub, email, Instagram DM
• Focus on micro-playlists (1K-10K followers) in your genre
• Follow-up sequence over 4 weeks
• Expected: 8-12 playlist placements

MUSIC BLOGGER OUTREACH ($300)
• Identify 30-40 active music blogs in your niche
• Create compelling press kit and one-sheet
• Personalized email pitches with streaming links
• Follow-up with engaged bloggers
• Expected: 3-5 blog features

INFLUENCER COLLABORATION ($200)
• Partner with 5-10 micro-influencers (10K-50K followers)
• Offer early access, exclusive content, or small fee
• Create shareable content (Reels, TikToks) featuring your music
• Cross-promote on both accounts
• Expected: 50K-100K impressions, 500-1K new listeners

CONTENT CREATION ($200)
• Professional photos for press kit
• Short-form video content for pitching
• Lyric videos and visualizers
• Behind-the-scenes content for engagement

TOTAL: $1,200 one-time investment
REALISTIC OUTCOME: 8-12 playlist adds, 3-5 blog features, 50K+ impressions, 500-1K new listeners

WHY THIS WORKS FASTER:
Direct outreach puts you in control. You're not waiting for a publicist to build relationships—you're building them yourself. Results start appearing in weeks, not months. Plus, you learn the process for future releases.

RECOMMENDATION:
If you have 3 months before your release and want press credibility: Choose Option 1.
If you need faster results and want to own the relationships: Choose Option 2.

At Established stage with 12,000 monthly listeners, both approaches are viable. Option 2 gives you more control and faster feedback, while Option 1 builds long-term media relationships.`;
  }
  
  const stage = getStageFromConstraints(constraints);
  
  if (stage === 'bedroom') {
    return `BUDGET BREAKDOWN - BEDROOM STAGE ($${maxBudget} MAX)

CONTENT CREATION: $80
• Smartphone filming with natural lighting
• Use existing wardrobe and locations (home, local spots)
• Edit on free software (CapCut, iMovie)
• 2-3 short-form videos (TikTok/Reels format)

DISTRIBUTION: $0
• Organic posting across platforms
• Cross-post to TikTok, Instagram Reels, YouTube Shorts
• Leverage trending sounds and hashtags
• Post consistently (3-4x per week)

ENGAGEMENT TOOLS: $40
• Canva Pro subscription (1 month) for graphics
• Create story templates, lyric cards, behind-the-scenes content
• Build visual consistency across platforms

AUDIENCE CAPTURE: $30
• Set up Linktree or similar (free tier)
• Create simple landing page with email signup
• Offer exclusive content (demo, acoustic version) for signups
• Use free email service (Mailchimp free tier: 500 contacts)

TOTAL: $150

EXPECTED OUTCOMES:
• 3-5 pieces of content for algorithm testing
• Email list foundation (target: 20-50 signups)
• Data on which content formats resonate
• Sustainable posting rhythm established

WHY THIS WORKS:
Multiple content pieces give you more chances for algorithmic discovery. Each video is a separate lottery ticket. The $150 spread across content + capture builds both visibility AND ownership of your audience—the two things that compound over time.`;
  }
  
  if (stage === 'rising') {
    return `BUDGET BREAKDOWN - RISING STAGE ($${maxBudget} MAX)

CONTENT CREATION: $150
• Rent basic DSLR or mirrorless camera (1 day): $50
• Location fee (local studio/interesting spot): $50
• Friend with camera experience (paid): $50
• Create 1 main video + 3-4 cutdowns for social

PLAYLIST STRATEGY: $100
• Professional mixing/mastering (if not done): $75
• Playlist pitch service (SubmitHub credits): $25
• Target: 10-15 curator submissions
• Focus on micro-playlists (1K-10K followers)

PAID BOOST: $100
• Instagram/Facebook ads (1 week test)
• Target: Lookalike audience from existing followers
• Objective: Landing page visits (email capture)
• Budget: $15/day for 7 days
• Expected: 50-100 landing page visits, 10-20 email signups

AUDIENCE ENGAGEMENT: $50
• Email service upgrade (Mailchimp Essentials)
• SMS service trial (Community or similar)
• Create welcome sequence (3 emails)
• Set up automated responses

TOTAL: $400

EXPECTED OUTCOMES:
• 1 high-quality video asset + social cutdowns
• 2-3 playlist placements (realistic for Rising stage)
• 10-20 new email subscribers with proven conversion path
• Data on ad performance and cost-per-acquisition

WHY THIS WORKS:
This splits budget between visibility (content + playlists) and capture (ads to landing page). You're not just buying streams—you're building a list you own. The playlist strategy targets realistic placements at your stage, not pipe dreams.`;
  }
  
  if (stage === 'established') {
    return `BUDGET BREAKDOWN - ESTABLISHED STAGE ($${maxBudget} MAX)

CONTENT PRODUCTION: $500
• Professional videographer (day rate): $300
• Location permits and fees: $100
• Props, wardrobe, styling: $100
• Deliverables: 1 main video + 5-6 social cutdowns

PLAYLIST & DISTRIBUTION: $400
• Playlist pitching service (premium tier): $150
• Target: 20-30 curator submissions
• Focus: Mid-tier playlists (10K-100K followers)
• PR database access (1 month): $100
• Music blog outreach (DIY with templates): $0
• Spotify Canvas creation: $50
• YouTube optimization (thumbnails, descriptions): $100

PAID ACQUISITION: $400
• Multi-platform ad campaign (2 weeks)
• Instagram/Facebook: $200 (targeting lookalikes + interests)
• TikTok Promote: $100 (boost top organic content)
• YouTube pre-roll: $100 (target music listeners)
• All traffic to landing page with email/SMS capture

AUDIENCE DEVELOPMENT: $200
• Email service (Mailchimp Standard): $50
• SMS service (Community or Postscript): $100
• Create 5-email welcome sequence
• Set up automated engagement flows
• Design templates for consistent communication
• Landing page optimization (A/B test headlines): $50

TOTAL: $1,500

EXPECTED OUTCOMES:
• Professional-quality video asset with multiple formats
• 5-10 playlist placements (mix of micro and mid-tier)
• 100-200 new email subscribers
• 50-100 SMS subscribers
• Clear cost-per-acquisition data across channels
• Validated conversion funnel for future campaigns

WHY THIS WORKS:
At Established stage, you have enough audience to test paid acquisition profitably. This budget validates your unit economics: if you can acquire email subscribers at $5-10 each and convert them to streams/merch buyers, you've found a scalable model. The multi-channel approach tests where your audience lives.`;
  }
  
  // Default/Breakout stage
  return `BUDGET BREAKDOWN - BREAKOUT STAGE ($${maxBudget} MAX)

CONTENT PRODUCTION: $1,500
• Professional video production (2-day shoot): $1,000
• Professional editing and color grading: $300
• Motion graphics and VFX: $200
• Deliverables: 1 premium video + 8-10 social cutdowns

DISTRIBUTION & PLACEMENT: $1,500
• 3-month PR retainer (music publicist): $900
• Playlist pitching (premium service): $300
• Radio promotion (college/independent): $300
• Target: Major playlist consideration, press coverage

PAID ACQUISITION: $1,500
• Multi-platform campaign (4 weeks)
• Instagram/Facebook: $600
• TikTok: $400
• YouTube: $300
• Spotify Ad Studio: $200
• Full attribution tracking and optimization

AUDIENCE INFRASTRUCTURE: $500
• Email service (advanced tier): $100
• SMS service (premium): $200
• CRM integration: $100
• Landing page optimization and A/B testing: $100
• Automated engagement sequences

TOTAL: $5,000

EXPECTED OUTCOMES:
• Premium content asset with professional production value
• Press coverage in 3-5 music publications
• 10-20 playlist placements (including major consideration)
• 500-1,000 new email subscribers
• 200-400 SMS subscribers
• Full attribution data and ROI analysis
• Validated revenue model (streaming + merch + tickets)

RISK ASSESSMENT REQUIRED:
Before executing this budget, you need:
1. Documented conversion rates from previous campaigns
2. Proven cost-per-acquisition under $10
3. Revenue projection showing positive ROI within 6 months
4. Attribution tracking infrastructure in place

WHY THIS WORKS (IF VALIDATED):
At Breakout stage with proven unit economics, this budget scales what's already working. You're not experimenting—you're amplifying validated channels. The 3-month PR retainer gives time for relationships to mature and placements to materialize.`;
}

/**
 * Generate treatment with shot list
 */
function generateTreatmentWithShotList(constraints) {
  const maxBudget = constraints.maxBudget || 200;
  const equipment = constraints.equipment || 'smartphone';
  const crew = constraints.crew || 'solo';
  
  return `MUSIC VIDEO TREATMENT + SHOT LIST
Budget: $${maxBudget} | Equipment: ${equipment} | Crew: ${crew}

CONCEPT:
"The Bedroom Hustle" - A day-in-the-life visual that shows the grind of being an independent artist. Raw, authentic, relatable. No actors, no sets—just you and your actual creative process.

VISUAL APPROACH:
• Handheld, documentary-style footage
• Natural lighting (golden hour for outdoor shots)
• Mix of performance and behind-the-scenes
• Vertical format (9:16) for TikTok/Reels primary distribution
• Horizontal cutdown for YouTube

LOCATIONS (ALL FREE):
1. Your bedroom/home studio (setup shots, recording)
2. Local coffee shop (writing session - ask permission)
3. Outdoor spot with good natural light (performance)
4. Night drive (car shots through windshield)

SHOT LIST:

SEQUENCE 1: MORNING ROUTINE (0:00-0:30)
Shot 1: Close-up of alarm going off (phone screen)
Shot 2: POV shot of opening laptop, seeing streaming numbers
Shot 3: Making coffee, checking phone for messages
Shot 4: Sitting at home studio, putting on headphones
GEAR: Smartphone on tripod, natural window light

SEQUENCE 2: THE WORK (0:30-1:15)
Shot 5: Recording vocals (close-up on mic, then pull back)
Shot 6: Editing on laptop (screen recording + over-shoulder)
Shot 7: Frustrated moment (delete take, start over)
Shot 8: The breakthrough (nodding along, satisfied)
Shot 9: Exporting the track (progress bar)
GEAR: Smartphone on tripod, ring light for close-ups

SEQUENCE 3: COFFEE SHOP WRITING (1:15-1:45)
Shot 10: Walking into coffee shop (exterior)
Shot 11: Ordering coffee (quick moment)
Shot 12: Notebook and phone on table (overhead shot)
Shot 13: Writing lyrics, crossing out, rewriting
Shot 14: Voice memo recording (close-up on phone)
GEAR: Smartphone handheld, natural cafe lighting

SEQUENCE 4: OUTDOOR PERFORMANCE (1:45-2:30)
Shot 15: Wide shot of location (establish)
Shot 16: Performance - full body (locked off)
Shot 17: Performance - medium shot (slight movement)
Shot 18: Performance - close-up (handheld, intimate)
Shot 19: Cutaways - hands, feet, environment
GEAR: Smartphone on tripod + handheld, golden hour

SEQUENCE 5: NIGHT DRIVE (2:30-3:00)
Shot 20: Driving (through windshield, city lights)
Shot 21: Reflection in window (contemplative)
Shot 22: Arriving home (exterior)
Shot 23: Back at studio, uploading track
Shot 24: Hit "publish" - final moment
GEAR: Smartphone mounted on dashboard

EDITING APPROACH:
• Cut to the beat (use song's rhythm)
• Mix of quick cuts (energy) and held shots (emotion)
• Add text overlays with lyrics or thoughts
• Color grade for consistency (warm tones)
• Keep it raw - don't over-polish

DISTRIBUTION STRATEGY:
1. Post full vertical version to TikTok/Reels
2. Create 15-second teaser for Stories
3. Post horizontal version to YouTube
4. Behind-the-scenes clips throughout the week
5. Use trending sounds for cutdowns

BUDGET BREAKDOWN:
• Coffee shop coffee: $5
• Gas for locations: $10
• Phone tripod mount: $15
• Editing software (CapCut Pro, 1 month): $10
• Remaining: $160 saved for next project

WHY THIS WORKS:
You're not trying to compete with big-budget videos. You're showing the reality of independent artistry, which is more relatable and authentic than polished productions. The vertical format prioritizes where your audience actually watches content. Multiple locations and sequences give you 20+ shots to work with, creating visual variety without expensive setups.`;
}

/**
 * Generate treatment only
 */
function generateTreatment(constraints) {
  return `VISUAL TREATMENT

CONCEPT:
"Authentic Moments" - Capture the real creative process without artifice. Show the work, the doubt, the breakthrough. Make viewers feel like they're in the room with you.

VISUAL STYLE:
• Documentary aesthetic with intentional framing
• Natural lighting prioritized over artificial
• Handheld camera movement for intimacy
• Color palette: warm, slightly desaturated
• Mix of wide establishing shots and intimate close-ups

NARRATIVE ARC:
Beginning: The struggle (empty page, false starts)
Middle: The process (experimentation, iteration)
End: The breakthrough (satisfaction, completion)

LOCATIONS:
All free or accessible spaces that tell your story authentically. Your actual creative environment, not a rented set.

APPROACH:
This isn't about production value—it's about emotional truth. The constraints (limited budget, basic equipment) become the aesthetic. Raw, real, relatable.`;
}

/**
 * Generate shot list only
 */
function generateShotList(constraints) {
  return `SHOT LIST

SETUP SHOTS (Establishing):
1. Wide shot of location
2. Medium shot of subject entering frame
3. Detail shots of environment

PERFORMANCE SHOTS:
4. Full body (locked off tripod)
5. Medium shot (slight movement)
6. Close-up (handheld, intimate)
7. Extreme close-up (eyes, hands, details)

CUTAWAYS:
8. Environment details
9. Props and objects
10. Lighting and shadows
11. Transitions between locations

COVERAGE:
• Shoot each setup from multiple angles
• Get extra B-roll for editing flexibility
• Capture ambient sound for each location`;
}

/**
 * Generate caption strategy
 */
function generateCaptionStrategy(constraints) {
  return `CAPTION STRATEGY

POST 1 (ANNOUNCEMENT):
"New music drops Friday. This one's different. 🎵
Been working on this for months—can't wait for you to hear it.
Pre-save link in bio. Let's run this up together."

POST 2 (BEHIND-THE-SCENES):
"The process >>> the final product
Here's how this track came together [carousel of studio shots]
Swipe to see the evolution from voice memo to final mix.
What's your creative process like?"

POST 3 (STORY/VULNERABILITY):
"Real talk: Almost scrapped this song three times.
Kept thinking it wasn't good enough.
Then I realized—that's the point. It's honest.
Sometimes the songs that scare you are the ones that need to exist.
Out Friday. Link in bio."

POST 4 (ENGAGEMENT):
"Question: What's the first thing you do when you find a new song you love?
A) Add to playlist
B) Send to friends
C) Play on repeat
D) Check out the artist's other music
Asking because [song name] drops Friday and I'm curious how y'all discover music."

POST 5 (RELEASE DAY):
"IT'S OUT. [Song name] available everywhere now.
This one means a lot. Let me know what you think.
Stream link in bio. 🔗"

STRATEGY NOTES:
• Post 3-4 times per week leading up to release
• Mix promotional content with personal/relatable posts
• Ask questions to drive engagement
• Use Stories for daily updates and polls
• Cross-post to TikTok with trending sounds`;
}

/**
 * Generate release timeline
 */
function generateReleaseTimeline(constraints) {
  return `RELEASE TIMELINE

WEEK 1-2 (PRE-ANNOUNCEMENT):
• Tease new music coming (no details yet)
• Post studio content and behind-the-scenes
• Build anticipation through Stories
• Engage with comments and DMs

WEEK 3 (ANNOUNCEMENT):
• Announce release date and title
• Share cover art
• Post pre-save link
• Create countdown stickers for Stories

WEEK 4 (BUILD-UP):
• Daily countdown posts
• Share song snippets (15-30 seconds)
• Behind-the-scenes of creation process
• Engage with fans who pre-saved

RELEASE WEEK:
Day 1 (Release): Major announcement, all platforms
Day 2: Share fan reactions and reposts
Day 3: Post lyrics video or visualizer
Day 4: Behind-the-scenes of recording
Day 5: Acoustic or alternate version
Day 6: Thank you post to supporters
Day 7: Playlist placement announcements

POST-RELEASE (ONGOING):
• Continue posting content related to song
• Share playlist adds and milestones
• Create TikTok/Reels with song
• Engage with user-generated content
• Plan next release (maintain momentum)`;
}

/**
 * Generate generic output
 */
function generateGenericOutput(prompt, constraints) {
  return `CREATIVE DIRECTION

Based on your constraints and current stage, here's the strategic approach:

CORE PRINCIPLE:
Work within your means while maximizing creative impact. Constraints breed creativity—use them as advantages, not limitations.

KEY RECOMMENDATIONS:
1. Focus on consistency over perfection
2. Build audience ownership (email/SMS) alongside visibility
3. Test multiple approaches with smaller budgets
4. Document what works for future scaling
5. Prioritize sustainable practices over one-off wins

EXECUTION:
Start with what you can control: content quality, posting consistency, audience engagement. Scale spending only after validating what works.

NEXT STEPS:
1. Create content with available resources
2. Set up audience capture infrastructure
3. Test and measure everything
4. Iterate based on data
5. Scale what proves effective`;
}

/**
 * Helper to determine stage from constraints
 */
function getStageFromConstraints(constraints) {
  if (constraints.maxBudget <= 150) return 'bedroom';
  if (constraints.maxBudget <= 400) return 'local';
  if (constraints.maxBudget <= 1500) return 'regional';
  return 'breaking';
}

/**
 * Main export - generate creative output
 */
export async function generateCreativeOutput(redirectAction, profile, move) {
  try {
    // Extract prompt and constraints
    const prompt = typeof redirectAction.prompt === 'function' 
      ? redirectAction.prompt(profile, move)
      : redirectAction.prompt;
    
    const outputFormat = redirectAction.outputFormat;
    const constraints = redirectAction.constraints || {};
    
    // Generate mock output
    const output = generateMockOutput(prompt, outputFormat, constraints);
    
    return {
      success: true,
      output,
      source: 'mock',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      source: 'mock',
      timestamp: new Date().toISOString()
    };
  }
}
