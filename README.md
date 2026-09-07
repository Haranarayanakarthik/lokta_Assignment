# Borrower Copilot

> A borrower-first financial self-assessment tool that helps Indian borrowers understand how much they can safely borrow, what rate may be fair for their profile, and what EMI they should be comfortable agreeing to before approaching a lender.

---

## Overview

Borrower Copilot is a frontend-only personal lending assistant designed around one simple idea:

**A lender may tell you how much they are willing to give you. Borrower Copilot helps you understand how much you should actually take.**

Before approaching a lender, a borrower often does not know:

- Whether they should borrow at all
- How much they can safely afford
- How much a lender might potentially sanction
- Whether an offered interest rate is reasonable
- What EMI they should be comfortable agreeing to
- How a change in income could affect repayment

Borrower Copilot addresses these questions through a transparent, rule-based assessment.

The application does not make a lending decision or guarantee loan approval. Instead, it gives the borrower a structured view of their financial position and provides a **Negotiation Card** that can be used when discussing a loan with a lender.

---

# Key Questions

The application is designed around four questions:

### O1 — Should I borrow?

The application returns one of three outcomes:

- **BORROW**
- **BORROW LESS**
- **DON'T BORROW**

The goal is not to make every borrower eligible.

If the requested loan creates excessive financial pressure, the application should be able to recommend borrowing less or not borrowing at all.

---

### O2 — How much can I borrow?

The application separates affordability into different levels.

#### Safer amount

The amount the borrower can carry while maintaining more financial room.

#### Stretch amount

A higher amount that may technically be manageable but leaves less room for unexpected expenses or income changes.

#### Requested amount

The amount the borrower actually wants.

The application compares these values instead of blindly displaying one "maximum loan amount."

For example:

