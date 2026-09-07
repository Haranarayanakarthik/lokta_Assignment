# Borrower Copilot — RULES.md

Version: 1.0

> **Important:** Borrower Copilot is a borrower-side decision-support prototype, not a lender or credit-approval system. Values marked **My judgement** are product assumptions created for this prototype and are not RBI-prescribed thresholds.

---

## 1. Design principles

| What | Value | Why | Source |
|---|---:|---|---|
| Borrower-side recommendation | Borrow / Borrow Less / Don't Borrow | The product should not assume every borrower should take the requested loan. | My judgement |
| Safe amount vs lender amount | Keep separate | A lender's possible sanction and a borrower's comfortable repayment capacity are different concepts. | My judgement |
| Unknown credit score | Unknown, never 0 | Missing information should widen uncertainty rather than be treated as a very poor score. | Product rule |
| Ranges instead of false precision | Use bands | User-provided information cannot justify a precise lender quote. | My judgement |
| Explainability | Every major number gets a reason | The borrower should understand what drove the result. | Challenge requirement / My judgement |
| No personal data storage | Local browser calculation | The challenge explicitly requires no login, bureau pull or personal-data storage. | Challenge requirement |

---

## 2. Income assumptions

| What | Value | Why | Source |
|---|---|---|---|
| Salaried income | Reported net monthly income | Net income is the starting point for monthly repayment capacity. | My judgement |
| Self-employed income | Prefer conservative/documented income when available | Reported cash income can be more volatile and less verifiable than documented income. | My judgement |
| Informal/variable income | Use the conservative end of the reported range | Avoid overstating repayment capacity when income is uncertain. | My judgement |
| Missing income | Do not silently assume a positive value | Missing information should prevent a misleading affordability calculation. | Product rule |

The prototype does not verify salary slips, bank statements, ITRs or other income documents. Results are based on borrower-provided information.

---

## 3. FOIR / EMI affordability

### 3.1 Safe FOIR

| What | Value | Why | Source |
|---|---:|---|---|
| Safe FOIR | 40% | Conservative product boundary to avoid pushing total EMIs too high relative to income. | My judgement |
| Existing EMIs | Fully included | Existing debt already consumes repayment capacity. | My judgement |
| Safe total EMI | Income × 40% | Defines the prototype's conservative total-EMI boundary. | Derived |
| Safe new EMI | Safe total EMI − existing EMIs | Only remaining repayment capacity should be available for the new loan. | Derived |

Formula:

```text
Safe total EMI = usable monthly income × 40%
Safe new EMI = Safe total EMI − existing monthly EMIs
```

**40% is NOT an RBI-mandated universal FOIR limit. It is a product assumption for this prototype.**

### 3.2 Stretch FOIR

| What | Value | Why | Source |
|---|---:|---|---|
| Stretch FOIR | 50% | Shows a higher repayment boundary with less financial headroom. | My judgement |
| Stretch new EMI | Stretch total EMI − existing EMIs | Shows a possible stretch boundary, not the recommended amount. | Derived |

Formula:

```text
Stretch total EMI = usable monthly income × 50%
Stretch new EMI = Stretch total EMI − existing monthly EMIs
```

---

## 4. Household expense check

FOIR alone is not sufficient.

```text
Disposable income =
Monthly income − household expenses − existing EMIs
```

### Safe buffer

| What | Value | Why | Source |
|---|---:|---|---|
| Safe monthly buffer | 15% of usable monthly income | Preserve some income after essential expenses and debt obligations. | My judgement |
| Expense-based safe EMI | Disposable income − safe buffer | Prevent FOIR from being the only affordability constraint. | Derived |

Final safe EMI:

```text
MIN(FOIR-based safe EMI, expense-based safe EMI)
```

### Stretch buffer

| What | Value | Why | Source |
|---|---:|---|---|
| Stretch monthly buffer | 5% of usable monthly income | Represents reduced financial headroom in the stretch scenario. | My judgement |
| Expense-based stretch EMI | Disposable income − stretch buffer | Creates a second, less conservative affordability boundary. | Derived |

Final stretch EMI:

```text
MIN(stretch FOIR capacity, stretch expense capacity)
```

---

## 5. Loan amount calculation

The application must not use a static multiplier such as:

```text
EMI × 48
```

Instead, principal is calculated using the EMI amortisation relationship.

```text
EMI = P × r × (1+r)^n / ((1+r)^n − 1)
```

Where:

```text
P = principal
r = monthly interest rate
n = number of monthly instalments
```

Reverse calculation:

```text
P = EMI × ((1+r)^n − 1) / (r × (1+r)^n)
```

Therefore:

```text
Safe EMI + interest rate + tenure
        ↓
Safe loan amount
```

and:

```text
Stretch EMI + interest rate + tenure
        ↓
Stretch loan amount
```

---

## 6. Assessment tenure

| What | Value | Why | Source |
|---|---:|---|---|
| Prototype assessment tenure | 4 years | Provides a consistent initial basis for comparing borrower capacity. | My judgement |
| Actual lender tenure | Not assumed | Actual tenure depends on product, lender, borrower profile and loan type. | Product limitation |

