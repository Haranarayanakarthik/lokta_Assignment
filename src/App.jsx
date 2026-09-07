import { useState } from "react";

// --------------------------------
// LOAN CALCULATION FUNCTIONS
// --------------------------------

function calculateEMI(principal, annualRate, tenureYears) {
  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;

  if (monthlyRate === 0) {
    return principal / months;
  }

  const factor = Math.pow(1 + monthlyRate, months);

  return (principal * monthlyRate * factor) / (factor - 1);
}

function calculateLoanFromEMI(emi, annualRate, tenureYears) {
  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;

  if (monthlyRate === 0) {
    return emi * months;
  }

  const factor = Math.pow(1 + monthlyRate, months);

  return emi * ((factor - 1) / (monthlyRate * factor));
}

// --------------------------------
// FAIR RATE CALCULATION
// --------------------------------

function getFairRateBand(form) {
  let low = 13;
  let high = 18;

  const score = Number(form.creditScore);

  // Strong credit profile
  if (!form.unknownCredit && score >= 750) {
    low -= 2;
    high -= 2;
  }

  // Good credit profile
  else if (!form.unknownCredit && score >= 700) {
    low -= 1;
    high -= 1;
  }

  // Unknown credit score
  if (form.unknownCredit) {
    low += 1;
    high += 2;
  }

  // Income type adjustment
  if (form.incomeType === "Salaried") {
    low -= 1;
  }

  if (form.incomeType === "Informal") {
    high += 3;
  }

  return {
    low: Math.max(low, 8),
    high: Math.max(high, low + 1),
  };
}

