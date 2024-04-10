import bcrypt from "bcryptjs";
import { ExportLogger as Logger } from "../index";
import jsonwebtoken from "jsonwebtoken";

export class Utils {
  public static async generateHash(payload: string, saltRounds: number): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(payload, salt);
    return hash;
  }

  public static signToken(payload: object, secretKey: string = process.env["JWT_SECRET"]): string {
    try {
      return jsonwebtoken.sign(payload, secretKey, { algorithm: "RS256", expiresIn: 7 * 24 * 60 * 60 * 1000 });
    } catch (error) {
      Logger.error("Token sigm failed:", error);
    }
  }

  public static verifyToken(
    token: string,
    secretKey: string = process.env["JWT_SECRET"],
  ): jsonwebtoken.JwtPayload | string {
    try {
      return jsonwebtoken.verify(token, secretKey, { algorithms: ["RS256"] });
    } catch (error) {
      Logger.error("Token verification failed:", error);
    }
  }
}