```text
Requested amount       ₹8,00,000

Safer amount           ₹6,50,000

Stretch amount         ₹7,50,000

Decision               Borrow Less






This allows the borrower to make an informed decision.

O3 — What is a fair interest rate?

Borrower Copilot provides an interest-rate range rather than a single number.

The estimated range considers factors such as:

Credit score
Income type
Income stability
Borrower risk profile
Loan/product type

The rate shown by the application is an estimate and is not a lender quote.

The application also uses the upper end of the estimated rate range when calculating safe borrowing capacity so that the calculation does not assume the borrower will receive the cheapest possible rate.

O4 — What EMI should I agree to?

The application calculates a monthly EMI ceiling based on:

Monthly income
Existing EMIs
Household expenses
A conservative FOIR assumption
A minimum income buffer

The goal is to answer:

"What monthly repayment should I be comfortable committing to?"

rather than:

"What is the largest EMI a lender might allow?"

Core Product Philosophy

Borrower Copilot follows five principles.

1. Lender capacity ≠ borrower capacity

A lender may be willing to sanction a larger amount than the borrower should comfortably take.

The application therefore separates:

What a lender may potentially offer
                vs
What the borrower can safely carry
2. Don't borrow is a valid outcome

The system should not be designed to maximize loan eligibility.

If a borrower's financial position suggests that taking additional debt could create excessive pressure, the application can recommend:

DON'T BORROW

This is especially important for borrowers who already have high-cost debt or recent repayment problems.

3. Unknown is not zero

If the borrower does not know their credit score, the application does not treat it as a score of zero.

Instead, the information is represented as unknown.

Unknown information reduces confidence and can result in a wider estimated range.

Example:

Credit score: Unknown

Fair rate:
12% – 18%

Confidence:
Lower

This is preferable to pretending that missing information represents poor credit.

4. Fewer answers mean wider uncertainty

The application should never create artificial precision from missing information.

More information allows the system to narrow its estimates.

Less information should result in:

Wider ranges
+
Lower confidence

rather than false precision.

5. Every important number should have a reason

The borrower should be able to understand why the application produced a particular number.

For example:

"Your safe EMI is ₹21,500 because we limit total EMI obligations to a conservative share of income and also account for your existing EMI and household expenses."

The purpose is explainability rather than creating a black-box financial score.

How the Calculation Works

The application follows a rule-based calculation pipeline.

Borrower answers
       ↓
Income assessment
       ↓
Existing obligations
       ↓
Safe EMI calculation
       ↓
Stretch EMI calculation
       ↓
Fair-rate estimation
       ↓
EMI + rate + tenure
       ↓
Safe loan amount
       ↓
Stretch loan amount
       ↓
Requested amount comparison
       ↓
Borrow / Borrow Less / Don't Borrow
       ↓
Stress test
       ↓
Negotiation Card
Affordability Model

The current prototype uses two affordability boundaries.

Safe FOIR
Safe FOIR = 40%

The application calculates:

Safe total EMI capacity
= Monthly income × 40%

Then existing EMI obligations are deducted:

Safe new EMI
= Safe total EMI capacity - Existing EMIs

Example:

Monthly income       ₹1,10,000

40% of income        ₹44,000

Existing EMI         ₹14,000

Safe new EMI         ₹30,000
Stretch FOIR

The prototype also uses:

Stretch FOIR = 50%

This creates a second boundary:

Stretch total EMI capacity
= Monthly income × 50%

Stretch new EMI
= Stretch total EMI capacity - Existing EMIs

The stretch figure is intentionally presented as a higher-risk boundary rather than the recommended amount.

Expense-Based Affordability

FOIR alone is not enough.

A borrower can have a reasonable income-to-EMI ratio and still have insufficient monthly cash flow after household expenses.

Therefore the application also considers:

Monthly income
- Household expenses
- Existing EMI
= Disposable income

A minimum income buffer is then retained.

The safe EMI is effectively constrained by both:

FOIR-based capacity
+
Expense-based capacity

The lower value is used for the safer EMI estimate.

This prevents the application from recommending an EMI purely because it passes a percentage-of-income test.

Loan Amount Calculation

The application does not use a static multiplier such as:

EMI × 48

Instead, the loan amount is calculated using the standard EMI amortization relationship.

For a loan:

P = Principal
r = Monthly interest rate
n = Number of months

The EMI is calculated using:

EMI =
P × r × (1+r)^n
-----------------
(1+r)^n - 1

The application can also reverse this relationship to determine the principal corresponding to a given EMI:

Principal =
EMI × ((1+r)^n - 1)
--------------------
r × (1+r)^n

Therefore:

Safe EMI
   +
Interest rate
   +
Tenure
   ↓
Safe loan amount

and:

Stretch EMI
   +
Interest rate
   +
Tenure
   ↓
Stretch loan amount

This makes the result responsive to changes in income, expenses, interest rate and tenure.

Interest Rate Model

Borrower Copilot provides an estimated rate band instead of claiming that one exact rate is fair for every borrower.

The prototype considers:

Credit score

A stronger credit profile can narrow the estimated range toward lower rates.

Unknown credit score

An unknown score does not become zero.

Instead, the rate range becomes less certain.

Income type

The application distinguishes between:

Salaried
Self-employed
Informal

This is important because income stability and documentation can affect lending risk.

Tenure

The prototype currently uses an assessment tenure of:

4 years

This is an assessment assumption rather than a universal recommendation.

A future version should allow borrowers to compare different tenures:

3 years
4 years
5 years
6 years

A longer tenure generally reduces monthly EMI but increases the total interest paid over the life of the loan.

Stress Test

Borrower Copilot includes a simple income stress scenario.

The current prototype tests:

Income drops by 20%

For example:

Current income       ₹1,10,000

Stress income         ₹88,000

The purpose is to answer:

"Would this repayment still be manageable if my income temporarily fell?"

The stress test is not intended to predict the future. It is a simple resilience check.

Negotiation Card

One of the main product outputs is a one-screen Negotiation Card.

The card summarizes the most useful information a borrower can take into a lender conversation.

It includes:

Amount requested
Safer amount
EMI ceiling
Fair rate

It also provides questions the borrower should ask the lender:

What is the actual APR?
What is the processing fee?
Is insurance mandatory?
What are the foreclosure charges?

The objective is to help the borrower compare the lender's offer against their own calculated position.

Example

Suppose a borrower receives:

Requested amount: ₹8,00,000

Safer amount: ₹6,50,000

Stretch amount: ₹7,50,000

Fair rate: 11% – 13%

Safe EMI: ₹21,500

The application should communicate:

You requested ₹8,00,000.

₹6,50,000 is within your safer range.

₹7,50,000 represents a stretch.

Your requested amount is above the safer range,
so consider borrowing less.

The application does not prevent the borrower from choosing a different amount.

It provides the information needed to understand the trade-off.

Three Borrower Scenarios

The application is designed to behave differently for different borrower profiles.

Priya — Salaried
Age: 29
Location: Bengaluru
Income: ₹1,10,000/month
Employment: Salaried
Existing EMI: ₹14,000
Credit score: 780
Rent: ₹28,000
Requested loan: ₹8,00,000
Purpose: Wedding

The system should recognize:

Stable salaried income
Strong credit profile
Existing EMI obligation
Non-productive loan purpose

The output should focus on affordability and the trade-off between the requested amount and the safer amount.

Ravi — Self-employed
Age: 42
Location: Mysuru
Income: ₹40,000–₹80,000/month
ITR income: ₹4,20,000/year
Property: ₹45,00,000
Property status: Unencumbered
Credit score: Unknown
Requested loan: ₹15,00,000
Purpose: Business expansion

The system should recognize:

Variable income
Lower documented income
No established formal credit history
Significant unencumbered collateral
Productive business purpose

This borrower should not simply be evaluated like a salaried personal-loan applicant.

A future/product-specific implementation should route this profile toward considering secured business/property-backed products.

Anita — Informal Income
Age: 35
Location: Hubballi
Income: ₹26,000–₹30,000/month
Income type: Informal
Existing app loans: 3
Outstanding debt: ₹35,000
Existing interest: 30%+
Recent EMI bounce: Yes
Requested loan: ₹1,50,000
Purpose: Electric scooter

The system should recognize:

Low and variable income
Existing high-cost debt
Recent repayment stress
Household financial pressure

This is a case where:

DON'T BORROW

can be a legitimate and useful outcome.

The purpose is not to find a way to approve another loan.

The purpose is to protect the borrower's ability to repay.

Technology Stack

The application is intentionally frontend-only.

Frontend
React.js
JavaScript
Vite
Tailwind CSS
Architecture
React UI
   ↓
Local state
   ↓
Rule-based calculations
   ↓
Results

No backend is required for the current version.

Why There Is No Backend

The challenge specifically requires:

No login
No bureau pull
No personal data storage
Everything calculated from what the borrower provides
No backend required

Therefore the prototype performs calculations locally in the browser.

This also makes the application:

Simple to run
Fast
Privacy-friendly
Easy to demonstrate
Easy to modify during the follow-up interview
Project Structure

The current prototype intentionally keeps the implementation simple.

borrower-copilot/
│
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
│
├── public/
│
├── README.md
├── RULES.md
├── THREE_RUNTHROUGHS.md
├── package.json
└── vite.config.js

The initial prototype keeps the core UI and calculation logic in App.jsx to reduce unnecessary abstraction during the time-boxed assignment.

As the rule system grows, calculation logic can be separated into dedicated modules.

Running Locally
Requirements
Node.js
npm
Installation

Clone the repository:

git clone <YOUR_REPOSITORY_URL>

Navigate into the project:

cd borrower-copilot

Install dependencies:

npm install

Start the development server:

npm run dev

Open the local URL shown by Vite.

Typical Vite development URL:

http://localhost:5173
Privacy

Borrower Copilot is designed as a local assessment tool.

The current prototype does not require:

User accounts
Login
Credit bureau access
Bank account access
Database storage
Personal-data persistence

The calculations are performed from the information entered by the borrower.

Limitations

This is a decision-support prototype and should not be interpreted as a loan approval engine.

The application does not have access to:

Credit bureau data
Bank statements
Verified income documents
Individual lender underwriting policies
Actual lender offers
Complete borrower financial history

Therefore the output is an estimate based on the rules and assumptions defined by the application.

Actual loan eligibility, pricing, APR and sanction amount may differ between lenders.

Design Principles

The product intentionally favors:

Transparency over false precision

Ranges are preferred when the available information cannot justify a single number.

Borrower safety over maximum eligibility

The safest amount is not necessarily the largest amount a lender could sanction.

Explainability over complexity

Every major output should have a simple explanation.

Adaptive questioning over long forms

Additional questions should only be asked when they can meaningfully improve an output.

Honest uncertainty

Missing information should reduce confidence rather than being converted into arbitrary values.

Future Improvements

If more development time were available, the next improvements would be:

Product-specific rate bands for personal, vehicle, business, gold and property-backed loans.
Dynamic tenure comparison.
More accurate APR calculation including applicable fees.
Better lender-side sanction estimation.
Adaptive question flows based on borrower type.
Separate rules engine from UI.
More detailed stress scenarios such as rate increases and expense increases.
Product routing for self-employed and collateral-backed borrowers.
Printable/shareable Negotiation Card.
Improved confidence scoring.
More detailed explanation for every calculated value.
Validation against additional borrower scenarios.
What I Would Not Build

The product does not need to become a generic banking platform.

I would avoid spending time on:

Authentication
Social features
Chat functionality
Payment processing
Generic AI chatbot features
User profiles
Complex backend infrastructure
Machine-learning credit scoring without reliable underlying data

The core value of the product is the transparent borrower-side decision system.

Disclaimer

Borrower Copilot is an educational decision-support prototype, not a lender, financial advisor, credit bureau or loan approval system. Its calculations are estimates based on stated assumptions and user-provided information. Actual lender terms and eligibility may differ.


### One thing I strongly recommend

Don't stop at `README.md`. The assignment specifically says **`RULES.md` will be read as carefully as the code**.

So our next deliverable should be `RULES.md` with a table like:

| What | Value | Why | Source |
|---|---:|---|---|
| Safe FOIR | 40% | Conservative affordability boundary | My judgement |
| Stretch FOIR | 50% | Shows higher-risk affordability boundary | My judgement |
| Safe buffer | 15% | Preserve monthly financial room | My judgement |
| Stretch buffer | 5% | Represents reduced financial room | My judgement |
| Stress income reduction | 20% | Simple resilience test | My judgement |
| Assessment tenure | 4 years | Initial comparison assumption | My judgement |
| Unknown credit score | Unknown | Never treat missing data as zero | Product rule |
| Calculation rate | Upper end of fair band | Avoid overstating affordability | My judgement |

**That document is where we should now put the actual India/RBI-backed assumptions and distinguish them from our own product judgement.** That will make your assignment much easier to defend when they change a rule during the 60-minute follow-up.
