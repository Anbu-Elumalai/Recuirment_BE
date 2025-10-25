import express, { Request, Response } from 'express';
import { Webhook } from 'standardwebhooks';
import { _config } from '../../config/config';
import { DodoEventType } from '../../utils/common/dodoEventTypes';
import TransactionModel from '../../app/model/transaction';

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
      const event :any = await wh.verify(req.body, headers);

      console.log("*************EVENT RECEIVED*********", event);

      const { transactionId, planId, groupId } = event.data.metadata || {};
      const eventType = event.type;

      if (!transactionId) {
        console.error("transactionId not found in metadata");
        return res.status(400).send("transactionId missing in event metadata");
      }

      let update: any = {};

      switch (eventType) {
        case DodoEventType.PAYMENT_SUCCEEDED:
          update = { paymentStatus: "success" };
          break;
        case DodoEventType.PAYMENT_FAILED:
          update = { paymentStatus: "failed" };
          break;
        case DodoEventType.SUBSCRIPTION_CANCELLED:
          update = { paymentStatus: "cancelled" };
          break;
        default:
          update = { paymentStatus: eventType };
      }

      const result = await TransactionModel.findByIdAndUpdate(
        transactionId,
        update,
        { new: true }
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
