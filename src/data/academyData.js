/**
 * PocketWise 2.0 - Financial Academy Curriculum
 * Rigorous, structured financial literacy lessons spanning 11 core categories.
 * Each lesson includes key takeaways, comprehensive educational content, and quiz evaluations.
 */

export const academyCategories = [
  { id: 'all', name: 'All Categories' },
  { id: 'banking', name: 'Banking' },
  { id: 'budgeting', name: 'Personal Budgeting' },
  { id: 'saving', name: 'Saving' },
  { id: 'investing', name: 'Investing' },
  { id: 'mutual-funds', name: 'Mutual Funds' },
  { id: 'stocks-etfs', name: 'Stocks & ETFs' },
  { id: 'loans-emis', name: 'Loans & EMIs' },
  { id: 'credit-scores', name: 'Credit Cards & Scores' },
  { id: 'retirement', name: 'Retirement Planning' },
  { id: 'security', name: 'Digital Payment Security' },
  { id: 'fraud', name: 'Financial Fraud Awareness' },
]

export const academyLessons = [
  {
    id: 'banking-basics-101',
    category: 'banking',
    categoryName: 'Banking',
    title: 'Understanding Indian Banking: Savings vs Current Accounts & DICGC Insurance',
    readTime: '6 min read',
    level: 'Beginner',
    summary: 'Learn the architectural differences between savings and current accounts, minimum average balance calculations, and statutory depositor insurance limits.',
    keyTakeaways: [
      'Savings accounts earn moderate interest (typically 2.7%–4.0% p.a.) but impose daily transaction and debit limits.',
      'Current accounts offer unlimited transaction velocity without interest, tailored for business entities.',
      'Under DICGC (RBI subsidiary), principal and interest up to ₹5,00,000 per depositor per bank are insured in case of bank liquidation.',
    ],
    content: `
### 1. Introduction to Deposit Accounts
In the Indian financial system regulated by the Reserve Bank of India (RBI), commercial banks offer two primary deposit vehicles for transaction settlements: **Savings Accounts** and **Current Accounts**.

### 2. Savings Accounts: Purpose & Mechanics
A Savings Bank (SB) account is designed to encourage individual capital preservation while providing moderate liquidity:
- **Interest Accrual**: Under RBI directives, interest is calculated on a daily product basis and credited quarterly or monthly into the account.
- **Transaction Limits**: Banks restrict free cash withdrawals and ATM transactions per month to encourage electronic clearing (UPI, NEFT, RTGS).
- **Taxation (Section 80TTA/80TTB)**: Interest income up to ₹10,000 is deductible under Section 80TTA for individuals below 60 years.

### 3. Current Accounts: Fluid Liquidity for Commerce
A Current Account is an operational conduit for businesses, partnerships, and high-velocity sole proprietorships:
- **Zero Interest**: As per RBI regulations, banks typically do not pay interest on current account balances.
- **Overdraft Facilities**: Current accounts can be linked to overdraft (OD) lines against collateral or receivables.

### 4. Depositor Protection: The DICGC Safety Net
All commercial banks (public, private, cooperative, and regional rural banks) in India are covered by the **Deposit Insurance and Credit Guarantee Corporation (DICGC)**:
- **Coverage Ceiling**: Exactly **₹5,00,000** (inclusive of both principal and accrued interest) per depositor across all branches of the same bank.
- **Prudent Distribution**: Sophisticated savers holding substantial liquidity allocate funds across multiple distinct scheduled banks to maintain 100% insured status.
    `,
    quiz: [
      {
        id: 'q1',
        question: 'What is the maximum insured deposit amount per depositor per bank under RBI\'s DICGC scheme?',
        options: [
          '₹1,00,000',
          '₹2,50,000',
          '₹5,00,000',
          '₹10,00,000',
        ],
        correctIndex: 2,
        explanation: 'Under current DICGC statutory guidelines, depositor balances including principal and accrued interest are insured up to ₹5,00,000 per bank.',
      },
      {
        id: 'q2',
        question: 'How is interest calculated on standard Indian Savings Bank accounts?',
        options: [
          'On the minimum balance between the 10th and last day of each month',
          'On the daily end-of-day closing balance',
          'On the average monthly balance at the end of the quarter',
          'On annual fixed milestones only',
        ],
        correctIndex: 1,
        explanation: 'Under RBI mandates, banks must calculate interest daily on the end-of-day balance maintained by the account holder.',
      },
    ],
  },
  {
    id: 'budgeting-50-30-20',
    category: 'budgeting',
    categoryName: 'Personal Budgeting',
    title: 'The 50/30/20 Capital Allocation Framework: Execution & Nuance',
    readTime: '7 min read',
    level: 'Beginner',
    summary: 'A disciplined approach to dividing take-home cash flow into essential obligations, discretionary lifestyle, and irreversible wealth building.',
    keyTakeaways: [
      '50% Net Inflow: Inelastic basic living costs (housing, groceries, utilities, minimum debt servicing).',
      '30% Discretionary: Elastic leisure, dining, entertainment, and personal luxury.',
      '20% Capital Accumulation: Systematic investments, debt acceleration, and emergency reserve building.',
    ],
    content: `
### 1. The Core Allocation Ratio
Originally popularized in modern financial engineering, the 50/30/20 framework acts as a heuristic guardrail against lifestyle inflation.

### 2. Category 1: Essential Needs (50% Ceiling)
These represent obligations that cannot be foregone without severe legal, health, or existential fallout:
- Residential rent or mortgage principal + interest
- Basic food rations and household groceries
- Essential municipal utilities and internet connectivity
- Minimum contractual debt payments and medical insurance

### 3. Category 2: Discretionary Wants (30% Envelope)
Expenses that enhance lifestyle quality but are compressible during economic contractions:
- Dining out, coffee subscriptions, and gourmet provisions
- Weekend travel and recreational hobbies
- Streaming services and entertainment admissions

### 4. Category 3: Strategic Savings & Debt Acceleration (20% Floor)
The engine of personal balance sheet expansion:
- Emergency liquidity funding (3–6 months essential runway)
- Systematic Investment Plans (SIPs) in broad-market index funds
- Additional principal prepayments against high-interest debt
    `,
    quiz: [
      {
        id: 'q1',
        question: 'Under the 50/30/20 framework, what percentage of net post-tax income represents the recommended minimum floor for savings and investments?',
        options: ['10%', '20%', '30%', '50%'],
        correctIndex: 1,
        explanation: 'The framework allocates a minimum floor of 20% toward long-term savings, debt prepayment, and capital accumulation.',
      },
    ],
  },
  {
    id: 'investing-index-funds-101',
    category: 'investing',
    categoryName: 'Investing',
    title: 'Broad Market Indexing: Nifty 50, Sensex, & The Low-Cost Compounding Advantage',
    readTime: '8 min read',
    level: 'Intermediate',
    summary: 'Why passive index investing consistently outperforms the majority of active mutual funds over 10+ year investment horizons through low expense ratios.',
    keyTakeaways: [
      'Nifty 50 represents the 50 largest, most liquid publicly traded companies across key economic sectors in India.',
      'Total Expense Ratio (TER) drag compounding over decades significantly diminishes active fund alpha.',
      'Tracking error and tracking difference are the primary metrics to evaluate when choosing an index fund or ETF.',
    ],
    content: `
### 1. The Philosophy of Passive Market Participation
Rather than spending time, analytical overhead, and capital trying to beat market returns, passive investing captures the aggregate growth of the Indian corporate economy.

### 2. What is the Nifty 50?
The **Nifty 50** index is managed by NSE Indices Ltd. and tracks 50 of the largest market-capitalized and liquid Indian enterprises:
- **Free-Float Market Capitalization**: Stocks are weighted according to their tradeable share value.
- **Sector Diversification**: Spans Financial Services, Information Technology, Energy, FMCG, and Automobiles.

### 3. The Mathematics of Expense Ratios (TER)
Active equity mutual funds in India regularly charge between 1.5% and 2.25% in regular plans (or 0.8%–1.2% in direct plans).
In contrast, passive **Nifty 50 Direct Index Funds** carry expense ratios as low as **0.06% to 0.15%**:
- Over a 25-year compounding horizon at 12% gross CAGR, a 1% annual fee differential can erode up to **24% of the final terminal corpus**.

### 4. Evaluating Index Funds: Tracking Error
When selecting an index fund, smart investors look for:
- Low Tracking Error (standard deviation of daily benchmark return differences).
- Lowest Total Expense Ratio (TER).
- High Fund AUM to ensure operational liquidity during rebalancing cycles.
    `,
    quiz: [
      {
        id: 'q1',
        question: 'What is the primary operational metric that indicates how closely a passive index fund replicates its benchmark index?',
        options: [
          'Sharpe Ratio',
          'Tracking Error',
          'Sortino Ratio',
          'Beta Coefficient',
        ],
        correctIndex: 1,
        explanation: 'Tracking Error measures the annualized standard deviation of excess returns of the fund over its benchmark index.',
      },
    ],
  },
  {
    id: 'loans-cibil-credit-scores',
    category: 'credit-scores',
    categoryName: 'Credit Cards & Scores',
    title: 'Deconstructing the CIBIL Score: Utilization Ratios, Inquiries, & Credit Health',
    readTime: '7 min read',
    level: 'Intermediate',
    summary: 'An empirical guide to how credit bureaus calculate your 300–900 score, the dangers of revolving credit, and how to maintain prime loan eligibility.',
    keyTakeaways: [
      'CIBIL score ranges from 300 to 900; scores above 750 secure preferential home loan interest rates.',
      'Credit Utilization Ratio (CUR) should ideally remain below 30% of aggregate sanctioned credit limits.',
      'Hard inquiries from multiple loan applications in a brief window depress credit scores.',
    ],
    content: `
### 1. Credit Bureaus in India
Four credit information companies are licensed by the RBI: **TransUnion CIBIL**, **Experian**, **Equifax**, and **CRIF High Mark**. Among these, CIBIL is the most widely cited by Indian mortgage and retail lenders.

### 2. Weighting Matrix of the CIBIL Algorithm
While proprietary, the score is driven by four primary weighted pillars:
1. **Payment History (~35%)**: On-time repayment of EMIs and card statements. Even a single 30-day DPD (Days Past Due) mark damages prime eligibility.
2. **Credit Utilization Ratio (~30%)**: The proportion of credit limits utilized each billing cycle. Exceeding 30% indicates credit hunger.
3. **Credit Age & Mix (~15%–20%)**: A healthy ratio between secured debt (home loan, car loan) and unsecured debt (credit cards, personal loans) over a long tenure.
4. **Recent Hard Inquiries (~10%)**: Inquiries initiated by lenders when you apply for new debt.

### 3. Tactical Rules for Maintaining an 800+ Score
- Always pay the **Total Amount Due**, never merely the "Minimum Amount Due" which incurs 36%–44% annual revolving interest.
- Maintain older credit cards to preserve historical credit age.
- Request credit limit increases without increasing nominal spending to naturally depress your Credit Utilization Ratio.
    `,
    quiz: [
      {
        id: 'q1',
        question: 'What is the recommended maximum Credit Utilization Ratio (CUR) across your credit cards to maintain an optimal credit score?',
        options: ['10%', '30%', '60%', '90%'],
        correctIndex: 1,
        explanation: 'Credit bureaus recommend keeping your credit utilization ratio below 30% of your total sanctioned limit to avoid signaling credit distress.',
      },
    ],
  },
  {
    id: 'security-digital-fraud-prevention',
    category: 'fraud',
    categoryName: 'Financial Fraud Awareness',
    title: 'Defending Against Digital Payment Fraud: UPI PIN Rules, SIM Swaps, & Phishing',
    readTime: '6 min read',
    level: 'Beginner',
    summary: 'Practical safeguards against modern digital banking fraud, including UPI collect scams, remote desktop takeovers, and immediate zero-liability reporting.',
    keyTakeaways: [
      'UPI PIN is entered ONLY to debit funds from your account. Receiving money NEVER requires entering your PIN.',
      'Banks and RBI never request CVV, OTP, or remote screen sharing apps (AnyDesk, TeamViewer).',
      'Reporting cyber fraud within 72 hours under RBI zero-liability frameworks protects you from unauthorized electronic transaction loss.',
    ],
    content: `
### 1. The Cardinal Rule of UPI Payments
The most prevalent scam in India involves fraudsters claiming to "send" or "refund" money via UPI:
- **Golden Rule**: **A UPI PIN is used solely for debiting money**. You do NOT enter your PIN to receive funds.
- If a QR code or payment prompt asks for your PIN, money will leave your account immediately.

### 2. Remote Access Trojan (RAT) Traps
Fraudsters pose as utility officials, courier delivery agents, or KYC executives instructing targets to install APK files or screen-sharing tools:
- Once granted access, the attacker observes OTPs and credential inputs in real-time.
- Never install applications outside official app stores or at the instruction of unsolicited callers.

### 3. Immediate Action on Unauthorized Transactions
If you detect an unauthorized debit:
1. Immediately block your card or freeze netbanking via bank SMS shortcuts.
2. Dial **1930** (National Cyber Crime Reporting Helpline) or log on to \`cybercrime.gov.in\`.
3. Notify your home branch within **3 business days** to preserve RBI circular protection under **Customer Protection: Limiting Liability of Customers in Unauthorized Electronic Banking Transactions**.
    `,
    quiz: [
      {
        id: 'q1',
        question: 'When is it necessary to enter your UPI PIN on your mobile device?',
        options: [
          'To receive money from another person or merchant',
          'Only when debiting money or checking your bank balance',
          'To verify your identity during incoming transactions',
          'When accepting a payment request from a business',
        ],
        correctIndex: 1,
        explanation: 'Entering your UPI PIN authorizes a debit from your account or verifies your balance. Receiving money NEVER requires a UPI PIN.',
      },
    ],
  },
]

