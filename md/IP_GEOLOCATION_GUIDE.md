# IP-Based Geolocation Guide

## Overview

Automatic location detection using the user's IP address to provide relevant search results even when browser geolocation is denied or unavailable.

## How It Works

```
User searches without GPS permission
    ↓
Server extracts IP from request headers
    ↓
Query ipapi.co for location data
    ↓
Use IP location for search bias (200km radius)
    ↓
Fallback to Lahore, Pakistan if IP lookup fails
```

## Location Priority Hierarchy

1. **GPS Location** (Highest Priority)
   - When user grants browser geolocation permission
   - Most accurate (exact coordinates)
   - User-configurable radius (10-200km)
2. **IP-Based Location** (Medium Priority)
   - When GPS denied/unavailable
   - City-level accuracy
   - Fixed 200km radius
3. **Fallback Location** (Lowest Priority)
   - When IP lookup fails
   - Lahore, Pakistan (31.5204, 74.3587)
   - Fixed 200km radius

## Technical Implementation

### Service: ipapi.co

**Features:**

- ✅ Free tier: 1,000 requests/day
- ✅ No API key required
- ✅ City-level accuracy
- ✅ Fast response (<500ms)
- ✅ Global coverage

**Limitations:**

- ❌ 1,000 requests/day limit
- ❌ City-level only (not GPS-accurate)
- ❌ May be blocked by ad blockers
- ❌ Doesn't work for localhost

### API Endpoint

```javascript
GET https://ipapi.co/{ip}/json/

Response:
{
  "ip": "110.93.244.123",
  "city": "Lahore",
  "region": "Punjab",
  "country": "PK",
  "country_name": "Pakistan",
  "latitude": 31.5204,
  "longitude": 74.3587,
  "timezone": "Asia/Karachi"
}
```

### Code Structure

```javascript
// Get client IP from headers
const forwardedFor = request.headers.get("x-forwarded-for");
const realIp = request.headers.get("x-real-ip");
const ip = forwardedFor?.split(",")[0] || realIp;

// Query ipapi.co
const response = await fetch(`https://ipapi.co/${ip}/json/`);
const data = await response.json();

// Use location for bias
params.append(
  "locationbias",
  `circle:200000@${data.latitude},${data.longitude}`
);
```

## Usage Examples

### Example 1: User in New York

```
IP: 142.250.185.46
    ↓
IP Lookup → New York, USA (40.7128, -74.0060)
    ↓
Search "coffee shop" → Results biased to NYC
```

### Example 2: User in Dubai

```
IP: 185.225.68.123
    ↓
IP Lookup → Dubai, UAE (25.2048, 55.2708)
    ↓
Search "market" → Results biased to Dubai
```

### Example 3: Localhost Development

```
IP: 127.0.0.1 (localhost)
    ↓
IP Lookup → Skipped (private IP)
    ↓
Fallback → Lahore, Pakistan
```

## Configuration

### Change Fallback Location

Edit `app/api/cities/route.js`:

```javascript
} else {
  // Change fallback city here
  console.log('Using fallback location: London, UK');
  params.append("locationbias", "circle:200000@51.5074,-0.1278");
}
```

### Change IP Service

Replace `ipapi.co` with alternative:

```javascript
// Option 1: ip-api.com (free, 45 requests/minute)
const response = await fetch(`http://ip-api.com/json/${ip}`);

// Option 2: ipgeolocation.io (requires API key, 1000 requests/day)
const response = await fetch(
  `https://api.ipgeolocation.io/ipgeo?apiKey=YOUR_KEY&ip=${ip}`
);

// Option 3: ipinfo.io (requires token, 50k requests/month)
const response = await fetch(`https://ipinfo.io/${ip}/json?token=YOUR_TOKEN`);
```

### Adjust Timeout

Change the 3-second timeout:

```javascript
signal: AbortSignal.timeout(5000), // Increase to 5 seconds
```

### Change IP Radius

Adjust the 200km default radius for IP-based locations:

```javascript
// Larger area (500km)
params.append(
  "locationbias",
  `circle:500000@${ipLocation.lat},${ipLocation.lng}`
);

// Smaller area (100km)
params.append(
  "locationbias",
  `circle:100000@${ipLocation.lat},${ipLocation.lng}`
);
```

## Headers Used

### x-forwarded-for

```
x-forwarded-for: 110.93.244.123, 172.16.0.1
                 ↑ Client IP      ↑ Proxy IP
```

Standard header added by proxies/load balancers. Contains client's real IP.

### x-real-ip

```
x-real-ip: 110.93.244.123
```

Alternative header used by nginx and some CDNs.

## Deployment Considerations

### Vercel

```javascript
// Automatically populates x-forwarded-for
const ip = request.headers.get("x-forwarded-for")?.split(",")[0];
```

### Netlify

```javascript
// Uses x-nf-client-connection-ip
const ip = request.headers.get("x-nf-client-connection-ip");
```

### Cloudflare

```javascript
// Uses CF-Connecting-IP
const ip = request.headers.get("CF-Connecting-IP");
```

### Custom Server (Node.js)

```javascript
// Express: req.ip or req.connection.remoteAddress
const ip = req.ip || req.connection.remoteAddress;
```

## Rate Limiting

### ipapi.co Limits

- **Free Tier**: 1,000 requests/day
- **Over Limit**: Returns 429 status code
- **Reset**: Daily at midnight UTC

### Handling Rate Limits

```javascript
async function getIPLocation(request) {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);

    if (response.status === 429) {
      console.log("IP API rate limit exceeded, using fallback");
      return null; // Triggers fallback location
    }

    // ... rest of code
  } catch (error) {
    return null;
  }
}
```

### Optimization Strategies

1. **Cache IP Locations**

```javascript
const ipCache = new Map();