function App() {
  const [started, setStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [form, setForm] = useState({
    loanType: "Personal",
    amount: "",
    incomeType: "Salaried",
    income: "",
    existingEmi: "",
    expenses: "",
    age: "",
    creditScore: "",
    unknownCredit: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectIncomeType = (type) => {
    setForm((prev) => ({
      ...prev,
      incomeType: type,
    }));
  };

  const handleUnknownCredit = () => {
    setForm((prev) => ({
      ...prev,
      unknownCredit: !prev.unknownCredit,
      creditScore: "",
    }));
  };

  const calculateResults = () => {
    setShowResults(true);
  };

  const resetApp = () => {
    setStarted(false);
    setShowResults(false);
  };

  // --------------------------------
  // LANDING SCREEN
  // --------------------------------

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-slate-800 text-slate-300 text-sm">
            Borrower Copilot
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Know your numbers
            <br />
            before you meet a lender.
          </h1>

          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
            Estimated fair-rate range based on your income type and credit
            information. Actual lender pricing may differ.
          </p>

          <button
            onClick={() => setStarted(true)}
            className="mt-10 px-8 py-4 rounded-xl bg-white text-slate-950 font-semibold hover:bg-slate-200 transition"
          >
            Check my borrowing →
          </button>

          <p className="mt-5 text-sm text-slate-500">
            No login · No credit bureau pull · Nothing stored
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------
  // RESULTS SCREEN
  // --------------------------------

  if (showResults) {
    const income = Number(form.income) || 0;
    const existingEmi = Number(form.existingEmi) || 0;
    const expenses = Number(form.expenses) || 0;
    const requested = Number(form.amount) || 0;

    // Temporary V1 calculations.
    // We will improve these rules later.
    // --------------------------------
    // --------------------------------
    // AFFORDABILITY
    // --------------------------------

    const SAFE_FOIR = 0.4;
    const STRETCH_FOIR = 0.5;

    const SAFE_BUFFER = 0.15;
    const STRETCH_BUFFER = 0.05;

    const safeTotalEmi = income * SAFE_FOIR;
    const stretchTotalEmi = income * STRETCH_FOIR;

    const safeNewEmi = Math.max(0, safeTotalEmi - existingEmi);

    const stretchNewEmi = Math.max(0, stretchTotalEmi - existingEmi);

    // --------------------------------
    // EXPENSE CHECK
    // --------------------------------

    const disposableIncome = income - expenses - existingEmi;

    const safeBufferAmount = income * SAFE_BUFFER;

    const stretchBufferAmount = income * STRETCH_BUFFER;

    const expenseBasedSafeEmi = Math.max(
      0,
      disposableIncome - safeBufferAmount,
    );

    const expenseBasedStretchEmi = Math.max(
      0,
      disposableIncome - stretchBufferAmount,
    );

    // --------------------------------
    // FINAL EMI
    // --------------------------------

    const finalSafeEmi = Math.min(safeNewEmi, expenseBasedSafeEmi);

    const finalStretchEmi = Math.min(stretchNewEmi, expenseBasedStretchEmi);

    // --------------------------------
    // FAIR RATE
    // --------------------------------

    const rateBand = getFairRateBand(form);

    const calculationRate = rateBand.high;

    // --------------------------------
    // TENURE
    // --------------------------------

    const assessmentTenure = 4;

    // --------------------------------
    // LOAN AMOUNT
    // --------------------------------

    const safeLoanAmount = calculateLoanFromEMI(
      finalSafeEmi,
      calculationRate,
      assessmentTenure,
    );

    const stretchLoanAmount = calculateLoanFromEMI(
      finalStretchEmi,
      calculationRate,
      assessmentTenure,
    );

    // --------------------------------
    // VERDICT
    // --------------------------------

    let verdict;

    if (requested <= 0) {
      verdict = "CHECK YOUR AMOUNT";
    } else if (requested <= safeLoanAmount) {
      verdict = "BORROW";
    } else if (requested <= stretchLoanAmount) {
      verdict = "BORROW LESS";
    } else {
      verdict = "DON'T BORROW";
    }

    return (
      <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}

          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-sm text-slate-400">Borrower Copilot</p>

              <h1 className="text-2xl font-bold">Your borrowing position</h1>
            </div>

            <button
              onClick={resetApp}
              className="text-sm text-slate-400 hover:text-white"
            >
              Start over
            </button>
          </div>

          {/* VERDICT */}

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 mb-6">
            <p className="text-sm text-slate-400">Our assessment</p>

            <h2 className="text-4xl font-bold mt-2">{verdict}</h2>

            <p className="mt-4 text-slate-300">
              You requested ₹{requested.toLocaleString("en-IN")}. We compare
              that with what you may be able to safely carry rather than simply
              telling you what a lender might approve.
            </p>
          </div>

          {/* AMOUNT COMPARISON */}

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <p className="text-sm text-slate-400">Safer amount</p>

              <p className="text-3xl font-bold mt-2">
                ₹{Math.round(safeLoanAmount).toLocaleString("en-IN")}
              </p>

              <p className="text-sm text-slate-400 mt-3">
                What we estimate you can carry with more financial room.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <p className="text-sm text-slate-400">Stretch amount</p>

              <p className="text-3xl font-bold mt-2">
                ₹{Math.round(stretchNewEmi * 48).toLocaleString("en-IN")}
              </p>

              <p className="text-sm text-slate-400 mt-3">
                Possible, but with less room for unexpected expenses.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <p className="text-sm text-slate-400">You requested</p>

              <p className="text-3xl font-bold mt-2">
                ₹{requested.toLocaleString("en-IN")}
              </p>

              <p className="text-sm text-slate-400 mt-3">
                Compare this against the safer and stretch ranges.
              </p>
            </div>
          </div>

          {/* EMI + RATE */}

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
              <p className="text-sm text-slate-400">EMI ceiling</p>

              <p className="text-3xl font-bold mt-2">
                ₹{Math.round(finalSafeEmi).toLocaleString("en-IN")}
              </p>

              <p className="text-sm text-slate-400 mt-3">
                We keep your total EMI around 40% of income and also consider
                your reported expenses.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
              <p className="text-sm text-slate-400">Fair interest rate</p>

              <p className="text-3xl font-bold mt-2">
                {rateBand.low}% – {rateBand.high}%
              </p>

              <p className="text-sm text-slate-400 mt-3">
                Indicative range for this prototype. Final pricing depends on
                the lender and product.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex justify-between">
              <span>Assessment tenure</span>
              <span className="text-white">{assessmentTenure} years</span>
            </div>

            <div className="flex justify-between">
              <span>Calculation rate</span>
              <span className="text-white">{calculationRate}%</span>
            </div>

            <div className="flex justify-between">
              <span>Safe FOIR limit</span>
              <span className="text-white">40%</span>
            </div>
          </div>

          {/* STRESS TEST */}

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 mb-6">
            <p className="text-sm text-slate-400">Stress test</p>

            <h3 className="text-xl font-semibold mt-2">
              What if your income drops by 20%?
            </h3>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm text-slate-400">Current income</p>

                <p className="text-xl font-semibold mt-1">
                  ₹{income.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm text-slate-400">Stress income</p>

                <p className="text-xl font-semibold mt-1">
                  ₹{Math.round(income * 0.8).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* NEGOTIATION CARD */}

          <div className="rounded-2xl bg-white text-slate-950 p-6">
            <p className="text-sm font-medium text-slate-500">
              NEGOTIATION CARD
            </p>

            <h2 className="text-2xl font-bold mt-2">
              Take this with you to the lender
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <p className="text-sm text-slate-500">Amount requested</p>

                <p className="text-xl font-bold">
                  ₹{requested.toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Safer amount</p>

                <p className="text-xl font-bold">
                  ₹{Math.round(stretchLoanAmount).toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">EMI ceiling</p>

                <p className="text-xl font-bold">
                  ₹{Math.round(finalSafeEmi).toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Fair rate</p>

                <p className="text-xl font-bold">
                  {rateBand.low}% – {rateBand.high}%
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="font-semibold">When negotiating, ask:</p>

              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>• What is the actual APR?</li>
                <li>• What is the processing fee?</li>
                <li>• Is insurance mandatory?</li>
                <li>• What are the foreclosure charges?</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------
  // QUESTION SCREEN
  // --------------------------------

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}

        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400">
            <span>About you</span>
            <span>Core questions</span>
          </div>

          <div className="h-1 bg-slate-800 rounded-full mt-3">
            <div className="h-1 bg-white rounded-full w-1/2" />
          </div>
        </div>

        <h1 className="text-3xl font-bold">Let's understand your position.</h1>

        <p className="text-slate-400 mt-2 mb-8">
          Answer what you know. You don't need a credit bureau report or any
          documents.
        </p>

        {/* LOAN TYPE */}

        <div className="mb-6">
          <label className="block text-sm text-slate-300 mb-2">
            What type of loan are you considering?
          </label>

          <select
            name="loanType"
            value={form.loanType}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
          >
            <option>Personal</option>
            <option>Business</option>
            <option>Vehicle</option>
            <option>Home</option>
            <option>Loan Against Property</option>
            <option>Gold</option>
          </select>
        </div>

        {/* AMOUNT */}

        <div className="mb-6">
          <label className="block text-sm text-slate-300 mb-2">
            How much do you want to borrow?
          </label>

          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="₹ 8,00,000"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
          />
        </div>

        {/* INCOME TYPE */}

        <div className="mb-6">
          <label className="block text-sm text-slate-300 mb-3">
            How do you earn your income?
          </label>

          <div className="grid grid-cols-3 gap-2">
            {["Salaried", "Self-employed", "Informal"].map((type) => (
              <button
                key={type}
                onClick={() => selectIncomeType(type)}
                className={`p-3 rounded-xl border text-sm ${
                  form.incomeType === type
                    ? "bg-white text-slate-950 border-white"
                    : "bg-slate-900 border-slate-700 text-slate-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* INCOME */}

        <div className="mb-6">
          <label className="block text-sm text-slate-300 mb-2">
            Net monthly income
          </label>

          <input
            type="number"
            name="income"
            value={form.income}
            onChange={handleChange}
            placeholder="₹ 1,10,000"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
          />
        </div>

        {/* EXISTING EMI */}

        <div className="mb-6">
          <label className="block text-sm text-slate-300 mb-2">
            Existing monthly EMIs
          </label>

          <input
            type="number"
            name="existingEmi"
            value={form.existingEmi}
            onChange={handleChange}
            placeholder="₹ 14,000"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
          />
        </div>

        {/* EXPENSES */}

        <div className="mb-6">
          <label className="block text-sm text-slate-300 mb-2">
            Monthly household expenses
          </label>

          <input
            type="number"
            name="expenses"
            value={form.expenses}
            onChange={handleChange}
            placeholder="₹ 30,000"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
          />
        </div>

        {/* AGE */}

        <div className="mb-6">
          <label className="block text-sm text-slate-300 mb-2">Your age</label>

          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            placeholder="29"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
          />
        </div>

        {/* CREDIT SCORE */}

        <div className="mb-8">
          <label className="block text-sm text-slate-300 mb-2">
            Credit score
          </label>

          {!form.unknownCredit && (
            <input
              type="number"
              name="creditScore"
              value={form.creditScore}
              onChange={handleChange}
              placeholder="780"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
            />
          )}

          <button
            onClick={handleUnknownCredit}
            className="mt-3 text-sm text-slate-400 hover:text-white"
          >
            {form.unknownCredit
              ? "I know my credit score"
              : "I don't know my credit score"}
          </button>
        </div>

        {/* SUBMIT */}

        <button
          onClick={calculateResults}
          className="w-full bg-white text-slate-950 py-4 rounded-xl font-semibold hover:bg-slate-200 transition"
        >
          Calculate my borrowing position →
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          Your answers are used only to calculate this assessment.
        </p>
      </div>
    </div>
  );
}

export default App;
