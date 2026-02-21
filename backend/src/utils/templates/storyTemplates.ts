/**
 * Story Template Library
 *
 * Dignity-preserving, non-exploitative templates for fundraising stories
 * Used in V1 mode to replace AI-generated content
 */

export interface StoryTemplate {
  titleTemplate: string;
  introTemplate: string;
  bodyTemplate: string;
  closingTemplate: string;
  donationPitchTemplate: string;
}

export const STORY_TEMPLATES: Record<string, StoryTemplate> = {
  HOUSING: {
    titleTemplate: "Help {name} Secure Stable Housing",
    introTemplate:
      "{name} is seeking support to secure stable housing and rebuild a foundation for long-term stability.",
    bodyTemplate: `{description}

**How Your Support Helps:**
- Security deposit and first month's rent
- Moving expenses and essential furniture
- Utilities setup and basic household needs

Stable housing is the foundation for everything else - employment, health, and dignity. Your contribution helps create that foundation.`,
    closingTemplate:
      "Every donation brings {name} closer to having a safe place to call home and the stability needed for long-term success.",
    donationPitchTemplate:
      "{name} is working toward stable housing. Your support helps provide the foundation needed for employment and long-term stability.",
  },

  FOOD: {
    titleTemplate: "Support {name}'s Path to Food Security",
    introTemplate:
      "{name} is seeking support to address food insecurity and build toward long-term stability.",
    bodyTemplate: `{description}

**How Your Support Helps:**
- Grocery assistance and nutritious meals
- Connection to food resources and programs
- Support while working toward self-sufficiency

Food security is essential for health, well-being, and the ability to pursue employment and stability.`,
    closingTemplate:
      "Your contribution helps provide the nutrition and support {name} needs to focus on building a better future.",
    donationPitchTemplate:
      "{name} is addressing food insecurity while working toward long-term stability. Your support helps meet immediate needs while building toward self-sufficiency.",
  },

  JOBS: {
    titleTemplate: "Help {name} Return to Employment",
    introTemplate:
      "{name} is seeking support to overcome barriers to employment and rebuild financial stability.",
    bodyTemplate: `{description}

**How Your Support Helps:**
- Work clothes, tools, and equipment
- Transportation to job interviews and work
- Certification programs and skill development
- Support during the transition period

Employment is the path to independence and dignity. Your contribution helps remove barriers and create opportunities.`,
    closingTemplate:
      "Every donation helps {name} move closer to stable employment and financial independence.",
    donationPitchTemplate:
      "{name} has valuable skills and is ready to work. Your support helps overcome barriers to employment and rebuild financial stability.",
  },

  HEALTH: {
    titleTemplate: "Support {name}'s Health and Recovery",
    introTemplate:
      "{name} is seeking support to address health challenges while working toward overall stability.",
    bodyTemplate: `{description}

**How Your Support Helps:**
- Access to medical care and prescriptions
- Health-related expenses and supplies
- Transportation to medical appointments
- Support during recovery

Health is foundational to everything else. Your contribution helps address medical needs while building toward stability.`,
    closingTemplate:
      "Your support helps {name} address health challenges and work toward overall well-being and stability.",
    donationPitchTemplate:
      "{name} is addressing health challenges while working toward stability. Your support helps ensure access to needed care and recovery.",
  },

  EDUCATION: {
    titleTemplate: "Help {name} Pursue Education and Training",
    introTemplate:
      "{name} is seeking support to pursue education and skill development for long-term career success.",
    bodyTemplate: `{description}

**How Your Support Helps:**
- Tuition and training program fees
- Books, supplies, and equipment
- Transportation to classes
- Support during the learning period

Education and skills open doors to better opportunities. Your contribution invests in {name}'s future success.`,
    closingTemplate:
      "Every donation helps {name} gain the skills and credentials needed for long-term career success.",
    donationPitchTemplate:
      "{name} is pursuing education and training for long-term success. Your support helps overcome financial barriers to learning.",
  },

  SAFETY: {
    titleTemplate: "Help {name} Find Safety and Stability",
    introTemplate:
      "{name} is seeking support to move to a safe environment and rebuild stability.",
    bodyTemplate: `{description}

**How Your Support Helps:**
- Safe temporary housing
- Essential needs during transition
- Connection to support services
- Building toward long-term stability

Safety is a fundamental human need. Your contribution helps provide a secure environment for healing and growth.`,
    closingTemplate:
      "Your support helps {name} find safety and begin the journey toward healing and stability.",
    donationPitchTemplate:
      "{name} is working toward safety and stability. Your support helps provide a secure environment for healing and growth.",
  },

  GENERAL: {
    titleTemplate: "Support {name}'s Journey to Stability",
    introTemplate:
      "{name} is seeking support to overcome current challenges and build toward long-term stability.",
    bodyTemplate: `{description}

**How Your Support Helps:**
- Address immediate needs
- Connect to resources and services
- Build toward self-sufficiency
- Create a foundation for long-term success

Every person deserves dignity and opportunity. Your contribution helps create pathways to stability and independence.`,
    closingTemplate:
      "Every donation helps {name} move closer to stability, independence, and long-term success.",
    donationPitchTemplate:
      "{name} is working to overcome challenges and build toward stability. Your support provides dignity, opportunity, and hope.",
  },
};

