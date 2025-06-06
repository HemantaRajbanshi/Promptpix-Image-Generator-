# PromptPix Credit System Testing Guide

## Quick Start Testing

### 1. Start the Application

#### Backend (Terminal 1)
```bash
cd Promptpix/server
npm install
npm start
```

#### Frontend (Terminal 2)
```bash
cd Promptpix/client
npm install
npm run dev
```

### 2. Test User Registration
1. Navigate to `http://localhost:5173`
2. Click "Sign Up" and create a new account
3. **Expected**: User should receive 10 credits upon registration
4. **Verify**: Check the dashboard shows 10 available credits

### 3. Test Dashboard Home
1. After login, you should see the new Dashboard Home
2. **Expected Features**:
   - Welcome message with user name
   - Credit status cards showing 10/10 credits
   - Time until reset (24 hours from registration)
   - Empty recent activity (for new users)
   - Quick action cards

### 4. Test Image Generation
1. Click "Text to Image" from sidebar or quick actions
2. **Expected**: Credit status displayed in top-right (detailed view)
3. Enter a prompt: "A beautiful sunset over mountains"
4. Click "Generate Image"
5. **Expected**: 
   - Success message showing 2 credits used
   - Credit status updates to 8/10
   - Image generated and downloadable
   - Recent activity updated

### 5. Test Background Removal
1. Click "Remove Background" from sidebar
2. **Expected**: Credit status displayed in top-right
3. Upload any image file
4. Click "Remove Background"
5. **Expected**:
   - Success message showing 2 credits used
   - Credit status updates to 6/10 (if following from step 4)
   - Background removed image available for download

### 6. Test Credit Warnings
1. Use credits until you have less than 2 remaining
2. Try to generate an image or remove background
3. **Expected**: Warning message about insufficient credits
4. Operation should be blocked

### 7. Test Credit Reset (Manual)
To test credit reset without waiting 24 hours:

#### Option A: Database Reset (MongoDB)
```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your-test-email@example.com" },
  { 
    $set: { 
      lastCreditReset: new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
    }
  }
)
```

#### Option B: Server-side Reset
Add this temporary endpoint to test reset:
```javascript
// In server/src/routes/userRoutes.js (temporary)
router.post('/test-reset', async (req, res) => {
  const { resetUserCredits } = require('../services/creditResetService');
  try {
    const user = await resetUserCredits(req.user.id);
    res.json({ status: 'success', data: user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
```

### 8. Verify Credit Reset
1. After triggering reset (Option A or B above)
2. Refresh the dashboard or navigate to any tool
3. **Expected**: Credits should be reset to 10/10
4. **Expected**: Recent activity should show "Daily credit reset" entry

## Advanced Testing Scenarios

### Concurrent Operations Test
1. Open multiple browser tabs
2. Try to perform operations simultaneously
3. **Expected**: Credits should deduct correctly without going negative

### Network Failure Test
1. Disconnect internet during an operation
2. **Expected**: Credits should not be deducted for failed operations
3. Reconnect and try again
4. **Expected**: Operation should work and credits deduct properly

### Browser Refresh Test
1. Start an operation
2. Refresh the page before completion
3. **Expected**: Credit status should remain consistent
4. No phantom credit deductions

## API Testing with Postman/curl

### Get Dashboard Data
```bash
curl -X GET http://localhost:5001/api/users/dashboard-data \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Credit Status
```bash
curl -X GET http://localhost:5001/api/users/credit-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Generate Image (with credit deduction)
```bash
curl -X POST http://localhost:5001/api/clipdrop/text-to-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A test image"}'
```

## Expected Responses

### Dashboard Data Response
```json
{
  "status": "success",
  "data": {
    "user": {
      "credits": 10,
      "displayName": "Test User",
      "email": "test@example.com"
    },
    "creditInfo": {
      "currentCredits": 10,
      "dailyLimit": 10,
      "todaysUsage": 0,
      "remainingToday": 10,
      "timeUntilReset": {
        "hours": 23,
        "minutes": 45
      }
    },
    "recentActivity": {
      "all": [],
      "imageGenerations": [],
      "backgroundRemovals": []
    }
  }
}
```

### Credit Status Response
```json
{
  "status": "success",
  "data": {
    "credits": 8,
    "lastReset": "2024-12-07T10:00:00.000Z",
    "resetCount": 1,
    "timeUntilReset": {
      "hours": 22,
      "minutes": 30
    },
    "dailyLimit": 10
  }
}
```

## Troubleshooting

### Credits Not Updating
1. Check browser console for JavaScript errors
2. Verify API responses in Network tab
3. Check server logs for credit deduction errors
4. Ensure MongoDB is running and connected

### Dashboard Not Loading
1. Verify user is authenticated (check localStorage for token)
2. Check API endpoint responses
3. Ensure all required components are imported correctly

### Credit Reset Not Working
1. Check system time and timezone settings
2. Verify MongoDB connection
3. Check server logs for reset service errors
4. Manually trigger reset using database commands

### Image Operations Failing
1. Verify CLIPDROP_API_KEY is set in environment
2. Check ClipDrop API status
3. Ensure file upload limits are configured correctly
4. Check network connectivity

## Performance Testing

### Load Testing Credits
1. Create multiple test accounts
2. Perform simultaneous operations
3. Monitor database performance
4. Check for race conditions in credit deduction

### Memory Usage
1. Monitor browser memory during extended use
2. Check for memory leaks in image handling
3. Verify blob URL cleanup

## Security Testing

### Credit Manipulation Attempts
1. Try to modify credit values in browser localStorage
2. Attempt to bypass credit validation in API calls
3. Test with invalid JWT tokens
4. Verify server-side validation is enforced

### SQL Injection Prevention
1. Test with malicious input in prompts
2. Verify MongoDB injection protection
3. Test file upload security

---

**Note**: This testing guide covers the core functionality. For production deployment, additional testing for scalability, security, and edge cases should be performed.

**Last Updated**: December 2024
