import express, { Request, Response } from 'express';
import { Webhook } from 'standardwebhooks';
import { _config } from '../../config/config';
import { DodoEventType } from '../../utils/common/dodoEventTypes';
import TransactionModel from '../../app/model/transaction';
import SubscriptionModel from '../../app/model/subscription';
import { ObjectId } from 'mongodb';
import mailService from "../common/mail.service";
import planModel from '../../app/model/plan.mode';
import { DateUtils } from '../date.ts/date.utils';

const router = express.Router();

router.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    console.log("***************DODO WEBHOOK Started************************");

    try {
      if (!_config?.WebHookAPiKey) {
        console.error("Missing webhook secret [key :WebHookAPiKey]");
        return res.status(500).send("Missing webhook secret");
      }

      const secret = _config.WebHookAPiKey;
      const headers = req.headers as Record<string, string>;

      const wh = new Webhook(secret);

      // Verify webhook signature
      const event: any = await wh.verify(req.body, headers);

      console.log("*************EVENT RECEIVED*********", event);

      const { transactionId, planId, groupId } = event.data.metadata || {};
      const { email, name, planName } = event.data.customer

      const { next_billing_date } = event.data;

      const findPlanDtls = await planModel.findById(new ObjectId(planId));

      if (!findPlanDtls) {
        console.error(`No plan details found for this id ${planId}`);
        return;
      }

      const duration = findPlanDtls.duration; // "monthly" or "yearly"

      // Convert next_billing_date to Date object
      const nextBillingDate = new Date(next_billing_date);

      // Calculate start date based on duration
      let startDate: Date;

      if (duration === "monthly") {
        startDate = new Date(nextBillingDate);
        startDate.setMonth(startDate.getMonth() - 1); // subtract 1 month
      } else if (duration === "yearly") {
        startDate = new Date(nextBillingDate);
        startDate.setFullYear(startDate.getFullYear() - 1); // subtract 1 year
      } else {
        console.warn("Unknown duration type, using next billing date as start");
        startDate = new Date(nextBillingDate);
      }



      // Format dates using your helper
      const formattedStartDate = DateUtils.formatDate(startDate, "MMMM dd, yyyy");
      const formattedEndDate = DateUtils.formatDate(nextBillingDate, "MMMM dd, yyyy");
      const formattedNextBillingDate = DateUtils.formatDate(nextBillingDate, "MMMM dd, yyyy");

      console.log({
        formattedStartDate,       // Current period start
        formattedEndDate,         // Current period end
        formattedNextBillingDate, // Next billing date
      });


      const eventType = event.type;

      if (!transactionId) {
        console.error(`transactionId not found in metadata ${transactionId}`);
      }

      let update: any = {};

      switch (eventType) {
        case DodoEventType.SUBSCRIPTION_ACTIVE:
          update = { subscriptionStatus: "active" };
          await mailService.commonMailSend(
            "subscription-status", // template name
            email,
            "Subscription Active",
            {
              name: name,
              planName: planName,
              subscriptionStatus: "Active",
              startDate: formattedStartDate,
              endDate: formattedEndDate,
              nextPaymentDate: next_billing_date,
              manageLink: "https://yourdomain.com/manage-subscription" //plan list api
            }
          );
          break;

        case DodoEventType.SUBSCRIPTION_SUCCEEDED:
        case DodoEventType.PAYMENT_SUCCEEDED:
          update = { subscriptionStatus: "succeeded" };
          await mailService.commonMailSend(
            "subscription-status", // template name
            email,
            "Subscription Succeeded",
            {
              name: name,
              planName: planName,
              subscriptionStatus: "Succeeded",
             
              startDate: formattedStartDate,
              endDate: formattedEndDate,
              nextPaymentDate: next_billing_date,
              manageLink: "https://yourdomain.com/manage-subscription"
            }
          );
          break;

        case DodoEventType.SUBSCRIPTION_RENEWED:
          update = { subscriptionStatus: "renewed" };
          await mailService.commonMailSend(
            "subscription-status", // template name
            email,
            "Subscription Renewed",
            {
              name: name,
              planName: planName,
              subscriptionStatus: "Renewed",
              startDate: formattedStartDate,
              endDate: formattedEndDate,
              nextPaymentDate: next_billing_date,
              manageLink: "https://yourdomain.com/manage-subscription"
            }
          );
          break;

        case DodoEventType.SUBSCRIPTION_ON_HOLD:
          update = {
            subscriptionStatus: "on_hold",
            hold_started_at: new Date(),
            hold_reason: event.data?.reason || "unknown"
          };
          await mailService.commonMailSend(
            "subscription-status", // template name
            email,
            "Subscription Hold",
            {
              name: name,
              planName: planName,
              subscriptionStatus: "Hold",
              reason: ""
            }
          );
          break;

        case DodoEventType.SUBSCRIPTION_CANCELLED:
        case DodoEventType.PAYMENT_CANCELLED:
          update = { subscriptionStatus: "cancelled" };
          await mailService.commonMailSend(
            "subscription-status", // template name
            email,
            "Subscription Cancelled",
            {
              name: name,
              planName: planName,
              subscriptionStatus: "Cancelled",
             
              startDate: formattedStartDate,
              endDate: formattedEndDate,
              nextPaymentDate: next_billing_date,
              manageLink: "https://yourdomain.com/manage-subscription"
            }
          );
          break;

        case DodoEventType.SUBSCRIPTION_PLAN_CHANGED:
          update = { subscriptionStatus: "plan_changed" };
          await mailService.commonMailSend(
            "subscription-status", // template name
            email,
            "Subscription Plan Changed",
            {
              name: name,
              planName: planName,
              subscriptionStatus: "plan changed",
             
              startDate: formattedStartDate,
              endDate: formattedEndDate,
              nextPaymentDate: next_billing_date,
              manageLink: "https://yourdomain.com/manage-subscription"
            }
          );
          break;

        case DodoEventType.SUBSCRIPTION_EXPIRED:
          update = { subscriptionStatus: "expired" };
          await mailService.commonMailSend(
            "subscription-status", // template name
            email,
            "Subscription Expired",
            {
              name: name,
              planName: planName,
              subscriptionStatus: "expired",
              startDate: formattedStartDate,
              endDate: formattedEndDate,
              nextPaymentDate: next_billing_date,
              manageLink: "https://yourdomain.com/manage-subscription"
            }
          );
          break;

        case DodoEventType.PAYMENT_FAILED:
          update = { subscriptionStatus: "failed" };
          await mailService.commonMailSend(
            "subscription-status", // template name
            email,
            "Subscription Failed",
            {
              name: name,
              planName: planName,
              subscriptionStatus: "failed",
              startDate: formattedStartDate,
              endDate: formattedEndDate,
              nextPaymentDate: next_billing_date,
              manageLink: "https://yourdomain.com/manage-subscription"
            }
          );
          break;

        default:
          console.log("Unknown eventType:", eventType);
          update = { subscriptionStatus: "unknown" };
      }


      // Create subscription record safely
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
        error_code: event.data.error_code ?? "",
        error_message: event.data.error_message ?? "",
      };

      const subscription = await SubscriptionModel.updateOne(
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
