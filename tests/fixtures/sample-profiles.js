/**
 * Sample Creator Profiles for Testing
 */

import { STAGES } from '../../src/engine/stage-calculator.js';

/**
 * Bedroom stage artist - minimal audience
 */
export const bedroomArtist = {
  id: 'bedroom-001',
  name: 'Bedroom Artist',
  stage: STAGES.BEDROOM,
  metrics: {
    monthlyListeners: 250,
    followers: {
      instagram: 150,
      tiktok: 300,
      spotify: 100
    },
    engagementRate: 0.08
  },
  audienceCapture: {
    hasEmailList: false,
    emailListSize: 0,
    hasWhatsApp: false,
    whatsappListSize: 0
  },
  budget: {
    totalAvailable: 500,
    currency: 'USD'
  }
};

/**
 * Bedroom stage artist with email list
 */
export const bedroomArtistWithCapture = {
  id: 'bedroom-002',
  name: 'Bedroom Artist with Capture',
  stage: STAGES.BEDROOM,
  metrics: {
    monthlyListeners: 450,
    followers: {
      instagram: 500,
      tiktok: 800,
      spotify: 200
    },
    engagementRate: 0.12
  },
  audienceCapture: {
    hasEmailList: true,
    emailListSize: 75,
    hasWhatsApp: false,
    whatsappListSize: 0
  },
  budget: {
    totalAvailable: 300,
    currency: 'USD'
  }
};

/**
 * Local stage artist
 */
export const localArtist = {
  id: 'local-001',
  name: 'Local Artist',
  stage: STAGES.RISING,
  metrics: {
    monthlyListeners: 2500,
    followers: {
      instagram: 1200,
      tiktok: 2000,
      spotify: 800
    },
    engagementRate: 0.06
  },
  audienceCapture: {
    hasEmailList: true,
    emailListSize: 200,
    hasWhatsApp: false,
    whatsappListSize: 0
  },
  budget: {
    totalAvailable: 1000,
    currency: 'USD'
  }
};

/**
 * Local stage artist without capture
 */
export const localArtistNoCapture = {
  id: 'local-002',
  name: 'Local Artist No Capture',
  stage: STAGES.RISING,
  metrics: {
    monthlyListeners: 3500,
    followers: {
      instagram: 2000,
      tiktok: 3500,
      spotify: 1500
    },
    engagementRate: 0.05
  },
  audienceCapture: {
    hasEmailList: false,
    emailListSize: 0,
    hasWhatsApp: false,
    whatsappListSize: 0
  },
  budget: {
    totalAvailable: 800,
    currency: 'USD'
  }
};

/**
 * Regional stage artist
 */
export const regionalArtist = {
  id: 'regional-001',
  name: 'Regional Artist',
  stage: STAGES.ESTABLISHED,
  metrics: {
    monthlyListeners: 12000,
    followers: {
      instagram: 8000,
      tiktok: 15000,
      spotify: 5000
    },
    engagementRate: 0.04
  },
  audienceCapture: {
    hasEmailList: true,
    emailListSize: 1200,
    hasWhatsApp: true,
    whatsappListSize: 300
  },
  budget: {
    totalAvailable: 3000,
    currency: 'USD'
  }
};

/**
 * Breaking stage artist
 */
export const breakingArtist = {
  id: 'breaking-001',
  name: 'Breaking Artist',
  stage: STAGES.BREAKOUT,
  metrics: {
    monthlyListeners: 35000,
    followers: {
      instagram: 25000,
      tiktok: 50000,
      spotify: 15000
    },
    engagementRate: 0.03
  },
  audienceCapture: {
    hasEmailList: true,
    emailListSize: 5000,
    hasWhatsApp: true,
    whatsappListSize: 1500
  },
  budget: {
    totalAvailable: 10000,
    currency: 'USD'
  }
};

/**
 * Sample planned moves
 */

export const bedroomExpensiveVideo = {
  type: 'spend',
  description: 'Professional music video production',
  budget: 300,
  lineItems: [
    { name: 'Music Video Production', amount: 300, category: 'video' }
  ]
};

export const bedroomOverBudgetLineItem = {
  type: 'spend',
  description: 'Music video with expensive single item',
  budget: 150,
  lineItems: [
    { name: 'Professional Videographer', amount: 100, category: 'video' },
    { name: 'Location Rental', amount: 50, category: 'video' }
  ]
};

export const bedroomValidBudget = {
  type: 'spend',
  description: 'DIY music video',
  budget: 120,
  lineItems: [
    { name: 'Smartphone Gimbal', amount: 60, category: 'equipment' },
    { name: 'Lighting Kit', amount: 40, category: 'equipment' },
    { name: 'Props', amount: 20, category: 'production' }
  ]
};

