import { addNegotiationEvent } from '../db';

/**
 * 自动记录谈判事件的中间件/工具函数
 */

export const trackWebinarEvent = async (
  webinarId: number,
  type: string,
  title: string,
  description?: string,
  userId?: number,
  metadata?: Record<string, any>
) => {
  try {
    const fullDescription = '[' + title + '] ' + (description || '');
    await addNegotiationEvent({
      webinarId,
      type,
      description: fullDescription,
      metadata: {
        ...metadata,
        originalTitle: title
      },
      createdById: userId
    });
  } catch (error) {
    console.error('[AutoEvents] Failed to track event:', error);
  }
};

// 预定义的自动记录逻辑
export const autoEventMiddleware = {
  onWebinarStart: async (webinarId: number, userId: number) => {
    await trackWebinarEvent(
      webinarId,
      'webinar_started',
      'Webinar Started',
      'The negotiation webinar session has officially started.',
      userId
    );
  },

  onWebinarEnd: async (webinarId: number, userId: number) => {
    await trackWebinarEvent(
      webinarId,
      'webinar_ended',
      'Webinar Ended',
      'The negotiation webinar session has concluded.',
      userId
    );
  },

  onFactoryJoined: async (webinarId: number, factoryName: string, userId?: number) => {
    await trackWebinarEvent(
      webinarId,
      'factory_joined',
      'Factory Joined',
      'Factory ' + factoryName + ' has joined the negotiation.',
      userId,
      { factoryName }
    );
  },

  onPriceQuoted: async (webinarId: number, factoryName: string, price: string, userId?: number) => {
    await trackWebinarEvent(
      webinarId,
      'price_quoted',
      'Price Quoted',
      'Factory ' + factoryName + ' quoted a price of ' + price + '.',
      userId,
      { factoryName, price }
    );
  },

  onAgreementReached: async (webinarId: number, factoryName: string, userId?: number) => {
    await trackWebinarEvent(
      webinarId,
      'agreement_reached',
      'Agreement Reached',
      'A preliminary agreement has been reached with ' + factoryName + '.',
      userId,
      { factoryName }
    );
  }
};
