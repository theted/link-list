import express from "express";
import { db } from "../db";
import { users as userSchema } from "../db/schema";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const client = new OAuth2Client();

router.post("/", async (req, res) => {
  const { credential, client_id } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: client_id,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await db
      .select()
      .from(userSchema)
      .where({ email: payload.email });

    if (!user) {
      await db
        .insert(userSchema)
        .values([{ email: payload.email, name: payload.name }]);
    }

    res
      .status(200)
      .cookie("token", credential, { http: true })
      .json({ payload });
  } catch (err) {
    res.status(400).json({ err });
  }
});

export default router;
