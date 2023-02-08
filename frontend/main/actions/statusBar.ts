import { SET_STATUS_BAR_TEXT } from "common/constants/actionTypes";

export function reset() {
  return {
    type: SET_STATUS_BAR_TEXT,
    payload: null,
  };
}

export function setValue(text: string) {
  return {
    type: SET_STATUS_BAR_TEXT,
    payload: text,
  };
}
