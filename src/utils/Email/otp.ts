import {customAlphabet} from "nanoid"

export const createOTP = customAlphabet("0123456789", 6);
