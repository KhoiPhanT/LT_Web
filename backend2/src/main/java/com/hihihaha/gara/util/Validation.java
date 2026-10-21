package com.hihihaha.gara.util;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Quy tắc đầu vào dùng chung cho form JSP và API; khớp kích thước cột MySQL. */
public final class Validation {
  private Validation() {}

  private static final BigDecimal MAX_MONEY = new BigDecimal("9999999999.99");

  public static String text(String value, String label, int max) {
    if (value == null
        || value.isBlank()
        || value.length() > max
        || value.chars().anyMatch(Character::isISOControl))
      throw new IllegalArgumentException(label + " cần có từ 1 đến " + max + " ký tự hợp lệ.");
    return value;
  }

  public static BigDecimal money(String value, String label) {
    BigDecimal amount;
    try {
      if (value == null || value.length() > 40) throw new NumberFormatException();
      amount = new BigDecimal(value);
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException(label + " phải là số tiền hợp lệ.");
    }
    if (amount.scale() > 2)
      throw new IllegalArgumentException(label + " chỉ được có tối đa 2 số thập phân.");
    return moneyRange(amount, label).setScale(2);
  }

  public static BigDecimal moneyRange(BigDecimal value, String label) {
    if (value.signum() < 0 || value.compareTo(MAX_MONEY) > 0)
      throw new IllegalArgumentException(label + " vượt giới hạn lưu trữ 9.999.999.999,99 đồng.");
    return value;
  }

  public static void dates(LocalDate from, LocalDate to) {
    if (from.isBefore(LocalDate.of(1000, 1, 1))
        || to.isAfter(LocalDate.of(9999, 12, 30))
        || to.isBefore(from))
      throw new IllegalArgumentException(
          "Khoảng ngày phải từ năm 1000 đến 9999, ngày kết thúc không trước ngày bắt đầu.");
  }

  public static void intake(
      String name, String phone, String email, String plate, String model, String symptoms) {
    text(name, "Tên khách", 100);
    text(phone, "Số điện thoại", 20);
    if (!phone.matches("0[0-9]{9,10}"))
      throw new IllegalArgumentException("Số điện thoại cần có 10–11 chữ số, bắt đầu bằng 0.");
    text(email, "Email", 150);
    if (!email.matches("[^\\s@<>]+@[^\\s@<>]+\\.[^\\s@<>]+"))
      throw new IllegalArgumentException("Email chưa đúng định dạng.");
    text(plate, "Biển số", 30);
    text(model, "Dòng xe", 100);
    if (symptoms.length() > 2000
        || symptoms
            .chars()
            .anyMatch(c -> Character.isISOControl(c) && c != '\n' && c != '\r' && c != '\t'))
      throw new IllegalArgumentException("Tình trạng xe tối đa 2000 ký tự hợp lệ.");
  }
}
