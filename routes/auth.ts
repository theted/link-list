import express from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users as userSchema } from "../db/schema";
import { OAuth2Client } from "google-auth-library";
import { googleClientId } from "../config";
import { signToken } from "../middleware/jwt";

const router = express.Router();
const client = new OAuth2Client();

router.post("/", async (req, res) => {
  const { credential } = req.body;

  try {
    // The audience is ours, never the client's: a token minted for another
    // Google client must not sign anyone in here.
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(401).json({ message: "Invalid token" });
    }

    let [user] = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, payload.email));

    if (!user) {
      [user] = await db
        .insert(userSchema)
        .values({ email: payload.email, name: payload.name })
        .returning();
    }

    const token = signToken({
      id: user.id,
      email: payload.email,
      name: user.name,
    });

    res.status(200).json({ payload, token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Could not verify the Google sign-in" });
  }
});

export default router;