export const localExpensiveVideo = {
  type: 'spend',
  description: 'High-end music video',
  budget: 400,
  lineItems: [
    { name: 'Music Video Production', amount: 250, category: 'video' },
    { name: 'Color Grading', amount: 150, category: 'post-production' }
  ]
};

export const localValidVideo = {
  type: 'spend',
  description: 'Multi-video content strategy',
  budget: 350,
  lineItems: [
    { name: 'Video 1 - Performance', amount: 100, category: 'video' },
    { name: 'Video 2 - Behind the Scenes', amount: 80, category: 'video' },
    { name: 'Video 3 - Lyric Video', amount: 70, category: 'video' },
    { name: 'Social Media Edits', amount: 100, category: 'content' }
  ]
};

export const regionalOverBudget = {
  type: 'spend',
  description: 'Large campaign',
  budget: 2000,
  lineItems: [
    { name: 'Music Video', amount: 800, category: 'video' },
    { name: 'PR Campaign', amount: 600, category: 'pr', duration: '2 months' },
    { name: 'Paid Ads', amount: 600, category: 'paid_ads' }
  ]
};

export const regionalShortPR = {
  type: 'spend',
  description: 'Short PR retainer',
  budget: 1200,
  lineItems: [
    { name: 'PR Retainer', amount: 800, category: 'pr', duration: '2 months' },
    { name: 'Content Creation', amount: 400, category: 'content' }
  ]
};

export const regionalValidPR = {
  type: 'spend',
  description: 'Proper PR campaign',
  budget: 1500,
  lineItems: [
    { name: 'PR Retainer', amount: 1200, category: 'pr', duration: '3 months' },
    { name: 'Press Kit', amount: 300, category: 'content' }
  ]
};

export const breakingHighBudget = {
  type: 'spend',
  description: 'Major campaign',
  budget: 8000,
  lineItems: [
    { name: 'Music Video', amount: 3000, category: 'video' },
    { name: 'PR Campaign', amount: 2500, category: 'pr', duration: '3 months' },
    { name: 'Paid Ads', amount: 2500, category: 'paid_ads' }
  ]
};

export const singleReleaseNoCapture = {
  type: 'release',
  description: 'Single release without email list',
  budget: 200,
  lineItems: [
    { name: 'Distribution', amount: 50, category: 'distribution' },
    { name: 'Artwork', amount: 150, category: 'creative' }
  ],
  releaseDetails: {
    format: 'single',
    trackCount: 1,
    releaseDate: '2026-09-01'
  }
};

export const albumReleaseLowListeners = {
  type: 'release',
  description: 'Album release at bedroom stage',
  budget: 300,
  lineItems: [
    { name: 'Distribution', amount: 100, category: 'distribution' },
    { name: 'Artwork', amount: 200, category: 'creative' }
  ],
  releaseDetails: {
    format: 'album',
    trackCount: 10,
    releaseDate: '2026-10-01'
  }
};

export const singleReleaseTooSoon = {
  type: 'release',
  description: 'Single released too soon after previous',
  budget: 150,
  lineItems: [
    { name: 'Distribution', amount: 50, category: 'distribution' },
    { name: 'Promotion', amount: 100, category: 'promo' }
  ],
  releaseDetails: {
    format: 'single',
    trackCount: 1,
    releaseDate: '2026-08-15',
    lastReleaseDate: '2026-07-20'
  }
};

export const singleReleaseProperSpacing = {
  type: 'release',
  description: 'Single with proper spacing',
  budget: 200,
  lineItems: [
    { name: 'Distribution', amount: 50, category: 'distribution' },
    { name: 'Promotion', amount: 150, category: 'promo' }
  ],
  releaseDetails: {
    format: 'single',
    trackCount: 1,
    releaseDate: '2026-09-15',
    lastReleaseDate: '2026-07-20'
  }
};

export const bedroomPaidAds = {
  type: 'promo',
  description: 'Paid ads at bedroom stage',
  budget: 100,
  lineItems: [
    { name: 'Facebook Ads', amount: 100, category: 'paid_ads' }
  ],
  promoDetails: {
    channels: ['Facebook', 'Instagram'],
    duration: '2 weeks'
  }
};

export const localPaidAdsNoCapture = {
  type: 'promo',
  description: 'Paid ads without capture',
  budget: 200,
  lineItems: [
    { name: 'Instagram Ads', amount: 200, category: 'paid_ads' }
  ],
  promoDetails: {
    channels: ['Instagram', 'TikTok'],
    duration: '3 weeks'
  }
};

export const bedroomPlaylistService = {
  type: 'promo',
  description: 'Playlist pitching service',
  budget: 150,
  lineItems: [
    { name: 'SubmitHub Credits', amount: 150, category: 'playlist_service' }
  ]
};

export const localPublicist = {
  type: 'promo',
  description: 'Hire publicist',
  budget: 500,
  lineItems: [
    { name: 'Music Publicist', amount: 500, category: 'pr', duration: '1 month' }
  ]
};
