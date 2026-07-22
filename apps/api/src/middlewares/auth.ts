import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID || "common"}/discovery/v2.0/keys`
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err || !key) {
      callback(err, undefined);
      return;
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        displayName: string;
        roles?: string[];
      };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const isLive = process.env.LIVE_INTEGRATIONS === "true";
  
  if (!isLive) {
    // In dev mode, mock the user
    req.user = {
      id: "user-001",
      email: "norbert@avara.com",
      displayName: "Norbert",
      roles: ["frontline"]
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, getKey, {
    audience: process.env.ENTRA_CLIENT_ID,
    issuer: `https://sts.windows.net/${process.env.ENTRA_TENANT_ID}/`
  }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token", error: err.message });
    }

    const payload = decoded as jwt.JwtPayload;
    
    req.user = {
      id: payload.oid as string,
      email: (payload.preferred_username || payload.upn || payload.email) as string,
      displayName: payload.name as string,
      roles: payload.roles || []
    };

    next();
  });
}
