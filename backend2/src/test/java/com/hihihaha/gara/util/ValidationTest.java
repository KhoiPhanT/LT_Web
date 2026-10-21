package com.hihihaha.gara.util;

import static org.junit.Assert.*;

import org.junit.Test;

public class ValidationTest {
  @Test
  public void databaseMoneyBoundsAndScaleAreValidatedBeforeInsert() {
    assertEquals("9999999999.99", Validation.money("9999999999.99", "Giá").toPlainString());
    for (String bad : new String[] {"10000000000", "1.001", "-1", "NaN", "1E1000"}) {
      assertThrows(IllegalArgumentException.class, () -> Validation.money(bad, "Giá"));
    }
  }

  @Test
  public void emailCannotInjectSmtpCommands() {
    assertThrows(
        IllegalArgumentException.class,
        () ->
            Validation.intake(
                "Khách",
                "0901234567",
                "a@b.com\r\nRCPT TO:<other@b.com>",
                "59A-12345",
                "Vios",
                ""));
  }
}
