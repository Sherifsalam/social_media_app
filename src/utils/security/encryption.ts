import crypto from "crypto";

const IV_LENGTH = 16;

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.ENCRYPTION_KEY as string),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  console.log(encrypted);

  encrypted += cipher.final("hex");
  console.log(encrypted);
  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encrypted: string): string => {
  const [iv, encryptedData] = encrypted.split(":");
  const binary = Buffer.from(iv as string, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY as string,
    binary
  );

  let decrypted = decipher.update(encryptedData as string, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
