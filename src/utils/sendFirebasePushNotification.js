import fetch from "node-fetch";
import { JWT } from "google-auth-library";
import fs from "fs";
import path from "path";

const serviceAccountPath = process.env.FCM_SERVER_KEY || "./service-account.json";
const fcmProjectName = process.env.FCM_PROJECT_NAME;

let firebaseAccessToken = null;

async function getFirebaseAccessToken() {
  if (firebaseAccessToken) return firebaseAccessToken;

  const key = JSON.parse(fs.readFileSync(path.resolve(serviceAccountPath)));
  const jwtClient = new JWT(
    key.client_email,
    null,
    key.private_key,
    ["https://www.googleapis.com/auth/cloud-platform"],
    null
  );

  const tokens = await jwtClient.authorize();
  firebaseAccessToken = tokens.access_token;
  return firebaseAccessToken;
}

function isExpoToken(token) {
  return token.startsWith("ExponentPushToken");
}

export async function sendFirebasePushNotification(token, title, body) {
  if (!token || !title || !body) {
    console.warn("❌ Invalid input for push:", { token, title, body });
    return;
  }

  if (isExpoToken(token)) {
    // --- Kirim lewat Expo ---
    const message = {
      to: token,
      sound: "default",
      title,
      body,
      data: { sentBy: "server-cron" },
      android: {
        channelId: "default",
        color: "#FF5733",
      },
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log("📨 [Expo] Push result:", result);
  } else {
    // --- Kirim lewat FCM ---
    const accessToken = await getFirebaseAccessToken();

    const messageBody = {
      message: {
        token: token,
        notification: {
          title,
          body,
        },
        android: {
          notification: {
            channelId: "default",
            color: "#FF5733",
          },
        },
        data: {
          sentBy: "server-cron",
        },
      },
    };

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${fcmProjectName}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageBody),
      }
    );

    const result = await response.json();
    console.log("📨 [FCM] Push result:", result);
  }
}