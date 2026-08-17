import bcrypt from "bcrypt";
import * as argon2 from "argon2";

export type HashTarget = "argon2" | "bcrypt";

export const hash = async (
  text: string,
  target?: HashTarget
): Promise<string> => {
  let ciphertext: string;

  switch (target) {
    case "argon2":
      ciphertext = await argon2.hash(text);
      break;
    default:
      ciphertext = await bcrypt.hash(text, 10);
  }

  return ciphertext;
};

export const compare = async (
  text: string,
  ciphertext: string,
  target?: HashTarget
): Promise<boolean> => {
  let results: boolean;

  switch (target) {
    case "argon2":
      results = await argon2.verify(ciphertext, text);
      break;
    default:
      results = await bcrypt.compare(text, ciphertext);
  }

  return results;
};
