# Phase 5 Planning: Payment System & Marketplace

**Date**: April 7, 2026  
**Target**: Production Ready Payment Processing

---

## Overview

Implement a complete payment system allowing developers to monetize their games with Stripe integration, commission handling, and seller payouts.

---

## Core Features

### 1. Game Pricing System

**Backend Implementation**:

Database Updates:
```typescript
// Extend Game model
interface IGame {
  // ... existing fields
  price: number;              // 0 for free, >0 for paid
  isFree: boolean;            // true if price = 0
  currency: string;           // "USD" (default), "EUR", "GBP"
  stripeProductId?: string;   // Stripe product reference
  stripePriceId?: string;     // Stripe price reference
  status: "draft" | "published"; // Publishing status
}

// New Product model for Stripe sync
interface IProduct {
  gameId: ObjectId;           // ref: Game
  stripeProductId: string;    // Stripe ID
  stripePriceIds: {
    usd: string;
    eur: string;
    gbp: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

API Endpoints:
```
POST   /api/games/:gameId/pricing     - Set game price
GET    /api/games/:gameId/pricing     - Get pricing info
PUT    /api/games/:gameId/pricing     - Update price
GET    /api/games/featured/top-sales  - Top selling games
```

---

### 2. Purchase & Checkout System

**Models**:

```typescript
// Order/Purchase Record
interface IPurchase {
  gameId: ObjectId;           // ref: Game
  buyerId: ObjectId;          // ref: User (purchaser)
  sellerId: ObjectId;         // ref: User (game creator)
  amount: number;             // Price in cents (e.g., 2999 = $29.99)
  currency: string;           // "USD"
  
  // Stripe reference
  stripePaymentIntentId: string;
  stripeCheckoutSessionId: string;
  
  // Status tracking
  status: "pending" | "completed" | "failed" | "refunded";
  paidAt?: Date;
  refundedAt?: Date;
  refundReason?: string;
  
  // Commission calculation
  platformFee: number;        // AceArena commission (15%)
  developerEarnings: number;  // Amount developer receives
  
  createdAt: Date;
  updatedAt: Date;
}

// User Purchase History
interface IPurchaseHistory {
  userId: ObjectId;           // ref: User
  gameId: ObjectId;           // ref: Game
  purchasedAt: Date;
  downloadCount: number;      // Track usage
}
```

**API Endpoints**:
```
POST   /api/checkout/session         - Create checkout session
GET    /api/checkout/session/:id     - Get session status
POST   /api/purchases                - Record purchase
GET    /api/purchases/my-games       - User's purchased games
GET    /api/purchases/history        - User's purchase history
GET    /api/developer/sales          - Developer's sales stats
GET    /api/developer/earnings       - Developer's earnings
POST   /api/developer/payout         - Request payout to bank
```

---

### 3. Stripe Integration

**Configuration**:

Environment Variables:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_COMMISSION_ACCOUNT=acct_...  # Platform account
```

**Webhook Handling**:
```typescript
// Events to handle
- payment_intent.succeeded → Mark purchase as paid
- payment_intent.payment_failed → Mark as failed
- charge.refunded → Process refund
- customer.subscription.* → Future: subscription games
```

**Stripe Products Structure**:
```typescript
// For each game with price > 0:
Stripe Product:
  - Name: Game Title
  - Description: Game Description
  - Metadata:
    - gameId: MongoDB game ID
    - sellerId: Author ID

Stripe Price:
  - Amount: Game price in cents
  - Currency: USD/EUR/GBP
  - Recurring: null (one-time)
```

---

### 4. Checkout Flow (Frontend)

**Pages**:

`/games/:gameId/purchase` - Purchase Confirmation:
```typescript
// Show game details
// Price breakdown (price, platform fee 15%, your earnings)
// Payment method selection
// Terms acceptance
// "Buy Now" button → Stripe Checkout
```

`/checkout/success` - Success Page:
```typescript
// Download game link
// Thank you message
// Related games recommendation
// Add to library
```

`/checkout/cancel` - Cancelled Page:
```typescript
// Cart abandoned message
// Return to game page button
// Auto-delete session
```

**API Integration**:
```typescript
// Backend creates Stripe Checkout Session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'payment',
  success_url: 'http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'http://localhost:3000/checkout/cancel',
  customer_email: user.email,
  
  line_items: [{
    price: game.stripePriceId,
    quantity: 1,
  }],
  
  metadata: {
    gameId: gameId,
    buyerId: userId,
    sellerId: game.createdBy,
  },
});

// Frontend redirects user to session.url
window.location.href = session.url;
```

---

### 5. Developer Dashboard - Sales Analytics

**Page**: `/dashboard/sales` - Sales & Earnings:

