# Sideline Implementation Plan - 7-Day Hackathon Build

## Project Overview
A creative decision partner for independent musicians that assesses planned moves against their profile, blocks amateur failure patterns with explicit reasoning, and redirects to stage-appropriate creative strategies.

**Hackathon Focus**: Working demo with full-fidelity rule engine. Single-user, local storage, no auth.

## Core Requirements
- **ASSESS**: Match planned move against stored creator profile
- **BLOCK**: Detect failure patterns using inspectable rule engine (NOT prompt-based)
- **REDIRECT**: Generate creative alternatives via IBM Granite

## Stage Definitions (by monthly listeners)
- **Bedroom**: 0–500
- **Local**: 500–5,000
- **Regional**: 5,000–25,000
- **Breaking**: 25,000+

---

## 7-Day Build Schedule

### Day 1: Rule Engine Foundation (PRIORITY)

**Goal**: Complete, testable rule engine with all 12+ rules encoded

#### Morning (4 hours)
- [ ] Project setup: Node.js, package structure, dependencies
- [ ] Create rule type definitions and interfaces
- [ ] Implement stage calculator (monthly listeners → stage)
- [ ] Build rule registry architecture

#### Afternoon (4 hours)
- [ ] Encode all budget rules (4 rules):
  - Bedroom: $150 cap, $75 line item limit
  - Local: $400 cap, $200 video limit
  - Regional: $1.5k cap, 3-month PR minimum
  - Breaking: $5k advisory only
- [ ] Encode all release rules (3 rules):
  - Album/EP block <2,500 listeners
  - Zero capture block (email/WhatsApp)
  - Release spacing <6 weeks (below Regional)

**Deliverable**: Rule engine with trigger/block/redirect structure

---

### Day 2: Rule Engine Completion + Testing

#### Morning (4 hours)
- [ ] Encode all promo rules (4 rules):
  - Paid ads block below Local
  - Paid ads block without capture
  - Playlist pitching block below Regional
  - PR/publicist block below Regional
- [ ] Implement rule evaluator with explicit reasoning
- [ ] Build rule execution flow

#### Afternoon (4 hours)
- [ ] Write comprehensive test suite:
  - Unit tests for each rule's trigger logic
  - Test fixtures with sample creator profiles
  - Edge case testing (boundary values)
  - Validation of block reasons (must include numbers)
- [ ] Create CLI tool for manual rule testing

**Deliverable**: Fully tested rule engine with 100% coverage

---

### Day 3: Data Layer + IBM Granite Integration

#### Morning (3 hours)
- [ ] Define creator profile schema (JSON)
- [ ] Define decision history schema (JSON)
- [ ] Implement local JSON file storage (`/data` directory)
- [ ] Create sample creator profiles for demo

#### Afternoon (5 hours)
- [ ] Set up IBM Granite API client
- [ ] Create prompt templates for redirect types:
  - Treatment (concept, visual direction)
  - Shot list (specific shots, equipment)
  - Caption strategy (platform copy, hashtags)
  - Budget breakdown (alternative allocation)
- [ ] Test generation quality with sample redirects
- [ ] Add error handling and mock fallback

**Deliverable**: Working data persistence + creative generation

---

### Day 4: API Layer

#### Full Day (8 hours)
- [ ] Set up Express.js server
- [ ] Implement core endpoints:
  - `POST /api/profile` - Create/update profile
  - `GET /api/profile` - Get current profile
  - `POST /api/assess` - Assess planned move
  - `POST /api/generate` - Generate creative output
  - `GET /api/history` - Get decision history
- [ ] Add request validation
- [ ] Error handling and logging
- [ ] Test all endpoints with Postman/curl

**Deliverable**: RESTful API for all core operations

---

### Day 5: Frontend - Core Flow

#### Morning (4 hours)
- [ ] Next.js project setup with Tailwind CSS
- [ ] Create layout and navigation
- [ ] Build profile setup form:
  - Monthly listeners input
  - Follower counts (Instagram, TikTok, Spotify)
  - Email/WhatsApp list status
  - Available budget
- [ ] Profile persistence to local storage

#### Afternoon (4 hours)
- [ ] Build move input form:
  - Move type selector (release/promo/spend)
  - Budget input with line items
  - Release details (format, track count, date)
  - Promo details (channels, duration)
- [ ] Form validation

**Deliverable**: Profile setup + move input UI

---

### Day 6: Frontend - Assessment Display

