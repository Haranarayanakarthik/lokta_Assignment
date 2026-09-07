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
