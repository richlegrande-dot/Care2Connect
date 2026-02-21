import { Request, Response } from 'express';
import { ChatAssistantService } from '../services/chatAssistantService';
import { prisma } from '../utils/database';

const chatAssistantService = new ChatAssistantService();

export class ChatController {
  /**
   * Send a message to the AI assistant
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const { userId, message } = req.body;

      if (!userId || !message) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'User ID and message are required',
        });
      }

      // Get user profile with context
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      // Get recent conversation history
      const recentMessages = await prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      const conversationHistory = recentMessages
        .reverse()
        .map(msg => ({
          role: msg.role.toLowerCase(),
          content: msg.content,
        }));

      // Generate AI response
      const aiResponse = await chatAssistantService.generateResponse(
        conversationHistory,
        message,
        user.profile
      );

      // Save user message
      await prisma.message.create({
        data: {
          userId,
          role: 'USER',
          content: message,
        },
      });

      // Save AI response
      const aiMessage = await prisma.message.create({
        data: {
          userId,
          role: 'ASSISTANT',
          content: aiResponse,
        },
      });

      // Generate follow-up questions
      const followUpQuestions = await chatAssistantService.generateFollowUpQuestions(
        conversationHistory,
        user.profile
      );

      res.status(200).json({
        success: true,
        data: {
          response: aiResponse,
          messageId: aiMessage.id,
          followUpQuestions,
          timestamp: aiMessage.createdAt,
        },
      });
    } catch (error) {
      console.error('Chat message error:', error);
      res.status(500).json({
        error: 'Failed to process message',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Get conversation history
   */
  static async getConversationHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const messages = await prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      });

      const totalMessages = await prisma.message.count({
        where: { userId },
      });

      res.status(200).json({
        success: true,
        data: {
          messages: messages.reverse(), // Return in chronological order
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalMessages,
            pages: Math.ceil(totalMessages / Number(limit)),
          },
        },
      });
    } catch (error) {
      console.error('Conversation history error:', error);
      res.status(500).json({
        error: 'Failed to retrieve conversation history',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Get conversation starters
   */
  static async getConversationStarters(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      const starters = await chatAssistantService.generateConversationStarters(user.profile);

      res.status(200).json({
        success: true,
        data: {
          starters,
        },
      });
    } catch (error) {
      console.error('Conversation starters error:', error);
      res.status(500).json({
        error: 'Failed to generate conversation starters',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Clear conversation history
   */
  static async clearConversation(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { confirmClear } = req.body;

      if (!confirmClear) {
        return res.status(400).json({
          error: 'Confirmation required',
          message: 'Please confirm clearing conversation by setting confirmClear to true',
        });
      }

      const deletedCount = await prisma.message.deleteMany({
        where: { userId },
      });

      res.status(200).json({
        success: true,
        data: {
          deletedMessages: deletedCount.count,
        },
      });
    } catch (error) {
      console.error('Clear conversation error:', error);
      res.status(500).json({
        error: 'Failed to clear conversation',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Get chat statistics
   */
  static async getChatStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const stats = await prisma.message.groupBy({
        by: ['role'],
        _count: {
          id: true,
        },
        where: { userId },
      });

      const firstMessage = await prisma.message.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      });

      const lastMessage = await prisma.message.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });

      const statsObject = stats.reduce((acc, stat) => {
        acc[stat.role.toLowerCase()] = stat._count.id;
        return acc;
      }, {} as Record<string, number>);

      res.status(200).json({
        success: true,
        data: {
          messageCount: statsObject,
          totalMessages: (statsObject.user || 0) + (statsObject.assistant || 0),
          firstMessage: firstMessage?.createdAt,
          lastMessage: lastMessage?.createdAt,
        },
      });
    } catch (error) {
      console.error('Chat stats error:', error);
      res.status(500).json({
        error: 'Failed to get chat statistics',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
}
