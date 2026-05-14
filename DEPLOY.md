# Deploy TxPick lên Vercel

Hướng dẫn deploy app TxPick lên Vercel và point domain `txpick.com` về app.

## Bước 1 — Push code lên GitHub

```bash
cd "C:\Users\hoaid\TxPick app\TXPICK"
git init
git add .
git commit -m "TxPick v0.1"
git branch -M main
```

Tạo repo trống trên GitHub (https://github.com/new), tên `txpick`. Đừng tick "Initialize with README". Sau đó:

```bash
git remote add origin https://github.com/<your-username>/txpick.git
git push -u origin main
```

Nhớ kiểm tra `.gitignore` đã có `.env` — file `.env` **không bao giờ** được commit.

## Bước 2 — Connect Vercel

1. Vào https://vercel.com/new
2. Đăng nhập bằng GitHub
3. Bấm "Import" cạnh repo `txpick`
4. Vercel sẽ tự nhận Vite. Build command, output directory đã có sẵn trong `vercel.json`.
5. Mở phần **Environment Variables** và thêm 3 biến:

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://viqqwpbmkqhrpthxlsdc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_rtc6lvkI6zQU0sZDGGvq3w_S87nhnsp` |
| `VITE_OPENAI_API_KEY` | (key OpenAI của bạn — có thể bỏ trống để tắt AI) |

Bấm **Deploy**. Sau 1-2 phút sẽ có URL kiểu `txpick-xxx.vercel.app`.

## Bước 3 — Cập nhật Supabase Redirect URLs

1. Vào https://supabase.com/dashboard/project/viqqwpbmkqhrpthxlsdc/auth/url-configuration
2. **Site URL**: đổi thành URL Vercel (ví dụ `https://txpick-xxx.vercel.app`) — sau khi point domain xong thì đổi thành `https://txpick.com`.
3. **Redirect URLs**: thêm cả 2:
   - `https://txpick-xxx.vercel.app/**`
   - `https://txpick.com/**`
4. Lưu.

Bước này quan trọng — không có nó, Google OAuth và email verification sẽ redirect về `localhost`.

## Bước 4 — Point domain txpick.com

### Nếu bạn đã mua txpick.com:

1. Trong Vercel, vào project → Settings → Domains
2. Bấm "Add", gõ `txpick.com`
3. Vercel sẽ hiện DNS records cần thêm. Có 2 tùy chọn:

**A. Đổi nameservers (đơn giản hơn):**
- Trong panel của registrar (GoDaddy, Namecheap, Cloudflare...), đổi nameservers thành:
  ```
  ns1.vercel-dns.com
  ns2.vercel-dns.com
  ```
- Đợi 5-30 phút (đôi khi đến 24 giờ) cho DNS lan truyền.

**B. Thêm record thủ công:**
- A record cho `@` (root domain) → `76.76.21.21`
- CNAME cho `www` → `cname.vercel-dns.com`

Vercel sẽ tự cấp SSL cert miễn phí (Let's Encrypt) trong vòng vài phút sau khi DNS resolve.

### Nếu chưa mua domain:

Mua trên Namecheap, Cloudflare, Porkbun (rẻ nhất, ~$10/năm cho `.com`). Sau đó làm theo các bước trên.

## Bước 5 — Smoke test

Vào `https://txpick.com` (hoặc URL `*.vercel.app`):

- [ ] Landing page hiện đúng
- [ ] Đổi EN/VI hoạt động
- [ ] Đăng ký email mới → vào được dashboard
- [ ] Thêm chi phí → reload trang → data còn nguyên
- [ ] Xuất PDF từ tab Tax → in được Schedule C + 1099 + W-2

Nếu có lỗi, mở DevTools (F12) → tab Console xem có error gì. Báo mình, mình debug.

## Auto-deploy

Sau khi setup xong, mỗi lần `git push` lên branch `main`, Vercel sẽ tự build và deploy. Pull request sẽ tự có preview URL riêng — tiện để bạn của bạn test trước khi merge.

## ⚠️ Trước khi public cho khách hàng thật

1. **Rotate OpenAI key** trong https://platform.openai.com/api-keys (key cũ đã lộ ra trong chat).
2. **Rotate Supabase secret key** trong Supabase Dashboard → Settings → API.
3. **Move OpenAI call sang Supabase Edge Function** — để key không vào browser bundle. Xem `src/lib/openai.js` có ghi chú chỗ cần đổi.
4. **Setup Stripe** cho subscription Pro $9.99/tháng (mình có thể làm sau).
5. **Review RLS policies** trong Supabase — chắc chắn không ai đọc được data của người khác.
