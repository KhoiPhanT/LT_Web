package com.hihihaha.gara.util;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

/** Phụ trách phần OTP hiện dùng: Lợi. Hàm gửi email được tái sử dụng từ mã có sẵn. */
public class EmailService {
  private static final String SMTP_HOST = "smtp.gmail.com";
  private static final int SMTP_PORT = 465;

  // Lợi: cấu hình OTP chỉ đọc từ biến môi trường Docker, tránh lẫn file cấu hình cũ.
  private static String getSenderEmail() {
    return System.getenv().getOrDefault("GMAIL_USER", "").trim();
  }

  private static String getAppPassword() {
    return System.getenv().getOrDefault("GMAIL_APP_PASSWORD", "").replaceAll("\\s+", "");
  }

  private static boolean isConfigured() {
    return !getSenderEmail().isEmpty() && !getAppPassword().isEmpty();
  }

  /** Lợi: gửi OTP qua SMTP; mã và thời hạn được AuthServlet quản lý. */
  public static void sendOtpEmail(
      String recipientEmail, String customerName, String licensePlate, String otpCode)
      throws Exception {
    if (!isConfigured()) {
      throw new IllegalStateException(
          "Chưa cấu hình tài khoản Gmail (GMAIL_USER & GMAIL_APP_PASSWORD)!");
    }

    String senderEmail = getSenderEmail();
    String appPassword = getAppPassword();
    String senderName = "HIHIHAHA AUTO";
    String subject = "[HIHIHAHA AUTO] Mã OTP xác thực đăng nhập của bạn: " + otpCode;

    String htmlBody = buildOtpEmailHtml(customerName, licensePlate, otpCode);

    sendMailSsl(senderEmail, senderName, appPassword, recipientEmail, subject, htmlBody);
  }

  private static String escapeHtml(String value) {
    if (value == null) return "";
    return value
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;");
  }

  // Lợi: dùng lại cách gửi SMTP SSL của bản cũ cho luồng OTP.
  private static void sendMailSsl(
      String fromEmail,
      String fromName,
      String password,
      String toEmail,
      String subject,
      String htmlContent)
      throws Exception {
    SSLSocketFactory factory = (SSLSocketFactory) SSLSocketFactory.getDefault();
    try (SSLSocket socket = (SSLSocket) factory.createSocket()) {
      javax.net.ssl.SSLParameters parameters = socket.getSSLParameters();
      parameters.setEndpointIdentificationAlgorithm("HTTPS");
      socket.setSSLParameters(parameters);
      socket.connect(new InetSocketAddress(SMTP_HOST, SMTP_PORT), 10000);
      socket.setSoTimeout(15000);

      BufferedReader reader =
          new BufferedReader(
              new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
      BufferedWriter writer =
          new BufferedWriter(
              new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8));

      expect(reader, "220");

      sendCmd(writer, "EHLO localhost");
      readUntilReady(reader);

      sendCmd(writer, "AUTH LOGIN");
      expect(reader, "334");

      sendCmd(
          writer, Base64.getEncoder().encodeToString(fromEmail.getBytes(StandardCharsets.UTF_8)));
      expect(reader, "334");

      sendCmd(
          writer, Base64.getEncoder().encodeToString(password.getBytes(StandardCharsets.UTF_8)));
      expect(reader, "235");

      sendCmd(writer, "MAIL FROM:<" + fromEmail + ">");
      expect(reader, "250");

      sendCmd(writer, "RCPT TO:<" + toEmail + ">");
      expect(reader, "250");

      sendCmd(writer, "DATA");
      expect(reader, "354");

      String encodedFromName =
          "=?UTF-8?B?"
              + Base64.getEncoder().encodeToString(fromName.getBytes(StandardCharsets.UTF_8))
              + "?=";
      String encodedSubject =
          "=?UTF-8?B?"
              + Base64.getEncoder().encodeToString(subject.getBytes(StandardCharsets.UTF_8))
              + "?=";

      writer.write("From: " + encodedFromName + " <" + fromEmail + ">\r\n");
      writer.write("To: <" + toEmail + ">\r\n");
      writer.write("Subject: " + encodedSubject + "\r\n");
      writer.write("MIME-Version: 1.0\r\n");
      writer.write("Content-Type: text/html; charset=UTF-8\r\n");
      writer.write("Content-Transfer-Encoding: base64\r\n");
      writer.write("\r\n");

      String base64Body =
          Base64.getEncoder().encodeToString(htmlContent.getBytes(StandardCharsets.UTF_8));
      for (int i = 0; i < base64Body.length(); i += 76) {
        int end = Math.min(i + 76, base64Body.length());
        writer.write(base64Body.substring(i, end) + "\r\n");
      }

      writer.write(".\r\n");
      writer.flush();
      expect(reader, "250");

      sendCmd(writer, "QUIT");
      expect(reader, "221");
    }
  }