Future version: allow 3, 4, 5 and 6-year comparisons and show EMI, total interest and total repayment.

---

## 7. Fair interest-rate band

RBI does **not** provide one universal fair personal-loan rate for every borrower. The application therefore provides an estimated band, not an RBI rate or lender quote.

| What | Prototype value | Why | Source |
|---|---:|---|---|
| Base rate band | 13%–18% | Starting prototype range before profile adjustments. | My judgement |
| Credit score >= 750 | Lower band | Treated as a stronger credit signal in the prototype. | My judgement |
| Credit score 700–749 | Moderately lower band | Middle-risk adjustment in the prototype. | My judgement |
| Unknown credit score | Wider / higher uncertainty | Unknown is not treated as zero. | Product rule |
| Salaried income | Small downward adjustment | Stable documented salary is treated as a lower-risk signal. | My judgement |
| Informal income | Higher upper bound | Variable/unverified income creates more uncertainty. | My judgement |

**The percentages above are prototype assumptions and must not be described as RBI-prescribed rates.**

---

## 8. Rate used for safe-loan calculation

Example:

```text
Fair rate = 12%–18%
Calculation rate = 18%
```

The upper end is used for safe-capacity calculations.

| What | Value | Why | Source |
|---|---:|---|---|
| Calculation rate | Upper end of estimated fair-rate band | Avoid overstating safe borrowing capacity. | My judgement |

---

## 9. Credit score

| What | Value | Why | Source |
|---|---|---|---|
| Known score | Use reported score | Helps narrow the estimated pricing range. | Product rule |
| Unknown score | `null` / unknown | Missing data must remain unknown. | Product rule |
| Unknown = 300 | No | Would incorrectly convert missing information into poor credit. | Product rule |
| Unknown score effect | Wider range / lower confidence | Represents uncertainty without inventing a score. | My judgement |

---

## 10. Verdict logic

### BORROW

```text
Requested amount <= safe amount
```

Meaning: requested amount is within the prototype's safer affordability range.

### BORROW LESS

```text
Requested amount > safe amount
AND
Requested amount <= stretch amount
```

Meaning: requested amount may be possible but is above the safer range.

### DON'T BORROW

Triggered when the requested amount exceeds the stretch capacity or additional risk rules indicate that new debt is inappropriate.

Examples:

- Existing high-cost debt
- Recent repayment bounce
- Severe affordability shortfall
- Stress test showing insufficient repayment headroom

---

## 11. Requested amount is not automatically the recommendation

The application should compare:

```text
Requested amount
       ↓
Safe amount
Stretch amount
Potential lender amount
       ↓
Explain trade-off
```

The borrower remains the decision-maker. The app provides decision support, not approval.

---

## 12. Lender-side amount vs borrower-side amount

The product should distinguish:

- **Borrower-safe amount:** amount calculated from affordability rules.
- **Stretch amount:** higher amount with less financial headroom.
- **Likely lender amount:** separate estimate of what a lender might potentially sanction.

The lender-side number must never be presented as guaranteed approval.

---

## 13. Stress test

### Current scenario

```text
Income stress = -20%
```

Example:

```text
Current income = ₹1,10,000
Stress income = ₹88,000
```

| What | Value | Why | Source |
|---|---:|---|---|
| Income stress | -20% | Simple resilience scenario. | My judgement |
| Stress result | Informational | Not a forecast of actual future income. | Product limitation |

---

## 14. APR and all-in cost

