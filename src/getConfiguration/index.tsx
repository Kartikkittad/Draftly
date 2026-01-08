import EMPTY_EMAIL_MESSAGE from "./sample/empty-email-message";
import ONE_TIME_PASSCODE from "./sample/one-time-passcode";
import ORDER_ECOMMERCE from "./sample/order-ecommerce";
import POST_METRICS_REPORT from "./sample/post-metrics-report";
import RESERVATION_REMINDER from "./sample/reservation-reminder";
import RESET_PASSWORD from "./sample/reset-password";
import RESPOND_TO_MESSAGE from "./sample/respond-to-message";
import SUBSCRIPTION_RECEIPT from "./sample/subscription-receipt";
import WELCOME from "./sample/welcome";
import type { TEditorConfiguration } from "../documents/editor/core";

export default function getConfiguration(
  template: string
): TEditorConfiguration {
  if (template.startsWith("#sample/")) {
    const sampleName = template.replace("#sample/", "");
    switch (sampleName) {
      case "welcome":
        return WELCOME;
      case "one-time-password":
        return ONE_TIME_PASSCODE;
      case "order-ecomerce":
        return ORDER_ECOMMERCE;
      case "post-metrics-report":
        return POST_METRICS_REPORT;
      case "reservation-reminder":
        return RESERVATION_REMINDER;
      case "reset-password":
        return RESET_PASSWORD;
      case "respond-to-message":
        return RESPOND_TO_MESSAGE;
      case "subscription-receipt":
        return SUBSCRIPTION_RECEIPT;
    }
  }

  if (template.startsWith("#code/")) {
    const encodedString = template.replace("#code/", "");
    const configurationString = decodeURIComponent(atob(encodedString));
    try {
      return JSON.parse(configurationString);
    } catch {
      console.error(`Couldn't load configuration from hash.`);
    }
  }

  return EMPTY_EMAIL_MESSAGE;
}

export function isSampleHash(hash: string): boolean {
  return hash.startsWith("#sample/");
}

export function isCodeHash(hash: string): boolean {
  return hash.startsWith("#code/");
}
