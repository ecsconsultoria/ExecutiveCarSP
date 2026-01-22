# Deployment Guide - ExecutiveCarSP PWA

## Quick Deploy

### Option 1: Static Hosting (Netlify, Vercel, GitHub Pages)

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting service

3. **Configure routing:**
   - For SPA routing, configure your host to redirect all routes to `index.html`

#### Netlify
Create `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Vercel
Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### GitHub Pages
Use the `gh-pages` package:
```bash
npm install -D gh-pages
```

Add to `package.json`:
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

Then run:
```bash
npm run deploy
```

### Option 2: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:
```bash
docker build -t executivecarsp .
docker run -p 80:80 executivecarsp
```

### Option 3: Simple HTTP Server (Development/Testing)

```bash
npm run preview
# or
npx serve dist
```

## Environment Configuration

No environment variables needed - the app is 100% client-side!

## PWA Requirements

For PWA to work properly:
- ✅ Serve over HTTPS (or localhost for development)
- ✅ Ensure service worker is registered
- ✅ Manifest.json is accessible

## Post-Deployment Checklist

- [ ] App loads at root URL
- [ ] All routes work (refresh on any page should work)
- [ ] Service worker registers (check DevTools > Application)
- [ ] App is installable (check install prompt)
- [ ] Data persists across page reloads
- [ ] Backup/export works
- [ ] App works offline

## Monitoring

Since the app is fully client-side:
- Use browser DevTools to debug
- Check IndexedDB in Application tab
- Monitor Service Worker status
- Check Console for errors

## Updates

When deploying updates:
1. Users will auto-update on next page load (service worker)
2. Data in IndexedDB persists across updates
3. Recommend users export backup before major updates

## Troubleshooting

**App not loading:**
- Check browser console for errors
- Verify all assets are in `dist/` folder
- Check routing configuration

**Data not persisting:**
- Check IndexedDB is enabled in browser
- Ensure not in private/incognito mode
- Check Storage quota

**Service Worker not registering:**
- Must be served over HTTPS or localhost
- Check browser supports service workers
- Clear cache and hard reload

## Support

For issues, check:
- Browser console errors
- Network tab for failed requests
- Application tab for IndexedDB and Service Worker status
