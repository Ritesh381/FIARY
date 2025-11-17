import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, IndianRupee, PieChart } from "lucide-react";

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-3 md:p-4 shadow-xl border border-white/10 ${className}`}
  >
    {children}
  </div>
);

const formatAmount = (amount) => {
  if (amount && typeof amount === "object" && amount.$numberDecimal) {
    return parseFloat(amount.$numberDecimal).toFixed(2);
  }
  if (typeof amount === "string" || typeof amount === "number") {
    return parseFloat(amount).toFixed(2);
  }
  return "0.00";
};

export default function FinanceStats({ entries, currentDate }) {
  const stats = useMemo(() => {
    // Filter entries for current month
    const currentMonthEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.when);
      return (
        entryDate.getMonth() === currentDate.getMonth() &&
        entryDate.getFullYear() === currentDate.getFullYear()
      );
    });

    // Filter entries for previous month for comparison
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevMonthEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.when);
      return (
        entryDate.getMonth() === prevMonth.getMonth() &&
        entryDate.getFullYear() === prevMonth.getFullYear()
      );
    });

    // Calculate current month totals
    const totals = currentMonthEntries.reduce(
      (acc, entry) => {
        const amount = parseFloat(formatAmount(entry.amount));
        if (entry.type === "Income") {
          acc.totalIncome += amount;
          acc.incomeCount++;
        } else {
          acc.totalExpense += amount;
          acc.expenseCount++;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, incomeCount: 0, expenseCount: 0 }
    );

    // Calculate previous month totals for comparison
    const prevTotals = prevMonthEntries.reduce(
      (acc, entry) => {
        const amount = parseFloat(formatAmount(entry.amount));
        if (entry.type === "Income") {
          acc.prevIncome += amount;
        } else {
          acc.prevExpense += amount;
        }
        return acc;
      },
      { prevIncome: 0, prevExpense: 0 }
    );

    // Calculate trends
    const incomeChange = prevTotals.prevIncome > 0 
      ? ((totals.totalIncome - prevTotals.prevIncome) / prevTotals.prevIncome) * 100
      : 0;
    const expenseChange = prevTotals.prevExpense > 0
      ? ((totals.totalExpense - prevTotals.prevExpense) / prevTotals.prevExpense) * 100
      : 0;

    // Calculate category breakdown with enhanced metrics
    const categoryBreakdown = currentMonthEntries.reduce((acc, entry) => {
      const category = entry.category_name || "Uncategorized";
      const amount = parseFloat(formatAmount(entry.amount));
      
      if (!acc[category]) {
        acc[category] = { income: 0, expense: 0, total: 0, transactions: 0 };
      }
      
      if (entry.type === "Income") {
        acc[category].income += amount;
      } else {
        acc[category].expense += amount;
      }
      acc[category].total += amount;
      acc[category].transactions++;
      
      return acc;
    }, {});

    // Get top expense categories for spending insights
    const topExpenseCategories = Object.entries(categoryBreakdown)
      .filter(([, data]) => data.expense > 0)
      .sort(([, a], [, b]) => b.expense - a.expense)
      .slice(0, 5);

    // Get top income categories
    const topIncomeCategories = Object.entries(categoryBreakdown)
      .filter(([, data]) => data.income > 0)
      .sort(([, a], [, b]) => b.income - a.income)
      .slice(0, 3);

    // Calculate spending distribution
    const expenseDistribution = topExpenseCategories.map(([category, data]) => ({
      category,
      amount: data.expense,
      percentage: totals.totalExpense > 0 ? (data.expense / totals.totalExpense) * 100 : 0
    }));

    // Financial health metrics
    const netBalance = totals.totalIncome - totals.totalExpense;
    const savingsRate = totals.totalIncome > 0 
      ? ((netBalance / totals.totalIncome) * 100).toFixed(1)
      : 0;
    
    const expenseRatio = totals.totalIncome > 0 
      ? (totals.totalExpense / totals.totalIncome) * 100
      : 0;

    // Daily averages
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const currentDay = currentDate.getDate();
    const dailyExpenseAvg = totals.totalExpense / currentDay;
    const dailyIncomeAvg = totals.totalIncome / currentDay;

    // Projected monthly totals
    const projectedExpense = dailyExpenseAvg * daysInMonth;
    const projectedIncome = dailyIncomeAvg * daysInMonth;

    return {
      ...totals,
      ...prevTotals,
      netBalance,
      savingsRate,
      expenseRatio,
      incomeChange,
      expenseChange,
      topExpenseCategories,
      topIncomeCategories,
      expenseDistribution,
      transactionCount: currentMonthEntries.length,
      dailyExpenseAvg,
      dailyIncomeAvg,
      projectedExpense,
      projectedIncome,
      daysInMonth,
      currentDay
    };
  }, [entries, currentDate]);

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">
        📊 Financial Statistics - {monthName}
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Income */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-gray-400 mb-1">Total Income</p>
              <p className="text-lg md:text-2xl font-bold text-green-400">
                ₹{stats.totalIncome.toFixed(0)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-xs text-gray-500">
                  {stats.incomeCount} transactions
                </p>
                {stats.incomeChange !== 0 && (
                  <span className={`text-xs font-medium ${
                    stats.incomeChange > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stats.incomeChange > 0 ? '+' : ''}{stats.incomeChange.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <TrendingUp className="text-green-400 flex-shrink-0" size={24} />
          </div>
        </GlassCard>

        {/* Total Expense */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-gray-400 mb-1">Total Expense</p>
              <p className="text-lg md:text-2xl font-bold text-red-400">
                ₹{stats.totalExpense.toFixed(0)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-xs text-gray-500">
                  {stats.expenseCount} transactions
                </p>
                {stats.expenseChange !== 0 && (
                  <span className={`text-xs font-medium ${
                    stats.expenseChange > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {stats.expenseChange > 0 ? '+' : ''}{stats.expenseChange.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <TrendingDown className="text-red-400 flex-shrink-0" size={24} />
          </div>
        </GlassCard>

        {/* Net Balance */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-gray-400 mb-1">Net Balance</p>
              <p
                className={`text-lg md:text-2xl font-bold ${
                  stats.netBalance >= 0 ? "text-blue-400" : "text-orange-400"
                }`}
              >
                ₹{stats.netBalance.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.transactionCount} total entries
              </p>
            </div>
            <IndianRupee
              className={`flex-shrink-0 ${
                stats.netBalance >= 0 ? "text-blue-400" : "text-orange-400"
              }`}
              size={24}
            />
          </div>
        </GlassCard>

        {/* Savings Rate */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-gray-400 mb-1">Savings Rate</p>
              <p className="text-lg md:text-2xl font-bold text-purple-400">
                {stats.savingsRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                of total income
              </p>
            </div>
            <PieChart className="text-purple-400 flex-shrink-0" size={24} />
          </div>
        </GlassCard>
      </div>

      {/* Detailed Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 ">
        {/* Top Expense Categories */}
        <GlassCard>
          <h2 className="text-lg md:text-xl font-bold text-white mb-4">
            💸 Top Spending Categories
          </h2>
          {stats.topExpenseCategories.length === 0 ? (
            <p className="text-gray-400 italic text-sm">No expenses this month</p>
          ) : (
            <div className="space-y-3  overflow-y-auto max-h-150">
              {stats.topExpenseCategories.map(([category, data]) => {
                const percentage = stats.totalExpense > 0 ? (data.expense / stats.totalExpense) * 100 : 0;
                return (
                  <div key={category} className="bg-gray-800/30 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-white text-sm md:text-base truncate">{category}</h3>
                      <div className="text-right">
                        <span className="text-sm md:text-lg font-bold text-red-400">
                          ₹{data.expense.toFixed(0)}
                        </span>
                        <p className="text-xs text-gray-400">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm mb-2">
                      <span className="text-gray-400">
                        {data.transactions} transactions
                      </span>
                      <span className="text-gray-400">
                        Avg: ₹{(data.expense / data.transactions).toFixed(0)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Income Sources */}
        <GlassCard>
          <h2 className="text-lg md:text-xl font-bold text-white mb-4">
            💰 Income Sources
          </h2>
          {stats.topIncomeCategories.length === 0 ? (
            <p className="text-gray-400 italic text-sm">No income this month</p>
          ) : (
            <div className="space-y-3">
              {stats.topIncomeCategories.map(([category, data]) => {
                const percentage = stats.totalIncome > 0 ? (data.income / stats.totalIncome) * 100 : 0;
                return (
                  <div key={category} className="bg-gray-800/30 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-white text-sm md:text-base truncate">{category}</h3>
                      <div className="text-right">
                        <span className="text-sm md:text-lg font-bold text-green-400">
                          ₹{data.income.toFixed(0)}
                        </span>
                        <p className="text-xs text-gray-400">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm mb-2">
                      <span className="text-gray-400">
                        {data.transactions} transactions
                      </span>
                      <span className="text-gray-400">
                        Avg: ₹{(data.income / data.transactions).toFixed(0)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Financial Health & Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Projections */}
        <GlassCard>
          <h2 className="text-lg md:text-xl font-bold text-white mb-4">
            📈 Monthly Projections
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-800/30 rounded-lg p-3">
              <p className="text-sm text-gray-400 mb-1">Days passed: {stats.currentDay}/{stats.daysInMonth}</p>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${(stats.currentDay / stats.daysInMonth) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Projected Income</p>
                  <p className="text-lg font-bold text-green-400">₹{stats.projectedIncome.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">Daily avg: ₹{stats.dailyIncomeAvg.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Projected Expense</p>
                  <p className="text-lg font-bold text-red-400">₹{stats.projectedExpense.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">Daily avg: ₹{stats.dailyExpenseAvg.toFixed(0)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-3">
              <p className="text-sm text-gray-400 mb-1">Projected Net Balance</p>
              <p className={`text-xl font-bold ${
                (stats.projectedIncome - stats.projectedExpense) >= 0 ? 'text-blue-400' : 'text-orange-400'
              }`}>
                ₹{(stats.projectedIncome - stats.projectedExpense).toFixed(0)}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Financial Health Score */}
        <GlassCard>
          <h2 className="text-lg md:text-xl font-bold text-white mb-4">
            🎯 Financial Health
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Expense Ratio</span>
                <span className={`text-lg font-bold ${
                  stats.expenseRatio < 70 ? 'text-green-400' :
                  stats.expenseRatio < 90 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {stats.expenseRatio.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    stats.expenseRatio < 70 ? 'bg-green-500' :
                    stats.expenseRatio < 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(stats.expenseRatio, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.expenseRatio < 70 ? 'Excellent control' :
                 stats.expenseRatio < 90 ? 'Good management' : 'Need attention'}
              </p>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Savings Goal</span>
                <span className={`text-lg font-bold ${
                  parseFloat(stats.savingsRate) >= 20 ? 'text-green-400' :
                  parseFloat(stats.savingsRate) >= 10 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {stats.savingsRate}%
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    parseFloat(stats.savingsRate) >= 20 ? 'bg-green-500' :
                    parseFloat(stats.savingsRate) >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(Math.abs(parseFloat(stats.savingsRate)), 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Target: 20% | Current: {stats.savingsRate}%
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Avg Income/Day</p>
                <p className="text-sm font-bold text-green-400">₹{stats.dailyIncomeAvg.toFixed(0)}</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Avg Expense/Day</p>
                <p className="text-sm font-bold text-red-400">₹{stats.dailyExpenseAvg.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
