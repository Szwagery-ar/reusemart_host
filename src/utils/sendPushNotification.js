export async function sendPushNotification(token, title, body) {
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

  try {
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

    if (result.errors) {
      console.error("❌ Expo Push Error:", result.errors);
    } else {
      console.log("✅ Push sent successfully:", result);
    }
  } catch (error) {
    console.error("❌ Gagal kirim notifikasi dari backend:", error);
  }
}
