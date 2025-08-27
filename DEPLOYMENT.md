# Render Deployment Guide

## Fixing the "react-scripts: not found" Error

The error you encountered is common on Render. Here's how to fix it:

### 1. Updated Package.json
- Moved `react-scripts` from `devDependencies` to `dependencies`
- Added necessary build dependencies
- Ensured all required packages are in the correct section

### 2. Render Configuration
- Created `render.yaml` for proper deployment settings
- Set static site configuration
- Specified Node.js version 18.17.0 (more stable than 22.x)

### 3. Build Process
The build command should now work:
```bash
npm install && npm run build
```

## Render Deployment Steps

### 1. Connect Your Repository
- Connect your GitHub repository to Render
- Choose "Static Site" as the service type

### 2. Build Settings
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Node Version**: 18.17.0 (specified in render.yaml)

### 3. Environment Variables (Optional)
If you need to configure your backend URL:
- Add `REACT_APP_API_URL` with your FastAPI server URL

## Alternative: Manual Build Command

If you still encounter issues, try this build command in Render:
```bash
npm install --production=false && npm run build
```

## Troubleshooting

### If build still fails:
1. **Check Node Version**: Ensure you're using Node.js 18.x or 16.x (not 22.x)
2. **Clear Cache**: Delete `node_modules` and `package-lock.json`, then redeploy
3. **Check Dependencies**: Ensure all packages are in `dependencies`, not `devDependencies`

### Common Issues:
- **Memory Issues**: Render free tier has limited memory, consider upgrading
- **Timeout Issues**: Build might take longer than expected, be patient
- **CORS Issues**: Ensure your FastAPI backend allows your Render domain

## Success Indicators

When deployment succeeds, you should see:
- ✅ Build completed successfully
- ✅ Site accessible at your Render URL
- ✅ Medical dashboard loads with sample data
- ✅ Backend status shows "disconnected" (normal for demo)

## Next Steps

After successful deployment:
1. Configure your FastAPI backend URL
2. Test the full integration
3. Customize the UI as needed
4. Set up production environment variables