```typescript
// Stats Cards:
- Total Sales Count
- Total Revenue
- Average Rating
- Platform Fee (15%)

// Charts:
- Sales over time (7d, 30d, 90d)
- Revenue by currency
- Top performing games
- Sales by region (if available)

// Table:
- Recent purchases (date, buyer, amount, status)
- Per-game stats (copies sold, revenue, rating)

// Payout Section:
- Available balance
- Pending balance (48h hold)
- Payout history
- Bank account settings
- Request payout button
```

**API Endpoints**:
```
GET /api/developer/sales/stats       - Summary stats
GET /api/developer/sales/timeline    - Sales history
GET /api/developer/sales/by-game     - Per-game breakdown
GET /api/developer/earnings/report   - Detailed report
GET /api/developer/balance           - Current balance
```

---

### 6. Payout Management

**Stripe Connect** (Future Phase):
```typescript
// Integration: Stripe Connect for direct payouts
// Benefits:
// - Automatic payout to developer's bank
// - No intermediate holding accounts
// - Tax documentationgenerated

// Typical payout flow:
1. Developer earns money → balance increases
2. Balance reaches minimum ($100) → eligible for payout
3. Developer requests payout
4. Stripe processes payout (2-5 business days)
5. Funds arrive in developer's bank account
```

**Manual Payout** (MVP):
```typescript
// For Phase 5 MVP:
1. Calculate developer earnings (revenue - 15% fee)
2. Store payout request in DB
3. Admin reviews and processes manually
4. Update payout status to "completed"
5. Developer sees receipt
```

---

### 7. Commission & Tax Handling

**Default Commission Structure**:
```
Game Price: $29.99 (2999 cents)
  - Platform Fee (15%): $4.50
  - Developer Earnings: $25.49
  
// For free games: no commission
// For Jam entries: possible waived fees (future)

// Tax handling (future):
- US developers: 1099-K for > $20k/year
- EU developers: VAT handling
- Multi-currency support
```

**Database Schema**:
```typescript
interface ICommissionRecord {
  purchaseId: ObjectId;       // ref: Purchase
  amount: number;             // Commission amount in cents
  percentage: number;         // 15 (default)
  calculatedAt: Date;
  paidToAceArena: boolean;    // Accounting tracking
}
```

---

## Implementation Phases

### α (Alpha - MVP)
**Timeline**: 2-3 weeks

Features:
- [x] Game pricing model
- [x] Stripe integration basics
- [x] Simple checkout session
- [x] Purchase recording
- [x] Basic sales dashboard
- [x] Manual payout requests

**Not Included**:
- Stripe Connect
- Tax forms
- Multi-currency
- Refunds
- Fraud detection

### β (Beta - Enhanced)
**Timeline**: 2-3 weeks after Alpha

Features:
- [x] Stripe Connect
- [x] Automatic payouts
- [x] Refund processing
- [x] Tax document generation
- [x] Multi-currency prices
- [x] Regional pricing

### γ (Gamma - Advanced)
**Timeline**: 3-4 weeks after Beta

Features:
- [x] Fraud detection
- [x] Chargeback handling
- [x] Subscription games
- [x] Revenue sharing (collabs)
- [x] Affiliate system
- [x] Season passes

---

## Database Changes Required

### New Collections

1. **products** - Stripe product sync
2. **purchases** - Transaction records
3. **payouts** - Developer payment records
4. **refunds** - Refund tracking
5. **coupons** - Discount codes (future)
6. **commissions** - Commission tracking

### Updated Collections

1. **games** - Add pricing fields
2. **users** - Add payout bank account
3. **orders** - New if using different structure

### Indexes Required
```javascript
// Fast lookups
db.purchases.createIndex({ gameId: 1 })
db.purchases.createIndex({ buyerId: 1 })
db.purchases.createIndex({ sellerId: 1 })
db.purchases.createIndex({ status: 1 })
db.purchases.createIndex({ createdAt: -1 })

// Payout queries
db.purchases.createIndex({ sellerId: 1, status: 1 })
db.purchases.createIndex({ sellerId: 1, createdAt: -1 })
```

---

## Frontend Components to Build

### New Pages
- `/games/:id/purchase` - Purchase form
- `/checkout/success` - Success page
- `/checkout/cancel` - Cancel page
- `/dashboard/sales` - Sales analytics
- `/settings/payout` - Bank account setup

### New Components
- `PriceDisplay` - Format & show prices
- `CheckoutButton` - Trigger Stripe modal
- `PriceSelector` - Choose currency
- `SalesChart` - Revenue chart
- `PayoutForm` - Bank account entry
- `PurchaseHistory` - Past transactions

### Modified Components
- Game detail page - Add purchase button
- Dashboard - Link to sales stats
- User profile - Link to payout settings

---

## Stripe Webhook Events