#### Morning (4 hours)
- [ ] Build assessment display component:
  - Stage indicator badge
  - Triggered rules list
  - Block/advisory badges with color coding
  - Explicit reasoning display (with numbers)
  - Redirect suggestions

#### Afternoon (4 hours)
- [ ] Build creative output viewer:
  - Treatment display
  - Shot list formatting
  - Caption strategy layout
  - Budget breakdown table
- [ ] Add decision history view (simple list)
- [ ] Mobile responsive styling

**Deliverable**: Complete assessment and output UI

---

### Day 7: Polish + Demo Prep

#### Morning (3 hours)
- [ ] End-to-end testing with demo scenarios:
  - Bedroom artist → $200 video → blocked + redirect
  - Local artist → no email list → blocked
  - Regional artist → valid release → approved
- [ ] Fix critical bugs
- [ ] Performance optimization

#### Afternoon (5 hours)
- [ ] Create demo script with 3-4 scenarios
- [ ] Prepare sample creator profiles
- [ ] Record demo video (3-5 minutes)
- [ ] Write README with:
  - Setup instructions
  - Demo walkthrough
  - Rule engine explanation
  - Architecture overview
- [ ] Deploy to Vercel (optional, if time permits)

**Deliverable**: Demo-ready application with documentation

---

## Technical Stack (Simplified)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: JavaScript with JSDoc
- **Storage**: Local JSON files (no database)
- **AI**: IBM Granite API
- **Testing**: Jest

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **State**: React hooks (no global state needed)
- **Forms**: Native HTML5 validation

### Development
- **Environment**: GitHub Codespaces
- **No Auth**: Single-user demo mode
- **No Multi-user**: One profile at a time

---

## File Structure

```
/sideline
├── README.md
├── IMPLEMENTATION_PLAN.md
├── package.json
├── .gitignore
│
├── /src
│   ├── /engine                    # Rule engine (CORE)
│   │   ├── /rules
│   │   │   ├── budget-rules.js
│   │   │   ├── release-rules.js
│   │   │   ├── promo-rules.js
│   │   │   └── rule-types.js
│   │   ├── evaluator.js
│   │   ├── stage-calculator.js
│   │   └── rule-registry.js
│   │
│   ├── /services
│   │   ├── granite-client.js
│   │   ├── creative-generator.js
│   │   └── prompt-templates.js
│   │
│   ├── /storage
│   │   ├── json-store.js
│   │   └── schemas.js
│   │
│   ├── /api                       # Express routes
│   │   ├── profile.js
│   │   ├── assess.js
│   │   ├── generate.js
│   │   └── history.js
│   │
│   └── /cli
│       └── test-rules.js          # CLI testing tool
│
├── /tests
│   ├── /engine
│   │   ├── budget-rules.test.js
│   │   ├── release-rules.test.js
│   │   ├── promo-rules.test.js
│   │   └── evaluator.test.js
│   └── /fixtures
│       └── sample-profiles.js
│
├── /data                          # Local JSON storage
│   ├── profile.json
│   └── history.json
│
├── /app                           # Next.js frontend
│   ├── layout.js
│   ├── page.js                    # Profile setup
│   ├── /assess
│   │   └── page.js                # Move input + assessment
│   ├── /history
│   │   └── page.js                # Decision history
│   └── /api                       # Next.js API routes (proxy to Express)
│
└── /public
    └── /demo                      # Demo assets
```

---

## Rule Engine Structure (Full Fidelity)

### Rule Interface
```javascript
{
  id: string,                      // Unique identifier
  stage: string | 'all',           // Target stage or 'all'
  category: 'budget' | 'release' | 'promo',
  priority: number,                // Evaluation order
  
  trigger: (profile, move) => boolean,
  
  blockReason: (profile, move) => string,  // Must include explicit numbers
  
  redirectAction: {
    type: 'creative_generation',
    prompt: string,
    outputFormat: string,
    constraints: object
  },
  
  severity: 'block' | 'advisory'
}
```

