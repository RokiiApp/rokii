import {
  SET_STATUS_BAR_TEXT
} from '../../../server/common/constants/actionTypes'

export function reset() {
  return {
    type: SET_STATUS_BAR_TEXT,
    payload: null
  }
}

export function setValue(text) {
  return {
    type: SET_STATUS_BAR_TEXT,
    payload: text
  }
}
