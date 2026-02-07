import axios from 'axios';
import { getValidEnvKey } from '../utils/keys';

// V1: Job search without AI enhancement
// AI enhancement is disabled in V1 mode - returns basic job listings only

export interface JobSearchParams {
  keywords?: string;
  location?: string;
  radius?: number;
  limit?: number;
  salaryMin?: number;
  experienceLevel?: 'entry' | 'mid' | 'senior';
  jobType?: 'full-time' | 'part-time' | 'contract' | 'temporary';
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  type: string;
  url: string;
  postedDate: string;
  requirements?: string[];
  source: string;
}

export class JobSearchService {
  /**
   * Search for jobs using multiple APIs
   */
  async searchJobs(params: JobSearchParams): Promise<JobListing[]> {
    const results: JobListing[] = [];

    try {
      // Try Indeed API first
      if (process.env.INDEED_API_KEY) {
        const indeedJobs = await this.searchIndeedJobs(params);
        results.push(...indeedJobs);
      }

      // Try Adzuna API as backup
      if (process.env.ADZUNA_API_ID && process.env.ADZUNA_API_KEY && results.length < 5) {
        const adzunaJobs = await this.searchAdzunaJobs(params);
        results.push(...adzunaJobs);
      }

      // If no external APIs available, use mock data for development
      if (results.length === 0) {
        const mockJobs = this.getMockJobs(params);
        results.push(...mockJobs);
      }

      // Deduplicate and limit results
      const uniqueJobs = this.deduplicateJobs(results);
      const limitedJobs = uniqueJobs.slice(0, params.limit || 10);

      // V1: Return basic job listings without AI enhancement
      // AI enhancement disabled to eliminate OpenAI dependency
      return limitedJobs;
    } catch (error) {
      console.error('Job search error:', error);
      return this.getMockJobs(params);
    }
  }

  /**
   * Search Indeed API (requires API key)
   */
  private async searchIndeedJobs(params: JobSearchParams): Promise<JobListing[]> {
    try {
      // Note: Indeed's API is limited and requires approval
      // This is a simplified implementation
      const response = await axios.get('https://api.indeed.com/ads/apisearch', {
        params: {
          publisher: process.env.INDEED_API_KEY,
          q: params.keywords,
          l: params.location,
          radius: params.radius || 25,
          limit: params.limit || 10,
          format: 'json',
          v: '2',
        },
      });

      return response.data.results?.map((job: any) => ({
        id: job.jobkey,
        title: job.jobtitle,
        company: job.company,
        location: job.formattedLocation,
        description: job.snippet,
        salary: job.formattedSalary,
        type: job.jobtype,
        url: job.url,
        postedDate: job.date,
        source: 'Indeed',
      })) || [];
    } catch (error) {
      console.error('Indeed API error:', error);
      return [];
    }
  }