### Example: Budget Rule (Bedroom Stage)
```javascript
{
  id: 'budget-bedroom-line-item',
  stage: 'bedroom',
  category: 'budget',
  priority: 1,
  
  trigger: (profile, move) => {
    return profile.metrics.monthlyListeners <= 500 && 
           move.lineItems.some(item => item.amount > 75);
  },
  
  blockReason: (profile, move) => {
    const overBudget = move.lineItems.filter(i => i.amount > 75);
    const item = overBudget[0];
    return `At Bedroom stage (${profile.metrics.monthlyListeners} monthly listeners), ` +
           `single line items over $75 have 89% failure rate. ` +
           `Your ${item.name} at $${item.amount} exceeds this by $${item.amount - 75}. ` +
           `Artists at your stage see 3x better ROI on organic content under $50.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: `Generate a low-budget alternative for ${move.lineItems[0].name} ` +
            `under $75 that works for Bedroom stage artists (0-500 monthly listeners). ` +
            `Focus on DIY execution, smartphone filming, and organic distribution.`,
    outputFormat: 'treatment_with_shot_list',
    constraints: {
      maxBudget: 75,
      equipment: 'smartphone',
      crew: 'solo or 1 friend'
    }
  },
  
  severity: 'block'
}
```

---

## Demo Scenarios (Prepared)

### Scenario 1: Bedroom Artist - Music Video Block
- **Profile**: 250 monthly listeners, $500 budget, no email list
- **Move**: $300 music video production
- **Expected**: BLOCKED - exceeds $150 cap and $75 line item limit
- **Redirect**: DIY smartphone video treatment under $50

### Scenario 2: Local Artist - No Capture Block
- **Profile**: 2,000 monthly listeners, $800 budget, no email list
- **Move**: Single release with $200 promo budget
- **Expected**: BLOCKED - zero audience capture
- **Redirect**: Email capture strategy + landing page setup

### Scenario 3: Regional Artist - Valid Release
- **Profile**: 8,000 monthly listeners, $2,000 budget, 500-person email list
- **Move**: EP release with $1,200 budget, 8-week spacing
- **Expected**: APPROVED - all checks pass
- **Output**: Release timeline and promo strategy

### Scenario 4: Breaking Artist - Advisory Only
- **Profile**: 30,000 monthly listeners, $8,000 budget
- **Move**: Album release with $6,000 budget
- **Expected**: ADVISORY - over $5k cap but not blocked
- **Output**: Risk assessment + optimization suggestions

---

## Cut Features (Not in Hackathon Build)

❌ User authentication
❌ Multi-user support
❌ Database (using JSON files)
❌ User accounts/profiles
❌ Payment processing
❌ Email notifications
❌ Social media integrations
❌ Analytics dashboard
❌ Admin panel
❌ API rate limiting
❌ Production deployment infrastructure
❌ Outcome tracking over time
❌ A/B testing framework

---

## Success Criteria (Hackathon Demo)

### Must Have ✅
- [ ] Rule engine with all 12+ rules encoded as inspectable code
- [ ] Each rule includes trigger, block reason with numbers, redirect action
- [ ] 100% test coverage for rule logic
- [ ] CLI tool demonstrates rule evaluation
- [ ] Working assessment flow (profile → move → assessment → redirect)
- [ ] IBM Granite generates creative output for redirects
- [ ] Web UI for profile setup, move input, assessment display
- [ ] 3-4 demo scenarios prepared and tested
- [ ] README with setup instructions and architecture explanation

### Nice to Have 🎯
- [ ] Decision history view
- [ ] Mobile-responsive design
- [ ] Demo video recording
- [ ] Deployed to Vercel
- [ ] Performance optimization (<2s assessment)

---

## Daily Checkpoints

**End of Day 1**: Rule engine structure complete, can evaluate rules via code
**End of Day 2**: All rules tested, CLI tool working
**End of Day 3**: Data persistence + creative generation working
**End of Day 4**: API endpoints functional, can test with curl
**End of Day 5**: Can create profile and input moves via UI
**End of Day 6**: Can see assessment results and creative output
**End of Day 7**: Demo-ready with documentation

---

## Risk Mitigation

### Technical Risks
1. **IBM Granite API issues**: Build mock generator that returns structured text
2. **Time pressure**: Rule engine is non-negotiable, cut UI polish if needed
3. **Scope creep**: Stick to single-user, local storage, no auth

### Demo Risks
1. **Live demo failures**: Pre-record video backup
2. **API latency**: Cache sample generations
3. **Edge cases**: Test thoroughly with prepared scenarios

---

## Post-Hackathon Roadmap

If continuing development after demo:
1. Add user authentication (Clerk/Auth0)
2. Migrate to PostgreSQL
3. Add outcome tracking
4. Build analytics dashboard
5. Multi-user support
6. Production deployment
7. Mobile app (React Native)

---

## Getting Started

```bash
# Day 1 Morning
npm init -y
npm install express jest
mkdir -p src/engine/rules tests/engine data

# Start with rule engine
node src/cli/test-rules.js
npm test
```

**Critical Path**: Rule engine → Tests → API → UI. Do not skip ahead.