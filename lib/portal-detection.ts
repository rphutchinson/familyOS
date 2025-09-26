import { PortalDetectionResult } from '@/types';

// Common healthcare portal platforms and their identifying patterns
const PORTAL_PATTERNS = {
  'MyChart': [
    /mychart/i,
    /epic/i,
    /chart\..*\.com/i,
    /mychart\..*\.org/i
  ],
  'Epic': [
    /epic/i,
    /myepic/i,
    /epicmychart/i
  ],
  'Cerner': [
    /cerner/i,
    /powerchart/i,
    /healthelife/i
  ],
  'AllScripts': [
    /allscripts/i,
    /followmyhealth/i,
    /myallscripts/i
  ],
  'athenahealth': [
    /athenahealth/i,
    /athenacollector/i,
    /athenanet/i
  ],
  'NextGen': [
    /nextgen/i,
    /nextmd/i
  ],
  'Patient Portal': [
    /patient.*portal/i,
    /portal.*patient/i,
    /healthportal/i
  ]
};

// Healthcare-related keywords that indicate this might be a medical site
const HEALTHCARE_KEYWORDS = [
  'health', 'medical', 'clinic', 'hospital', 'doctor', 'physician',
  'patient', 'care', 'wellness', 'medicine', 'therapy', 'dental',
  'vision', 'eye', 'cardiology', 'pediatric', 'family practice',
  'urgent care', 'emergency', 'surgery', 'orthopedic', 'dermatology'
];

/**
 * Detects if a URL appears to be a healthcare portal
 * This is designed to work with current page analysis or URL checking
 */
export function detectHealthcarePortal(
  url: string, 
  pageTitle?: string, 
  siteName?: string
): PortalDetectionResult | null {
  
  const fullText = `${url} ${pageTitle || ''} ${siteName || ''}`.toLowerCase();
  
  // Check for healthcare portal patterns
  let confidence = 0.3; // Base confidence for any healthcare site
  
  // Check against known portal patterns
  for (const [, patterns] of Object.entries(PORTAL_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(fullText)) {
        confidence = Math.min(0.95, confidence + 0.4);
        break;
      }
    }
    if (confidence > 0.7) break; // Found a strong match
  }
  
  // Check for general healthcare keywords
  const healthcareKeywordCount = HEALTHCARE_KEYWORDS.filter(keyword => 
    fullText.includes(keyword)
  ).length;
  
  if (healthcareKeywordCount > 0) {
    confidence = Math.min(0.9, confidence + (healthcareKeywordCount * 0.1));
  }
  
  // Must have at least some confidence to be considered a healthcare portal
  if (confidence < 0.4) {
    return null;
  }
  
  // Extract site name from URL if not provided
  let extractedSiteName = siteName;
  if (!extractedSiteName) {
    try {
      const urlObj = new URL(url);
      extractedSiteName = urlObj.hostname
        .replace('www.', '')
        .split('.')[0]
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    } catch {
      extractedSiteName = 'Healthcare Portal';
    }
  }
  
  return {
    siteName: extractedSiteName,
    confidence,
    favicon: `${new URL(url).origin}/favicon.ico`
  };
}

/**
 * Generates a bookmarklet that can detect the current page
 * This would be used for the quick-add functionality
 */
export function generateBookmarklet(): string {
  return `javascript:(function(){
    const url = window.location.href;
    const title = document.title;
    const siteName = document.querySelector('meta[property="og:site_name"]')?.content || 
                    document.querySelector('meta[name="application-name"]')?.content ||
                    title;
    
    // Simple portal detection in bookmarklet
    const isHealthcare = /health|medical|clinic|hospital|patient|portal|mychart|epic|cerner/i.test(url + ' ' + title);
    
    if (isHealthcare) {
      // This would POST to our app or open it with parameters
      window.open('http://localhost:3001?quickadd=true&url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title) + '&site=' + encodeURIComponent(siteName), '_blank');
    } else {
      alert('This does not appear to be a healthcare portal.');
    }
  })();`;
}

/**
 * Browser extension manifest for Chrome/Firefox extension approach
 */
export const EXTENSION_MANIFEST = {
  manifest_version: 3,
  name: "Healthcare Portal Quick Add",
  version: "1.0",
  description: "Quickly add healthcare portals to your organizer",
  permissions: ["activeTab"],
  action: {
    default_popup: "popup.html",
    default_title: "Quick Add Portal"
  },
  content_scripts: [{
    matches: ["*://*/*"],
    js: ["content.js"]
  }]
};

/**
 * URL analysis for when user manually enters a URL
 */
export function analyzePortalUrl(url: string): PortalDetectionResult | null {
  try {
    new URL(url); // Validate URL format
  } catch {
    return null;
  }
  
  return detectHealthcarePortal(url);
}