```typescript
// Handle these webhook events:

'payment_intent.succeeded':
  - Mark purchase as paid
  - Send confirmation email
  - Unlock download

'charge.refunded':
  - Revert purchase record
  - Send refund email
  - Remove download access

'checkout.session.completed':
  - Create purchase record
  - Calculate commission
  - Queue welcome email

'customer.created':
  - Link Stripe customer to user
  - Update user metadata
```

---

## Security Considerations

### PCI Compliance
- ✅ Never store card details (Stripe handles)
- ✅ HTTPS only for payment pages
- ✅ No card data in logs
- ✅ Verify webhook signatures

### Fraud Prevention
- ✅ Verify amounts server-side
- ✅ Check user authentication
- ✅ Rate limit checkout sessions
- ✅ Monitor for chargebacks

### Data Protection
- ✅ Encrypt sensitive fields in DB
- ✅ PII handling per GDPR
- ✅ Log access to purchase data
- ✅ Regular security audits

---

## Testing Strategy

### Unit Tests
- Commission calculation
- Price formatting
- Payout eligibility
- Error handling

### Integration Tests
- Stripe API responses
- Webhook processing
- Database transactions
- Email notifications

### E2E Tests
- Complete checkout flow
- Refund processing
- Dashboard data accuracy
- Payout requests

---

## Estimated Costs

### Stripe Fees (Post-MVP)
- Payment processing: 2.2% + $0.30 per transaction
- Payout fees: Free (US), $0.25 (International)
- Monthly minimum: ~$50-100 platform fee

### Example Transaction
```
Game Price: $29.99
  - Stripe Fee (2.2% + $0.30): $0.96
  - Net to Platform: $29.03
  - AceArena Commission (15% of net): $4.35
  - Developer Receives: $24.68 (82.2%)
```

---

## Success Metrics

- ✅ Checkout conversion rate > 2%
- ✅ Payment processing time < 30s
- ✅ Payout success rate > 99%
- ✅ Refund processing time < 5 days
- ✅ Zero unhandled payment errors
- ✅ Developer satisfaction > 4.5/5

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Stripe API outage | High | Queue payments, retry logic |
| Chargebacks | Medium | Fraud detection, documentation |
| Tax compliance | High | Consult accountant, automate |
| PCI violations | Critical | Use Stripe, never store cards |
| Regional restrictions | Medium | Geo-blocking in Stripe config |
| Currency fluctuation | Low | Lock rates at checkout |

---

## Timeline & Milestones

**Week 1: Setup & Models**
- Stripe account setup
- Database schema updates
- Model creation
- Webhook endpoint setup

**Week 2: Checkout Flow**
- Backend checkout endpoint
- Frontend purchase page
- Stripe session creation
- Success/cancel pages

**Week 3: Purchase Recording & Payouts**
- Purchase model & endpoints
- Commission calculation
- Sales dashboard
- Payout system (manual MVP)

**Week 4: Testing & Documentation**
- Integration testing
- Security review
- Documentation
- Production deployment

---

## Future Enhancements

### Phase 5.1: Stripe Connect
- Automatic payouts to developer banks
- Real-time balance tracking
- Multi-currency settlement

### Phase 5.2: Advanced Features
- Coupon/discount codes
- Bundle purchases
- Early access pricing
- Season passes

### Phase 5.3: Marketplace Analytics
- Sales leaderboards
- Game recommendations
- Purchase analytics
- Market trends

### Phase 5.4: Revenue Sharing
- Collaboration splits
- Revenue sharing contracts
- Joint game revenue
- Publisher programs

---

## Dependencies & Integration

### External Services
- ✅ Stripe (payment processing)
- ✅ Email service (purchase receipts)
- ✅ Analytics (sales tracking)

### Internal Systems
- ✅ User authentication
- ✅ Game management
- ✅ Developer dashboard
- ✅ Email notifications

### Data Exports
- Sales reports (CSV)
- Tax forms (PDF)
- Payout history
- Revenue analytics

---

## Next Steps (When Ready to Start Phase 5)

1. **Create Stripe account** & get API keys
2. **Review payment laws** for target regions
3. **Design payout structure** with stakeholders
4. **Set up test environment** with Stripe test cards
5. **Begin backend implementation** with DB models
6. **Build checkout flow** frontend components
7. **Integrate webhooks** for payment events
8. **Implement sales dashboard** and analytics
9. **Security review** before production
10. **Launch MVP** with manual payouts first

---

## Questions to Resolve Before Starting

1. **Commission percentage**: 15% or different?
2. **Minimum payout threshold**: $50, $100, or $500?
3. **Payout frequency**: Weekly, monthly, or on-demand?
4. **Regional support**: Which currencies/countries?
5. **Tax handling**: Who files 1099-K for US developers?
6. **Refund policy**: Full refund within X days?
7. **Fraud detection**: Threshold for manual review?
8. **Support**: Who handles payment disputes?

---

## Documentation References

- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Connect](https://stripe.com/docs/connect)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [PCI Compliance](https://stripe.com/docs/security/pci-compliance)

