export async function sendPushNotification(token, title, body) {
  console.log("📨 Mencoba kirim notifikasi barang titipan ke:", token);

  const message = {
    to: token,
    sound: "default",
    title,
    body,
    data: {},
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
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    console.log("✅ Notifikasi berhasil dikirim:", data);
  } catch (err) {
    console.error("❌ Gagal mengirim notifikasi:", err);
  }
}