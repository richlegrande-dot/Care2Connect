import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { getValidEnvKey } from "../utils/keys";
import { getAIProvider } from "../providers/ai";

export class DonationService {
  /**
   * Generate QR code for Cash App donation
   */
  async generateCashAppQRCode(cashtag: string): Promise<string> {
    try {
      // Validate cashtag format
      const cleanCashtag = cashtag.startsWith("$") ? cashtag : `$${cashtag}`;
      const cashAppUrl = `https://cash.app/${cleanCashtag}`;

      // Create QR codes directory if it doesn't exist
      const qrDir = path.join(process.cwd(), "public", "qr-codes");
      if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir, { recursive: true });
      }

      // Generate QR code filename
      const filename = `cashapp-${cleanCashtag.replace("$", "")}-${Date.now()}.png`;
      const filePath = path.join(qrDir, filename);

      // Generate QR code
      await QRCode.toFile(filePath, cashAppUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return `/qr-codes/${filename}`;
    } catch (error) {
      console.error("QR code generation error:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  /**
   * Generate GoFundMe campaign story using AI provider (V1: Template-based)
   */
  async generateGoFundMeStory(profileData: any): Promise<string> {
    try {
      const aiProvider = getAIProvider();
      console.log("[DonationService] Generating story using:", aiProvider.name);

      // Use AI provider abstraction (supports template-based generation in V1)
      const draftResult = await aiProvider.generateGoFundMeDraft({
        formData: {
          name: profileData.name,
          primaryNeed: profileData.urgent_needs?.[0] || "GENERAL",
          description: profileData.summary || "Please add story details.",
          goalAmount: profileData.goalAmount || 5000,
        },
      });

      // Format as story text
      return `${draftResult.title}\n\n${draftResult.story}`;
    } catch (error) {
      console.error("[DonationService] Story generation error:", error);
      // Fallback to basic template
      return `Support ${profileData.name || "a community member"}\n\nPlease add story details manually.`;
    }
  }

  /**
   * Validate Cash App cashtag
   */
  validateCashtag(cashtag: string): {
    valid: boolean;
    formatted?: string;
    error?: string;
  } {
    if (!cashtag) {
      return { valid: false, error: "Cashtag is required" };
    }

    const cleanCashtag = cashtag.trim();

    // Remove $ if present, then validate format
    const tagWithoutDollar = cleanCashtag.startsWith("$")
      ? cleanCashtag.slice(1)
      : cleanCashtag;

    // Cash App cashtag rules:
    // - 3-20 characters
    // - Letters, numbers, underscores only
    // - Must start with a letter
    const cashtagRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;

    if (!cashtagRegex.test(tagWithoutDollar)) {
      return {
        valid: false,
        error:
          "Cashtag must be 3-20 characters, start with a letter, and contain only letters, numbers, and underscores",
      };
    }

    return {
      valid: true,
      formatted: `$${tagWithoutDollar}`,
    };
  }

  /**
   * Validate GoFundMe URL
   */
  validateGoFundMeUrl(url: string): { valid: boolean; error?: string } {
    if (!url) {
      return { valid: false, error: "GoFundMe URL is required" };
    }

    try {
      const urlObj = new URL(url);

      if (!urlObj.hostname.includes("gofundme.com")) {
        return { valid: false, error: "Must be a valid GoFundMe.com URL" };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: "Invalid URL format" };
    }
  }

  /**
   * Track donation (for analytics, not processing)
   */
  async trackDonation(data: {
    userId: string;
    platform: string;
    amount?: number;
    reference?: string;
    donorEmail?: string;
    message?: string;
  }) {
    // Note: This is for tracking purposes only
    // Actual payment processing would happen on the respective platforms
    try {
      // This would typically integrate with your analytics service
      console.log("Donation tracked:", data);

      return {
        success: true,
        message: "Donation tracked successfully",
      };
    } catch (error) {
      console.error("Donation tracking error:", error);
      throw new Error("Failed to track donation");
    }
  }

  /**
   * Get donation statistics for a profile
   */
  async getDonationStats(userId: string) {
    try {
      // In a real implementation, this would aggregate data from various platforms
      // For now, we'll return placeholder data
      return {
        totalRaised: 0,
        donationCount: 0,
        averageDonation: 0,
        platforms: {
          cashapp: { count: 0, amount: 0 },
          gofundme: { count: 0, amount: 0 },
          other: { count: 0, amount: 0 },
        },
        recentDonations: [],
      };
    } catch (error) {
      console.error("Donation stats error:", error);
      throw new Error("Failed to get donation statistics");
    }
  }

  /**
   * Generate donation appeal text for social media
   */
  async generateSocialMediaAppeal(
    profileData: any,
    platform: "twitter" | "facebook" | "instagram" = "twitter",
  ): Promise<string> {
    const maxLength = platform === "twitter" ? 280 : 500;

    const systemPrompt = `Create a ${platform} post to encourage donations. 
    - Keep it under ${maxLength} characters
    - Include relevant hashtags
    - Be compelling but respectful
    - Include a clear call to action`;

    try {
      if (!openai) throw new Error("OpenAI client not configured");
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Create a ${platform} donation appeal for: ${JSON.stringify(profileData, null, 2)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      return completion.choices[0].message.content || "";
    } catch (error) {
      console.error("Social media appeal generation error:", error);
      return "Every contribution makes a difference. Help support someone in need. 🙏 #CareConnect #Community #Support";
    }
  }
}