  private static void sendCmd(BufferedWriter writer, String cmd) throws IOException {
    writer.write(cmd + "\r\n");
    writer.flush();
  }

  private static void expect(BufferedReader reader, String expectedPrefix) throws IOException {
    String line = reader.readLine();
    if (line == null || !line.startsWith(expectedPrefix)) {
      throw new IOException(
          "Lỗi SMTP từ Google: " + (line != null ? line : "Không nhận được phản hồi"));
    }
  }

  private static void readUntilReady(BufferedReader reader) throws IOException {
    String line;
    while ((line = reader.readLine()) != null) {
      if (line.length() >= 4 && line.charAt(3) == ' ') break;
    }
  }

  private static String buildOtpEmailHtml(String name, String plate, String otp) {
    String displayName = escapeHtml((name != null && !name.trim().isEmpty()) ? name : "Quý Khách");
    String displayPlate =
        escapeHtml((plate != null && !plate.trim().isEmpty()) ? plate : "Xe của Quý Khách");

    return "<!DOCTYPE html><html lang='vi'><head><meta charset='UTF-8'></head><body"
               + " style='margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,\"Segoe"
               + " UI\",Roboto,sans-serif;color:#1e293b;'>  <table width='100%' cellpadding='0'"
               + " cellspacing='0' style='background-color:#f1f5f9;padding:32px 16px;'>    <tr>    "
               + "  <td align='center'>        <table width='100%'"
               + " style='max-width:540px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0"
               + " 10px 25px rgba(0,0,0,0.06);border:1px solid #e2e8f0;'>          <tr>           "
               + " <td style='background:#0f172a;padding:28px 32px;text-align:center;'>            "
               + "  <div"
               + " style='color:#f59e0b;font-size:22px;font-weight:900;letter-spacing:1px;'>HIHIHAHA"
               + " AUTO</div>              <div"
               + " style='color:#94a3b8;font-size:12px;margin-top:4px;font-weight:500;'>Theo dõi"
               + " sửa chữa xe và thanh toán</div>            </td>          </tr>          <tr>   "
               + "         <td style='padding:36px 32px;'>              <h2"
               + " style='font-size:20px;font-weight:800;color:#0f172a;margin:0 0 12px 0;'>Xác thực"
               + " đăng nhập tài khoản</h2>              <p"
               + " style='font-size:14px;color:#475569;line-height:1.6;margin:0 0 20px 0;'>        "
               + "        Xin chào <strong>"
        + displayName
        + "</strong>,<br/>                Bạn đang đăng nhập vào Cổng Khách Hàng để theo dõi hồ sơ"
        + " xe biển số <strong>"
        + displayPlate
        + "</strong>.              </p>              <div style='background:#fffbeb;border:2px"
        + " dashed #f59e0b;border-radius:16px;padding:24px;text-align:center;margin:24px 0;'>      "
        + "          <div"
        + " style='font-size:12px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;'>Mã"
        + " OTP Của Bạn</div>                <div"
        + " style='font-size:38px;font-weight:900;letter-spacing:10px;color:#0f172a;font-family:monospace;'>"
        + otp
        + "</div>                <div"
        + " style='font-size:12px;color:#d97706;margin-top:8px;font-weight:500;'>Mã có hiệu lực"
        + " trong vòng <strong>5 phút</strong></div>              </div>              <p"
        + " style='font-size:13px;color:#64748b;line-height:1.6;margin:0;'>                🔒"
        + " <em>Vì lý do an toàn bảo mật cho hồ sơ xe của bạn, tuyệt đối không chia sẻ mã này cho"
        + " bất kỳ ai.</em>              </p>            </td>          </tr>          <tr>        "
        + "    <td style='background:#f8fafc;padding:20px 32px;border-top:1px solid"
        + " #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;line-height:1.6;'>             "
        + " <strong>Trung Tâm Dịch Vụ Ô Tô HiHiHaHa Auto</strong><br/>              Số 1 Võ Văn"
        + " Ngân, TP. Thủ Đức, TP. Hồ Chí Minh | Hotline: <strong>0797 526 990</strong>           "
        + " </td>          </tr>        </table>      </td>    </tr>  </table></body></html>";
  }
}
