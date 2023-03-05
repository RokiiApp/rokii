import * as config from "../../common/config";
import { CHANNELS } from "../../common/constants/events";
import { send } from "../../common/ipc";

export const hideListener = () => {
  if (config.get("cleanOnHide")) {
    send(CHANNELS.ClearInput);
  }
};