  /**
   * Search Adzuna API
   */
  private async searchAdzunaJobs(params: JobSearchParams): Promise<JobListing[]> {
    try {
      const response = await axios.get(
        `https://api.adzuna.com/v1/api/jobs/us/search/1`,
        {
          params: {
            app_id: process.env.ADZUNA_API_ID,
            app_key: process.env.ADZUNA_API_KEY,
            what: params.keywords,
            where: params.location,
            distance: params.radius || 25,
            results_per_page: params.limit || 10,
            sort_by: 'relevance',
          },
        }
      );

      return response.data.results?.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        description: job.description,
        salary: job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : undefined,
        type: job.contract_type,
        url: job.redirect_url,
        postedDate: job.created,
        source: 'Adzuna',
      })) || [];
    } catch (error) {
      console.error('Adzuna API error:', error);
      return [];
    }
  }

  /**
   * Generate mock job data for development/demo
   */
  private getMockJobs(params: JobSearchParams): JobListing[] {
    const mockJobs = [
      {
        id: 'mock-1',
        title: 'Customer Service Representative',
        company: 'RetailCorp',
        location: params.location || 'Local Area',
        description: 'Provide excellent customer service and support. No experience required - we provide training.',
        salary: '$15-18/hour',
        type: 'full-time',
        url: '#',
        postedDate: '2 days ago',
        requirements: ['Good communication skills', 'Reliable', 'Positive attitude'],
        source: 'Demo',
      },
      {
        id: 'mock-2',
        title: 'Warehouse Associate',
        company: 'LogisticsPro',
        location: params.location || 'Local Area',
        description: 'Entry-level warehouse position. Includes package handling and inventory management.',
        salary: '$16-20/hour',
        type: 'full-time',
        url: '#',
        postedDate: '1 day ago',
        requirements: ['Ability to lift 50lbs', 'Reliable transportation', 'Team player'],
        source: 'Demo',
      },
      {
        id: 'mock-3',
        title: 'Food Service Worker',
        company: 'Community Kitchen',
        location: params.location || 'Local Area',
        description: 'Join our team helping serve meals to the community. Flexible hours available.',
        salary: '$14-16/hour',
        type: 'part-time',
        url: '#',
        postedDate: '3 days ago',
        requirements: ['Food safety knowledge helpful', 'Compassionate', 'Flexible schedule'],
        source: 'Demo',
      },
      {
        id: 'mock-4',
        title: 'General Laborer',
        company: 'Construction Plus',
        location: params.location || 'Local Area',
        description: 'General construction and maintenance work. Will train the right candidate.',
        salary: '$18-22/hour',
        type: 'full-time',
        url: '#',
        postedDate: '1 week ago',
        requirements: ['Physical fitness', 'Willingness to learn', 'Safety conscious'],
        source: 'Demo',
      },
      {
        id: 'mock-5',
        title: 'Delivery Driver',
        company: 'QuickDelivery',
        location: params.location || 'Local Area',
        description: 'Deliver packages and food orders. Use your own vehicle or company provided.',
        salary: '$12/hour + tips',
        type: 'part-time',
        url: '#',
        postedDate: '5 days ago',
        requirements: ['Valid driver license', 'Clean driving record', 'Own vehicle preferred'],
        source: 'Demo',
      },
    ];

    // Filter based on keywords if provided
    if (params.keywords) {
      const keywords = params.keywords.toLowerCase();
      return mockJobs.filter(job => 
        job.title.toLowerCase().includes(keywords) ||
        job.description.toLowerCase().includes(keywords) ||
        job.requirements?.some(req => req.toLowerCase().includes(keywords))
      );
    }

    return mockJobs.slice(0, params.limit || 5);
  }

  /**
   * Remove duplicate job listings
   */
  private deduplicateJobs(jobs: JobListing[]): JobListing[] {
    const seen = new Set();
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}`.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Enhance job listings with AI analysis (V1: DISABLED)
   * @deprecated V1 does not use AI enhancement - returns jobs unmodified
   */
  private async enhanceJobListings(jobs: JobListing[], params: JobSearchParams): Promise<JobListing[]> {
    // V1: No AI enhancement - return jobs as-is
    console.log('[JobSearch] V1 mode - AI enhancement disabled');
    return jobs;
  }

  /**
   * Get job search suggestions based on user profile
   */
  async getJobSuggestions(userProfile: any): Promise<{
    searchTerms: string[];
    locations: string[];
    tips: string[];
  }> {
    try {
      const prompt = `Based on this user profile, suggest job search strategies:

Profile: ${JSON.stringify(userProfile, null, 2)}

Provide:
1. 3-5 relevant search terms/keywords
2. 2-3 location suggestions if location is provided
3. 3-5 job search tips specific to their situation

Respond in JSON format.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const suggestions = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        searchTerms: suggestions.searchTerms || [],
        locations: suggestions.locations || [],
        tips: suggestions.tips || [],
      };
    } catch (error) {
      console.error('Job suggestions error:', error);
      return {
        searchTerms: ['entry level', 'no experience', 'will train'],
        locations: ['local area'],
        tips: [
          'Focus on jobs that offer training',
          'Highlight your reliability and willingness to learn',
          'Consider part-time positions that could lead to full-time',
        ],
      };
    }
  }

  /**
   * Generate a personalized cover letter
   */
  async generateCoverLetter(job: JobListing, userProfile: any): Promise<string> {
    const prompt = `Write a personalized cover letter for this job application:

Job: ${JSON.stringify(job, null, 2)}
User Profile: ${JSON.stringify(userProfile, null, 2)}

Write a professional but personal cover letter that:
- Addresses the hiring manager
- Shows genuine interest in the role
- Highlights relevant skills and experience
- Explains how they can contribute
- Shows understanding of the company/role
- Is 2-3 paragraphs
- Maintains a hopeful, professional tone`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('Cover letter generation error:', error);
      return `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}. I believe my background and enthusiasm make me a strong candidate for this role.

${userProfile.skills ? `My skills in ${userProfile.skills.join(', ')} align well with your requirements.` : 'I am eager to learn and contribute to your team.'} I am particularly drawn to this opportunity because of ${job.company}'s reputation and the chance to grow professionally.

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your team.

Sincerely,
${userProfile.name || '[Your Name]'}`;
    }
  }
}
