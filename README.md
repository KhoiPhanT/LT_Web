# HiHiHaHa Auto - Lập Trình Web (Client 2 & Backend 2)

Dự án phát triển song song cho môn Lập trình Web:
- **Client 2:** Next.js 14 App Router (Tách biệt hoàn toàn, trỏ tới Servlet Backend 2).
- **Backend 2:** Java Jakarta Servlet 6.0 + MySQL 8.x (Maven Project, Tomcat 10).

---

## Cấu trúc thư mục

```
lap_trinh_web/
├── client2/       # Giao diện người dùng Next.js 14
└── backend2/      # Hệ thống RESTful API Java Servlet + MySQL (Maven)
```

## Hướng dẫn đẩy lên Repository GitHub Mới

Khởi tạo remote trỏ đến repository GitHub mới của bạn:

```bash
cd lap_trinh_web
git init
git add .
git commit -m "feat: Khoi tao du an Lap Trinh Web gom client2 va backend2 servlet"
git branch -M main
git remote add origin <URL_REPOSITORY_GITHUB_MOI_CUA_BAN>
git push -u origin main
```
