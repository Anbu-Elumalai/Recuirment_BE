import express, { Request, Response } from 'express';
import { Webhook } from 'standardwebhooks';
import { _config } from '../../config/config';
import { DodoEventType } from '../../utils/common/dodoEventTypes';
import TransactionModel from '../../app/model/transaction';
import SubscriptionModel from '../../app/model/subscription';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    console.log("***************DODO WEBHOOK Started************************");

    try {
      if (!_config?.WebHookAPiKey) {
        console.error("Missing webhook secret");
        return res.status(500).send("Missing webhook secret");
      }

      const secret = _config.WebHookAPiKey;
      const headers = req.headers as Record<string, string>;

      const wh = new Webhook(secret);

      // Verify webhook signature
      const event: any = await wh.verify(req.body, headers);

      console.log("*************EVENT RECEIVED*********", event);

      const { transactionId, planId, groupId } = event.data.metadata || {};
      const eventType = event.type;

      if (!transactionId) {
        console.error("transactionId not found in metadata");
        return res.status(400).send("transactionId missing in event metadata");
      }

      let update: any = {};

      switch (eventType) {
        case DodoEventType.SUBSCRIPTION_ACTIVE:
          update = { subscriptionStatus: "active" };
          break;

        case DodoEventType.SUBSCRIPTION_SUCCEEDED:
          update = { subscriptionStatus: "succeeded" };
          break;

        case DodoEventType.SUBSCRIPTION_RENEWED:
          update = { subscriptionStatus: "renewed" };
          break;

        case DodoEventType.SUBSCRIPTION_ON_HOLD:
          update = {
            subscriptionStatus: "hold"
            , hold_started_at: new Date(),
            hold_reason: " need to implement"
          };

          break;

        case DodoEventType.SUBSCRIPTION_CANCELLED:
          update = { subscriptionStatus: "cancelled" };
          break;

        case DodoEventType.SUBSCRIPTION_PLAN_CHANGED:
          update = { subscriptionStatus: "plan_changed" };
          break;

        case DodoEventType.SUBSCRIPTION_EXPIRED:
          update = { subscriptionStatus: "expired" };
          break;

        default:
          console.log("eventType log", eventType);

          update = { subscriptionStatus: eventType };
      }


      // ✅ Create subscription record safely
      const subscriptionData = {
        business_id: event.business_id,
        subscription_id: event.data.subscription_id,
        product_id: event.data.product_id,
        status: event.data.status || "active",
        currency: event.data.currency || "USD",
        quantity: event.data.quantity || 1,
        recurring_pre_tax_amount: event.data.recurring_pre_tax_amount || 0,
        next_billing_date: event.data.next_billing_date,
        previous_billing_date: event.data.previous_billing_date,
        expires_at: event.data.expires_at,
        created_at: event.data.created_at,
        customer: event.data.customer,
        billing: event.data.billing,
        metadata: event.data.metadata,
        type: event.type,
        timestamp: event.timestamp,
        payload_type: event.data.payload_type || "Subscription",
        error_code:event.data.error_code ?? "",
        error_message:event.data.error_message ?? "",
      };

     const subscription= await SubscriptionModel.updateOne(
        { subscription_id: subscriptionData.subscription_id }, // filter by subscription_id
        { $set: subscriptionData }, // set updated data
        { upsert: true } // insert if not found
      );
      console.log("✅ Subscription created:", subscription);

      const result = await TransactionModel.findByIdAndUpdate(
        new ObjectId(transactionId),
        update,
      );

      console.log("Transaction updated:", result);
      console.log("***************DODO WEBHOOK COMPLETED************************");

      return res.status(200).send({ success: true });
    } catch (err: any) {
      console.error('Webhook verification failed:', err);
      return res.status(400).send('Invalid signature');
    }
  }
);

export default router;
