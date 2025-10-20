# 🔐 Login Credentials untuk Development

## **Username & Password untuk Testing**

### **Admin User**
- **Username:** `admin`
- **Password:** `password123`
- **Role:** Admin
- **Name:** Hesti

### **DpH User**
- **Username:** `dph`
- **Password:** `password123`
- **Role:** DpH
- **Name:** DpH User

### **System Owner**
- **Username:** `systemowner`
- **Password:** `password123`
- **Role:** System Owner
- **Name:** System Owner

## **🔧 Cara Login**

1. Buka aplikasi di browser (http://localhost:3001)
2. Masukkan salah satu username di atas
3. Masukkan password: `password123`
4. Klik tombol "Login"

## **⚠️ Catatan Penting**

- **Ini adalah mock authentication untuk development**
- **Password sama untuk semua user: `password123` (development mode)**
- **Ketika backend sudah siap, akan diganti dengan real authentication**
- **Semua security features tetap aktif (validation, audit logging, dll)**

## **🚀 Fitur Security yang Aktif**

- ✅ Input validation & sanitization
- ✅ Password strength validation
- ✅ Account lockout setelah 5 failed attempts
- ✅ Audit logging untuk semua aktivitas
- ✅ Session management
- ✅ Secure token storage
- ✅ XSS protection
- ✅ SQL injection prevention

## **📝 Untuk Production**

Ketika siap untuk production, ganti `mockAuthService` dengan real API calls di:
- `src/services/authService.ts`
- Update `API_BASE_URL` ke production endpoint
- Implement proper JWT validation
- Add database integration

---

**Happy Testing! 🎉**
