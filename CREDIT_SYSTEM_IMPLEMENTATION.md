# PromptPix Daily Credit System Implementation

## Overview
This document outlines the comprehensive daily credit system implemented for the PromptPix application, providing users with exactly 10 credits per day that reset every 24 hours.

## System Specifications

### Credit Allocation
- **Daily Credits**: 10 credits per user
- **Reset Schedule**: Every 24 hours from last reset (not midnight-based)
- **Reset Behavior**: Credits reset to exactly 10 (not additive)
- **New User Credits**: 10 credits granted immediately upon registration

### Credit Costs
- **Image Generation (Text-to-Image)**: 2 credits per generation
- **Background Removal**: 2 credits per removal
- **Image Editor**: Free (0 credits)

### Credit Reset Logic
- Credits reset 24 hours after the last reset timestamp
- If a user uses 4 credits today, tomorrow they get 10 credits total (not 6 + 10)
- Reset occurs regardless of previous day's usage
- Automatic reset triggered on user activity (login, API calls)

## Backend Implementation

### Database Schema (User Model)
```javascript
// Enhanced User Schema
{
  credits: { type: Number, default: 10 },
  lastCreditReset: { type: Date, default: Date.now },
  dailyCreditResetCount: { type: Number, default: 0 },
  creditHistory: [{
    operation: { type: String, enum: ['text-to-image', 'remove-background', 'daily-reset', 'purchase', 'admin-grant'] },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    description: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  }]
}
```

### Key Backend Services

#### Credit Reset Service (`/server/src/services/creditResetService.js`)
- `needsDailyReset(user)`: Checks if 24 hours have passed since last reset
- `resetUserCredits(userId)`: Resets credits to 10 and logs the transaction
- `checkAndResetCredits(userId)`: Automatically checks and resets if needed
- `getTimeUntilReset(user)`: Calculates remaining time until next reset

#### Credit Middleware (`/server/src/middleware/creditMiddleware.js`)
- `validateCredits(requiredCredits, operationType)`: Pre-operation credit validation
- `deductCredits()`: Post-operation credit deduction with atomic transactions
- Race condition protection and rollback mechanisms

#### User Controller Enhancements (`/server/src/controllers/userController.js`)
- `getDashboardData()`: Comprehensive dashboard data with credit info and activity
- `getCreditStatus()`: Real-time credit status and reset information
- `getCreditHistory()`: Paginated credit transaction history

### API Endpoints
- `GET /api/users/dashboard-data`: Complete dashboard information
- `GET /api/users/credit-status`: Current credit status and reset time
- `GET /api/users/credit-history`: Credit transaction history
- `POST /api/clipdrop/text-to-image`: Image generation (2 credits)
- `POST /api/clipdrop/remove-background`: Background removal (2 credits)

## Frontend Implementation

### New Components

#### DashboardHome (`/client/src/pages/tools/DashboardHome.jsx`)
- Comprehensive dashboard overview
- Real-time credit status display
- Recent activity timeline
- Quick action cards
- Statistics overview

#### CreditStatus Component (`/client/src/components/CreditStatus.jsx`)
- Multiple display variants (compact, default, detailed)
- Real-time credit updates
- Progress bars and visual indicators
- Automatic refresh functionality

#### Credit Warning/Success Components
- `CreditWarning`: Displays insufficient credit warnings
- `CreditSuccess`: Shows successful operation confirmations
- Automatic timeout and dismissal

### Enhanced Tool Components

#### TextToImage Enhancements
- Pre-operation credit validation
- Real-time credit status display
- Success/failure credit feedback
- Automatic credit refresh after operations

#### RemoveBackground Enhancements
- Same credit integration as TextToImage
- Consistent user experience across tools

### Frontend API Integration
- `userAPI.getDashboardData()`: Fetch comprehensive dashboard data
- `userAPI.getCreditStatus()`: Get current credit status
- Real-time credit updates after operations
- Error handling for credit-related failures

## User Experience Features

### Dashboard Experience
1. **Welcome Screen**: Personalized greeting with credit overview
2. **Credit Cards**: Visual display of current credits, usage, and reset time
3. **Activity Timeline**: Recent operations with timestamps and credit costs
4. **Quick Actions**: Direct access to main tools with credit requirements

### Credit Feedback System
1. **Pre-Operation Validation**: Warns users before insufficient credit operations
2. **Real-Time Updates**: Credit balance updates immediately after operations
3. **Success Confirmations**: Clear feedback on successful credit deductions
4. **Reset Notifications**: Information about when credits will refresh

### Visual Indicators
- **Color-coded Status**: Green (sufficient), Yellow (low), Red (insufficient)
- **Progress Bars**: Visual representation of daily credit usage
- **Time Displays**: Countdown to next credit reset
- **Operation Costs**: Clear display of credit requirements

## Security & Performance

### Credit System Security
- Atomic database transactions prevent race conditions
- Server-side validation prevents client-side manipulation
- Credit deduction only after successful operations
- Rollback mechanisms for failed transactions

### Performance Optimizations
- Efficient database queries with proper indexing
- Cached credit status to reduce API calls
- Optimistic UI updates with fallback mechanisms
- Throttled credit status refreshes

## Configuration

### Environment Variables
```bash
# MongoDB connection for credit persistence
MONGODB_URI=mongodb://localhost:27017/promptpix

# ClipDrop API for image operations
CLIPDROP_API_KEY=your_clipdrop_api_key

# JWT for user authentication
JWT_SECRET=your_jwt_secret
```

### Credit Configuration (`/client/src/constants/index.js`)
```javascript
export const CREDIT_CONFIG = {
  OPERATION_COST: 2,
  LOW_CREDIT_THRESHOLD: 5,
  OPERATIONS: {
    TEXT_TO_IMAGE: 2,
    REMOVE_BACKGROUND: 2,
    IMAGE_EDITOR: 0
  }
};
```

## Testing Recommendations

### Manual Testing Scenarios
1. **New User Registration**: Verify 10 credits are granted
2. **Credit Deduction**: Test image generation and background removal
3. **Daily Reset**: Wait 24 hours or manually trigger reset
4. **Insufficient Credits**: Attempt operations without enough credits
5. **Real-time Updates**: Verify UI updates after operations

### Automated Testing
- Unit tests for credit calculation logic
- Integration tests for API endpoints
- E2E tests for complete user workflows
- Load testing for concurrent credit operations

## Future Enhancements

### Potential Features
1. **Credit Purchase System**: Allow users to buy additional credits
2. **Premium Subscriptions**: Higher daily limits for paid users
3. **Credit Gifting**: Transfer credits between users
4. **Usage Analytics**: Detailed credit usage reports
5. **Batch Operations**: Bulk processing with credit validation

### Monitoring & Analytics
- Credit usage patterns and trends
- Popular operation types
- User engagement metrics
- System performance monitoring

## Deployment Notes

### Database Migration
- Existing users will receive default credit allocation
- Credit history will be empty for existing users
- No data loss during implementation

### Rollback Plan
- Database schema is backward compatible
- Credit system can be disabled via feature flags
- Original functionality preserved as fallback

## Support & Maintenance

### Common Issues
1. **Credit Not Updating**: Check API connectivity and refresh manually
2. **Reset Not Working**: Verify system time and database connectivity
3. **Negative Credits**: Check for race conditions and transaction logs

### Monitoring Points
- Daily active users and credit consumption
- Failed operations due to insufficient credits
- Credit reset success rates
- API response times for credit operations

---

**Implementation Status**: ✅ Complete
**Last Updated**: December 2024
**Version**: 1.0.0
