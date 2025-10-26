// dodoEventTypes.ts
export enum DodoEventType {
  // 🔹 Payment events
  PAYMENT_SUCCEEDED = "payment.succeeded",
  PAYMENT_FAILED = "payment.failed",
  PAYMENT_PROCESSING = "payment.processing",
  PAYMENT_CANCELLED = "payment.cancelled",

  // 🔹 Subscription events
  SUBSCRIPTION_ACTIVE = "subscription.active",
  SUBSCRIPTION_ON_HOLD = "subscription.on_hold",
  SUBSCRIPTION_RENEWED = "subscription.renewed",
  SUBSCRIPTION_PLAN_CHANGED = "subscription.plan_changed",
  SUBSCRIPTION_CANCELLED = "subscription.cancelled",
  SUBSCRIPTION_EXPIRED = "subscription.expired",
  SUBSCRIPTION_SUCCEEDED = "subscription.succeeded",
  
  // 🔹 Refunds or disputes (optional, if you plan to handle them)
  REFUND_INITIATED = "refund.initiated",
  REFUND_COMPLETED = "refund.completed",
  REFUND_FAILED = "refund.failed",
}