if (ipCache.has(ip)) {
  return ipCache.get(ip);
}

const location = await fetchIPLocation(ip);
ipCache.set(ip, location);
```

2. **Use Paid Tier** (if needed)

- ipapi.co Pro: $15/month for 50,000 requests
- ip-api.com: $13/month for 150,000 requests

## Privacy & Compliance

### GDPR Considerations

- ✅ IP addresses are personal data under GDPR
- ✅ Need lawful basis (legitimate interest)
- ✅ Include in privacy policy
- ✅ Log IP only temporarily (not stored)

### Privacy Policy Text

Add to your privacy policy:

```
Location Detection:
We use your IP address to approximate your location and provide
relevant search results. Your IP address is not stored and is only
used for the duration of your search request. You can override this
by enabling browser geolocation for more accurate results.
```

## Testing

### Test Different Locations

**Method 1: VPN**

```
1. Connect to VPN in different country
2. Search on your app
3. Check server logs for detected location
```

**Method 2: Test IP Parameter**

```javascript
// Temporarily modify code for testing
const ip = "8.8.8.8"; // Google DNS (USA)
const ip = "185.225.68.123"; // Dubai, UAE
const ip = "103.31.104.1"; // Pakistan
```

**Method 3: cURL with IP Header**

```bash
curl -H "x-forwarded-for: 8.8.8.8" http://localhost:3000/api/cities?q=market
```

### Expected Behavior

| Scenario              | Expected Result                      |
| --------------------- | ------------------------------------ |
| User with GPS enabled | GPS location used (highest accuracy) |
| User without GPS      | IP location used (city-level)        |
| Localhost development | Fallback to Lahore                   |
| VPN user              | VPN exit location detected           |
| Rate limit exceeded   | Fallback to Lahore                   |
| IP API timeout        | Fallback to Lahore                   |

## Monitoring

### Log IP Locations

Monitor what locations are being detected:

```javascript
if (ipLocation) {
  console.log(
    `IP Location: ${ipLocation.city}, ${ipLocation.country} (${ipLocation.lat}, ${ipLocation.lng})`
  );
}
```

### Track API Usage

Monitor your ipapi.co usage:

- Visit: https://ipapi.co/usage/
- Check daily request count
- Set up alerts at 80% usage

## Troubleshooting

### Issue: Always using fallback location

**Causes:**

- Running on localhost
- Behind corporate firewall
- Rate limit exceeded
- API timeout

**Solutions:**

1. Check server logs for IP detection
2. Verify headers contain real IP
3. Test with public IP
4. Increase timeout duration

### Issue: Wrong location detected

**Causes:**

- User behind VPN
- Mobile carrier proxy
- Corporate network proxy
- ISP assigns regional IPs

**Solutions:**

- This is expected behavior for IP-based detection
- User can enable GPS for accurate location
- Document this limitation in UI

### Issue: Rate limit errors

**Causes:**

- Exceeded 1,000 requests/day
- Too many users

**Solutions:**

1. Implement IP caching
2. Upgrade to paid tier
3. Switch to alternative service
4. Use GPS as primary method

## Cost Analysis

### Free Services

| Service    | Free Limit   | Overage             |
| ---------- | ------------ | ------------------- |
| ipapi.co   | 1,000/day    | $15/month for 50k   |
| ip-api.com | 45/minute    | $13/month for 150k  |
| ipinfo.io  | 50,000/month | $249/month for 500k |

### Recommendations

**Small Apps (<1000 users/day):**

- Use ipapi.co free tier
- No cost

**Medium Apps (1000-5000 users/day):**

- Use ipapi.co Pro: $15/month
- Or ip-api.com: $13/month

**Large Apps (>5000 users/day):**

- Use ipinfo.io: $249/month for 500k
- Or implement caching + multiple free services

## Alternatives to IP Geolocation

### 1. Browser Geolocation Only

```javascript
// Remove IP lookup entirely
// Rely only on GPS or fallback
```

**Pros:** No API costs, no rate limits
**Cons:** Poor UX when GPS denied

### 2. Ask User to Select Location

```javascript
// Dropdown with major cities
<select>
  <option>Lahore</option>
  <option>Karachi</option>
  <option>Islamabad</option>
</select>
```

**Pros:** User control, no API calls
**Cons:** Extra step, not automatic

### 3. Use Cloudflare Headers

```javascript
// If using Cloudflare
const country = request.headers.get("CF-IPCountry");
const city = request.headers.get("CF-IPCity");
```

**Pros:** Free, fast, part of Cloudflare
**Cons:** Requires Cloudflare, less accurate

## Performance Impact

### Metrics

- **API Call Time**: ~300-500ms
- **Timeout**: 3 seconds max
- **Failure Handling**: Instant fallback
- **User Impact**: Minimal (parallel to other operations)

### Optimization

```javascript
// Don't block on IP lookup
const ipLocationPromise = getIPLocation(request);

// Continue with other operations...

// Use IP location when available
const ipLocation = await ipLocationPromise;
```

## Future Enhancements

- [ ] Cache IP locations in Redis
- [ ] Use multiple IP services as fallbacks
- [ ] Store user's preferred location
- [ ] A/B test IP vs GPS usage patterns
- [ ] Analytics on detection accuracy
- [ ] Automatic service switching on rate limits

---

**Status**: ✅ Implemented
**Service**: ipapi.co (free tier)
**Fallback**: Lahore, Pakistan
**Rate Limit**: 1,000 requests/day
