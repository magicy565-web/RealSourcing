import { addNegotiationEvent } from "../db";

/**
 * Auto-trigger negotiation events based on webinar status changes
 */
export async function triggerWebinarStatusEvent(
  webinarId: number,
  oldStatus: string,
  newStatus: string
) {
  const statusEventMap: Record<string, { type: any; title: string; description: string }> = {
    scheduled: {
      type: "system",
      title: "Webinar Scheduled",
      description: "The webinar has been scheduled and is awaiting participants",
    },
    live: {
      type: "system",
      title: "Webinar Started",
      description: "The webinar session has started. Participants can now join",
    },
    completed: {
      type: "system",
      title: "Webinar Completed",
      description: "The webinar session has ended successfully",
    },
    archived: {
      type: "system",
      title: "Webinar Archived",
      description: "The webinar has been archived",
    },
  };

  const eventConfig = statusEventMap[newStatus];
  if (eventConfig) {
    await addNegotiationEvent({
      webinarId,
      type: eventConfig.type,
      title: eventConfig.title,
      description: eventConfig.description,
      metadata: {
        oldStatus,
        newStatus,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

/**
 * Trigger event when factory joins webinar
 */
export async function triggerFactoryJoinEvent(
  webinarId: number,
  factoryId: number,
  factoryName: string
) {
  await addNegotiationEvent({
    webinarId,
    type: "factory",
    title: "Factory Joined",
    description: `${factoryName} has joined the webinar`,
    metadata: {
      factoryId,
      factoryName,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Trigger event when pricing is discussed
 */
export async function triggerPricingEvent(
  webinarId: number,
  details: {
    product?: string;
    price?: number;
    currency?: string;
    moq?: number;
  }
) {
  await addNegotiationEvent({
    webinarId,
    type: "pricing",
    title: "Pricing Discussed",
    description: details.product
      ? `Pricing discussed for ${details.product}`
      : "Pricing information shared",
    metadata: {
      ...details,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Trigger AI insight event
 */
export async function triggerAIInsightEvent(
  webinarId: number,
  insight: string,
  category?: string
) {
  await addNegotiationEvent({
    webinarId,
    type: "ai_insight",
    title: "AI Insight Generated",
    description: insight,
    metadata: {
      category,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Trigger agreement event
 */
export async function triggerAgreementEvent(
  webinarId: number,
  agreementDetails: {
    title: string;
    description: string;
    terms?: Record<string, any>;
  }
) {
  await addNegotiationEvent({
    webinarId,
    type: "agreement",
    title: agreementDetails.title,
    description: agreementDetails.description,
    metadata: {
      ...agreementDetails.terms,
      timestamp: new Date().toISOString(),
    },
  });
}