RBI's KFS framework defines APR as the annual cost of credit including interest and other charges associated with the credit facility. RBI's KFS framework also requires an APR computation sheet and amortisation schedule for applicable loans. [RBI KFS source](https://www.rbi.org.in/)

Therefore the final product should compare lender offers using more than the advertised interest rate:

```text
Interest rate
+ processing fee
+ applicable third-party charges
+ other applicable charges
= all-in borrowing cost / APR
```

The current prototype does not yet have enough lender-specific fee inputs to calculate a complete lender-comparable APR. Any prototype APR must therefore be labelled **Estimated APR** and list its assumptions.

---

## 15. Processing fees

| What | Value | Why | Source |
|---|---:|---|---|
| Processing fee | Lender/product-specific | Fees differ by lender and product. | Product limitation |
| Prototype fee | Only if explicitly configured | Needed for an illustrative APR calculation. | My judgement |
| Hidden fee | Not assumed | Borrower should ask for all applicable charges. | Product principle |

The Negotiation Card asks:

```text
What is the processing fee?
What is the actual APR?
Are mandatory insurance or third-party charges included?
```

---

## 16. Penal charges

RBI guidance states that applicable penal charges should be treated as penal charges rather than additional penal interest, should not be capitalised, and should be reasonable and disclosed. See:

- [RBI Fair Lending Practice — Penal Charges](https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=12827)
- [RBI FAQ — Penal Charges](https://www.rbi.org.in/scripts/FAQView.aspx?Id=162)

The app therefore encourages borrowers to ask:

```text
What are the penal charges?
When do they apply?
Are they disclosed in the KFS/loan agreement?
```

The prototype does not assume a universal penal-charge percentage.

---

## 17. Prepayment / foreclosure

Prepayment rules depend on the loan type, rate type, lender and applicable RBI rules.

The app should not claim that prepayment is always free.

Instead, the Negotiation Card asks:

```text
What are the foreclosure/prepayment charges?
```

Specific statements should be based on current RBI rules and the lender/product terms applicable to the actual offer.

---

## 18. Product routing

The application should not treat every borrower as a generic personal-loan applicant.

Examples:

### Salaried + personal purpose

Evaluate primarily as a personal-loan scenario.

### Self-employed + productive business purpose + collateral

Consider a secured business/property-backed route.

### Informal income + existing high-cost debt + recent bounce

Prioritise borrowing caution and debt stabilisation rather than simply finding another loan.

These are product-routing judgements, not guarantees of eligibility.

---

## 19. Confidence

### High confidence

Important inputs are known:

- Exact income
- Existing EMI
- Expenses
- Credit score
- Stable income type

### Medium confidence

Some important information is missing or approximate.

### Low confidence

Several important inputs are unknown or highly variable.

The application should respond to uncertainty by widening ranges rather than inventing precision.

---

## 20. Question design

Every additional question must change at least one output.

| Question | Output affected |
|---|---|
| Monthly income | Safe EMI, stretch EMI, loan amount |
| Existing EMI | Safe EMI, stretch EMI, loan amount |
| Household expenses | Safe EMI, stress capacity |
| Credit score | Fair rate, loan amount, confidence |
| Income type | Fair rate, income treatment, confidence |
| Income stability | Risk, confidence, safe capacity |
| Existing high-cost loans | Verdict, risk |
| Recent EMI bounce | Verdict, risk |
| Collateral value | Product routing / lender-side route |
| Loan purpose | Product routing and borrow/don't-borrow reasoning |

Questions that do not change an output should be removed.

---

## 21. Adaptive questioning

### Salaried

Potential additional questions:

- Employment tenure
- Income stability
- Variable-income share
- Existing debt details

### Self-employed

Potential additional questions:

- Business history
- Documented income
- Income variability
- Business purpose
- Collateral

### Informal / variable income

Potential additional questions:

- Income range
- Income stability
- Existing high-cost loans
- Recent repayment problems
- Emergency savings

---

## 22. Why the rules are conservative

Borrower Copilot is not trying to maximise the amount a borrower can obtain.

The objective is:

```text
Maximum lender eligibility
        !=
Maximum borrower welfare
```

The system therefore prefers:

- Conservative affordability
- Higher-end rate for safe-capacity calculations
- Wider ranges when information is missing
- Explicit stress testing
- Borrow-less recommendations
- Don't-borrow recommendations where appropriate

---

## 23. Known limitations

The prototype does not know:

- Actual lender underwriting policies
- Verified income
- Bank statement behaviour
- Full credit history
- Existing loan terms unless provided
- Exact processing fees
- Exact insurance charges
- Exact lender APR
- Lender-specific collateral valuation
- Product-specific eligibility criteria

No output should be interpreted as a guaranteed sanction, approval, interest rate or financial recommendation.

---

## 24. RBI-backed vs My judgement

### RBI / regulatory basis

The following concepts are grounded in RBI guidance:

- KFS helps borrowers understand loan terms.
- APR represents annual cost of credit including interest and applicable charges.
- Applicable KFS frameworks include APR computation and repayment schedules.
- Fees and charges should be transparently disclosed.
- Penal charges should be disclosed and should not be structured as additional penal interest under the applicable framework.

Primary references:

1. RBI — Key Facts Statement / APR framework  
   https://www.rbi.org.in/

2. RBI — Fair Lending Practice / Penal Charges  
   https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=12827

3. RBI — Fair Practices Code / loan charge transparency  
   https://www.rbi.org.in/Scripts/BS_ViewMasCirculardetails.aspx?id=8135

### My product judgement

These are prototype decisions, not RBI rules:

- 40% safe FOIR
- 50% stretch FOIR
- 15% safe buffer
- 5% stretch buffer
- 20% income stress
- 4-year assessment tenure
- Prototype fair-rate bands
- Credit-score adjustments
- Income-type adjustments
- Upper end of rate band for safe-capacity calculation
- Borrow / Borrow Less / Don't Borrow thresholds

These values can be changed during testing or the follow-up interview.

---

## 25. Rule-change test

The system is designed so an interviewer can change an assumption.

Example:

> Change safe FOIR from 40% to 35%.

The application should automatically recalculate:

```text
Safe total EMI
↓
Safe new EMI
↓
Safe loan amount
↓
Requested amount comparison
↓
Verdict
```

The calculation logic should therefore remain separated from the UI as the project grows.

---

## 26. Final principle

Borrower Copilot should answer:

> **"What does this loan mean for me?"**

not simply:

> **"How much loan can I get?"**

The borrower should leave knowing:

```text
What I asked for
What I can safely carry
What I could stretch to
What a lender may potentially offer
What rate I should question
What EMI I should not casually cross
What happens under stress
What questions I should ask the lender
```

That is the core purpose of Borrower Copilot.
