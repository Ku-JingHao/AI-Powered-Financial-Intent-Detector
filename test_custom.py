from financial_intent_analyzer import FinancialIntentAnalyzer

# Initialize the analyzer
analyzer = FinancialIntentAnalyzer()

# Example text from a company meeting
text = """
So during today’s leadership meeting, the CFO brought up some concerns about our current cash flow situation. We're seeing delays in collections from Q1, with about RM180,000 still outstanding past 30 days. Most of that is tied up with two major clients, and if we don’t receive payment by mid-May, the finance team may need to escalate things through legal. It’s starting to affect our liquidity and could impact short-term operations if it continues.

Looking ahead at Q2, the monthly burn rate is now hovering around RM120,000. If the new product line doesn’t start generating consistent revenue in the next month or so, we might hit a shortfall by late June. To mitigate that, there was a suggestion to pause a couple of marketing initiatives and delay some non-critical spending until we have better visibility on incoming revenue. Everyone agreed to take a more conservative approach for the next 4 to 6 weeks.

On the HR side, we’re feeling the strain of being short-staffed. There’s a need to hire two operations team members and one junior accountant to handle the growing workload. The CEO gave the green light to proceed with recruitment, but reminded the team to stay within the adjusted hiring budget. Any contract-based hires will need a quick cost-benefit review before moving forward.

Lastly, we’re actively exploring financing options to give ourselves more breathing room. Finance is preparing an application for a working capital credit line—targeting RM250,000—and we’re also looking into a government SME grant that could help offset some upcoming payroll expenses. The plan is to have everything submitted by the end of next week so we can move quickly if approvals come through.
"""

# Analyze the text
results = analyzer.analyze_financial_text(text)

# Print results in a more readable format
print("\nFinancial Intents:")
print("-" * 50)
for key, value in results["financial_intents"].items():
    print(f"{key}: {value}")

print("\nUrgency Analysis:")
print("-" * 50)
for key, value in results["urgency_analysis"].items():
    print(f"{key}: {value}") 