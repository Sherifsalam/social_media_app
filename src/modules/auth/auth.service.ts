import { User } from "../User/user.model";
import { ConfirmEmailInput, LoginInput, SignupInput } from "./auth.validation";
import { BadReuestExecption } from "../../utils/error/error_handle";
import { IUser } from "../User/types/user.types";
import { sendEmail } from "../../utils/Email/SendEmail";
import { generateHTML } from "../../utils/Email/template";
import { createOTP } from "../../utils/Email/otp";
import { ConfirmEmailKey, revokeTokenKey } from "../../utils/redis/redis.service.js";
import { redisClient } from "../../DB/redis.connection.js";
import { compare, hash } from "../../utils/security/hashing.js";
import { generateToken } from "../../utils/token/token.js";
import { nanoid } from "nanoid";


class AuthServices {


  async signup(signup: SignupInput): Promise<Partial<IUser>> {
    const { username, email, gender, password, age, phone, bio } = signup;

    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      throw new BadReuestExecption("email already exists");
    }

    const user = await User.create({
      username,
      email,
      gender,
      password: await hash(password),
      age,
      phone,
      ...(bio !== undefined && { bio }),
    });

    const otp = createOTP();

    await sendEmail({
      to: email,
      subject: "confirm email",
      html: generateHTML({ name: username, otp }),
    });

    redisClient.set(ConfirmEmailKey(user.id), otp, {
      expiration: {
        type: "EX",
        value: 5 * 60,
      },
    });

    const { password: _password, ...userData } = user.toObject();
    return userData;
  }


  async ConfirmEmail({ email, otp }: ConfirmEmailInput): Promise<void> {
    const user = await User.findOne({
      email,
      confirmedAt: {
        $exists: false,
      },
    });

    if (!user) {
      throw new BadReuestExecption("user not found");
    }

    const userOTP = await redisClient.get(ConfirmEmailKey(user.id));
    if (!userOTP) {
      throw new BadReuestExecption("otp expired");
    }

    if (userOTP !== otp) {
      throw new BadReuestExecption("invalid otp");
    }

    user.confirmedAt = new Date();

    await redisClient.del(ConfirmEmailKey(user.id));
    await user.save();
  }



  async login({ email, password }: LoginInput): Promise<{
    data: {
      accessToken: string;
      refreshToken: string;
    };
  }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new BadReuestExecption("Invalid credentials");
    }

    if (!user.confirmedAt) {
      throw new BadReuestExecption("email not confirmed");
    }

    if(! await compare(password , user.password)){
      throw new BadReuestExecption("Invalid credentials");
    }

    const jwtid = nanoid(20);

    const accessToken = generateToken({ _id: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h",
        jwtid
       }
    );

    const refreshToken = generateToken(
      { _id: user.id },
      process.env.JWT_REFRESH_SECRET as string,
      { 
        expiresIn: "7D", 
        jwtid 
      },
    );

    await redisClient.set(revokeTokenKey(user.id, jwtid), "revoked");

    return{ 
      data:{
        accessToken,
        refreshToken
      }
    }
  }
}

export const authservices = new AuthServices();