/**
 * Donation pitch templates (2-3 sentences)
 */
export const DONATION_PITCH_TEMPLATES: Record<string, string[]> = {
  HOUSING: [
    "{name} is seeking stable housing after experiencing housing insecurity. Your support helps provide the foundation needed for employment and long-term stability.",
    "Meet {name}, who is working toward secure housing. Every contribution brings {name} closer to having a safe place to call home and the stability needed for success.",
  ],
  FOOD: [
    "{name} is addressing food insecurity while working toward long-term stability. Your support helps meet immediate nutritional needs.",
    "Support {name}'s journey to food security. Your contribution helps provide nutritious meals while building toward self-sufficiency.",
  ],
  JOBS: [
    "{name} has valuable skills and is ready to work. Your support helps overcome barriers to employment and rebuild financial independence.",
    "Help {name} return to employment. Your contribution removes barriers and creates opportunities for stable income and dignity.",
  ],
  HEALTH: [
    "{name} is addressing health challenges while working toward overall stability. Your support helps ensure access to needed medical care.",
    "Support {name}'s health and recovery. Your contribution helps address medical needs while building toward overall well-being.",
  ],
  EDUCATION: [
    "{name} is pursuing education and training for long-term career success. Your support helps overcome financial barriers to learning.",
    "Invest in {name}'s future through education. Your contribution helps gain the skills and credentials needed for success.",
  ],
  SAFETY: [
    "{name} is seeking a safe environment to heal and rebuild. Your support helps provide security and stability.",
    "Help {name} find safety and begin the journey toward healing. Your contribution provides a secure foundation for growth.",
  ],
  GENERAL: [
    "{name} is working to overcome challenges and build toward stability. Your support provides dignity, opportunity, and hope.",
    "Support {name}'s journey to independence. Every contribution helps create pathways to stability and long-term success.",
  ],
};

/**
 * Fallback pitch when no specific category matches
 */
export const FALLBACK_DONATION_PITCH =
  "Every contribution helps provide stability and opportunity. Your support makes a meaningful difference.";

/**
 * Interpolate template with data
 */
export function interpolateTemplate(
  template: string,
  data: Record<string, any>,
): string {
  let result = template;

  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{${key}}`;
    const replacement = value != null ? String(value) : "";
    result = result.replace(new RegExp(placeholder, "g"), replacement);
  }

  return result;
}

/**
 * Select appropriate template based on primary need
 */
export function selectStoryTemplate(primaryNeed?: string): StoryTemplate {
  if (!primaryNeed) {
    return STORY_TEMPLATES.GENERAL;
  }

  return STORY_TEMPLATES[primaryNeed] || STORY_TEMPLATES.GENERAL;
}

/**
 * Select donation pitch template
 */
export function selectDonationPitchTemplate(primaryNeed?: string): string {
  if (!primaryNeed || !DONATION_PITCH_TEMPLATES[primaryNeed]) {
    return FALLBACK_DONATION_PITCH;
  }

  const templates = DONATION_PITCH_TEMPLATES[primaryNeed];
  // Use first template by default (could randomize in future)
  return templates[0];
}

/**
 * Generate complete story from template and form data
 */
export function generateStoryFromTemplate(data: {
  name?: string;
  primaryNeed?: string;
  description: string;
  goalAmount?: number;
}): {
  title: string;
  story: string;
  excerpt: string;
} {
  const template = selectStoryTemplate(data.primaryNeed);
  const name = data.name || "A community member";

  const templateData = {
    name,
    description: data.description,
  };

  const title = interpolateTemplate(template.titleTemplate, templateData);
  const intro = interpolateTemplate(template.introTemplate, templateData);
  const body = interpolateTemplate(template.bodyTemplate, templateData);
  const closing = interpolateTemplate(template.closingTemplate, templateData);

  const story = `${intro}\n\n${body}\n\n${closing}`;

  // Generate 90-word excerpt from intro
  const words = intro.split(/\s+/).slice(0, 90);
  const excerpt = words.join(" ") + (words.length >= 90 ? "..." : "");

  return {
    title,
    story,
    excerpt,
  };
}

/**
 * Generate donation pitch from template
 */
export function generateDonationPitchFromTemplate(data: {
  name?: string;
  primaryNeed?: string;
  skills?: string[];
}): string {
  const template = selectDonationPitchTemplate(data.primaryNeed);
  const name = data.name || "This community member";

  return interpolateTemplate(template, { name });
}
