import axios from "axios";
import { _config } from "../../config/config";
import { StatusCodes } from "http-status-codes";
import { createErrorResponse } from "./errors";

export class DODO {
  async dodoPaymentService(obj: any): Promise<any> {
   try {
     if(!_config?.DodoUrl || !_config?.DodoApiKey){
      return   createErrorResponse(
                      'Api key not found',
                      StatusCodes.INTERNAL_SERVER_ERROR,
                     'Api key not found',
                  );
     }
  const response = await axios.post(
    _config?.DodoUrl ? _config?.DodoUrl :"",
    obj,
    {
      headers: {
        Authorization: `Bearer ${_config?.DodoApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("✅ Subscription created:", response.data);

  return response

} catch (error: any) {
  console.error("❌ Dodo Error:", error.response?.status);
  console.error("❌ Dodo Error Data:", error.response);
}
  }
}

const dodoService = new DODO();
export default dodoService;