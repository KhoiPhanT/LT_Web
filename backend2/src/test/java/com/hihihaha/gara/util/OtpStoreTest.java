package com.hihihaha.gara.util;

import static org.junit.Assert.*;

import java.util.*;
import java.util.concurrent.*;
import org.junit.Test;

public class OtpStoreTest {
  @Test
  public void simultaneousCorrectRequestsConsumeCodeExactlyOnce() throws Exception {
    OtpStore store = new OtpStore(300000);
    store.reserve("customer:plate", "123456", 7);
    ExecutorService pool = Executors.newFixedThreadPool(16);
    try {
      CountDownLatch start = new CountDownLatch(1);
      List<Future<Integer>> requests = new ArrayList<>();
      for (int i = 0; i < 16; i++)
        requests.add(
            pool.submit(
                () -> {
                  start.await();
                  return store.verify("customer:plate", "123456").status();
                }));
      start.countDown();
      int accepted = 0;
      for (Future<Integer> result : requests) if (result.get() == 200) accepted++;
      assertEquals(1, accepted);
    } finally {
      pool.shutdownNow();
    }
  }

  @Test
  public void simultaneousWrongCodesCannotResetOrLoseAttemptCount() throws Exception {
    OtpStore store = new OtpStore(300000);
    store.reserve("customer:plate", "123456", 7);
    ExecutorService pool = Executors.newFixedThreadPool(16);
    try {
      List<Callable<Integer>> calls = new ArrayList<>();
      for (int i = 0; i < 16; i++)
        calls.add(() -> store.verify("customer:plate", "wrong").status());
      int bad = 0, limited = 0;
      for (Future<Integer> result : pool.invokeAll(calls)) {
        if (result.get() == 400) bad++;
        if (result.get() == 429) limited++;
      }
      assertEquals(5, bad);
      assertEquals(11, limited);
      assertEquals(429, store.verify("customer:plate", "123456").status());
    } finally {
      pool.shutdownNow();
    }
  }

  @Test
  public void simultaneousIssuesReserveOnlyOneCode() throws Exception {
    OtpStore store = new OtpStore(300000);
    ExecutorService pool = Executors.newFixedThreadPool(8);
    try {
      List<Callable<Boolean>> calls = new ArrayList<>();
      for (int i = 0; i < 8; i++)
        calls.add(
            () -> {
              try {
                store.reserve("same", "123456", 7);
                return true;
              } catch (IllegalStateException expected) {
                return false;
              }
            });
      int accepted = 0;
      for (Future<Boolean> result : pool.invokeAll(calls)) if (result.get()) accepted++;
      assertEquals(1, accepted);
    } finally {
      pool.shutdownNow();
    }
  }

  @Test
  public void failedEmailReleasesReservation() {
    OtpStore store = new OtpStore(300000);
    OtpStore.Ticket ticket = store.reserve("same", "111111", 7);
    store.cancel("same", ticket);
    store.reserve("same", "222222", 7);
    assertEquals(200, store.verify("same", "222222").status());
  }
}
