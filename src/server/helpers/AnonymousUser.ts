import { serialize, parse } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";

const setAnyanomesIdCookie = (res: NextApiResponse) => {
  const anyanomesId = uuidv4();
  const cookieName = "anyanomesId";
  const cookieOptions = {
    httpOnly: true,
    maxAge: 3600, // 1 hour
    path: "/",
    sameSite: true,
    secure: process.env.NODE_ENV === "production",
  };
  const cookieValue = serialize(cookieName, anyanomesId, cookieOptions);
  res.setHeader("Set-Cookie", cookieValue);
  return anyanomesId;
};

const getAnyanomesIdFromCookie = (req: NextApiRequest) => {
  const cookieName = "anyanomesId";
  const cookies = parse(req.headers.cookie || "");
  return cookies[cookieName] || null;
};

export const getAnyanomesId = (req: NextApiRequest, res: NextApiResponse) => {
  const anyanomesId = getAnyanomesIdFromCookie(req);
  if (anyanomesId) return anyanomesId;
  return setAnyanomesIdCookie(res);
};
