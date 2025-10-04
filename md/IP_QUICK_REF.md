# IP Geolocation - Quick Reference

## 🎯 What It Does

Automatically detects user's location from their IP address to show relevant local search results.

## 🔄 Location Logic Flow

```
GPS Available?
    ├─ YES → Use GPS (highest accuracy)
    └─ NO → Try IP geolocation
              ├─ Success → Use IP location (city-level)
              └─ Failed → Use Lahore fallback
```

## 📍 Priority Order

| Priority | Method   | Accuracy   | Radius                 | User Action      |
| -------- | -------- | ---------- | ---------------------- | ---------------- |
| 1        | GPS      | Exact      | 10-200km (user choice) | Grant permission |
| 2        | IP       | City-level | 200km (fixed)          | None             |
| 3        | Fallback | Fixed      | 200km (fixed)          | None             |

## ⚙️ Configuration

### Service

```
Provider: ipapi.co
Cost: Free (1,000 requests/day)
Speed: ~300-500ms
Key Required: No
```

### Fallback Location

```
City: Lahore, Pakistan
Coordinates: 31.5204, 74.3587
Radius: 200km
```

## 💻 Code Location

**File**: `app/api/cities/route.js`

**Function**: `getIPLocation(request)`

- Lines 4-40

**Usage**: Lines 93-103

## 🧪 Quick Test

```bash
# 1. Run dev server
npm run dev

# 2. Open app in browser (don't grant GPS permission)

# 3. Check server logs:
# You should see:
"Using IP-based location: YourCity, YourCountry"
# OR
"Using fallback location: Lahore, Pakistan"
```

## 📊 Expected Behavior

### Development (localhost)

```
IP: 127.0.0.1
Result: Fallback to Lahore ✅
```

### Production (real users)

```
User in Dubai:
IP: 185.225.68.123
Result: Dubai location detected ✅

User with VPN:
IP: [VPN exit IP]
Result: VPN location detected ⚠️

User with GPS enabled:
IP: [ignored]
Result: GPS location used (higher priority) ✅
```

## 🔧 Common Adjustments

### Change Fallback City

```javascript
// In route.js, line ~103
params.append("locationbias", "circle:200000@51.5074,-0.1278"); // London
```

### Change IP Radius

```javascript
// In route.js, line ~99
params.append(
  "locationbias",
  `circle:100000@${ipLocation.lat},${ipLocation.lng}`
); // 100km
```

### Add More IP Headers

```javascript
// In getIPLocation function, line ~9
const cfIP = request.headers.get("CF-Connecting-IP"); // Cloudflare
const ip = cfIP || forwardedFor?.split(",")[0] || realIp || "unknown";
```

## 📈 Rate Limits

```
Free Tier: 1,000 requests/day
Status: 200 OK (success)
Status: 429 (over limit) → Auto fallback to Lahore
Reset: Daily at midnight UTC
```

## 🆘 Troubleshooting

| Issue               | Solution                                 |
| ------------------- | ---------------------------------------- |
| Always shows Lahore | You're on localhost - deploy to test     |
| Wrong city          | VPN or proxy detected - this is expected |
| Slow responses      | IP API timeout - increase from 3s        |
| Rate limit          | Exceeded 1,000/day - upgrade or cache    |

## 📚 Full Docs

- **Complete Guide**: `md/IP_GEOLOCATION_GUIDE.md`
- **Summary**: `md/IP_GEOLOCATION_SUMMARY.md`

## ✅ Status

**Implementation**: ✅ Complete
**Testing**: ⏳ Ready to test on production
**Cost**: 💚 Free (1,000/day)
**Privacy**: ✅ No storage, GDPR compliant

---

**Pro Tip**: Deploy to Vercel/Netlify to test real IP detection. It won't work accurately on localhost!
