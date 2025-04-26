import os
from typing import Dict, List, Tuple
from openai import OpenAI
from dotenv import load_dotenv
import json

class FinancialIntentAnalyzer:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # Initialize OpenAI client with just the API key
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            # Remove any proxy settings that might be causing issues
            # proxies=None  # Commented out as it's causing issues
        )
    
    def extract_financial_intents(self, text: str) -> Dict:
        """
        Extract financial intents from the given text using GPT.
        """
        prompt = f"""
        Analyze the following text and identify all financial-related intents, concerns, and topics.
        Pay special attention to:
        1. Direct financial actions that will require spending money, such as:
           - Hiring new staff (e.g., "Hiring 2 operations team members and 1 junior accountant")
           - Purchasing equipment (e.g., "Buying new office computers")
           - Marketing initiatives (e.g., "Launching new marketing campaign")
           - Operational expenses (e.g., "Increasing monthly operational budget")
           - Capital investments (e.g., "Investing in new production equipment")
           - Contract-based hires (e.g., "Hiring temporary contractors")
           - Supplier payments (e.g., "Paying increased supplier costs")
           - Legal actions (e.g., "Initiating legal collection process")
           - Any other expenditures

        2. Financial commitments and obligations:
           - Loan applications (e.g., "Applying for RM250,000 working capital loan")
           - Credit lines (e.g., "Setting up new credit line with bank")
           - Grant applications (e.g., "Applying for government SME grant")
           - Payment schedules (e.g., "Scheduling payments for outstanding invoices")
           - Contractual obligations (e.g., "Renewing vendor contracts")
           - Salary commitments (e.g., "Committing to new staff salaries")
           - Vendor agreements (e.g., "Signing new supplier agreement")

        3. Revenue-related intents:
           - Sales targets (e.g., "Aiming for RM500,000 in Q2 sales")
           - Collection efforts (e.g., "Collecting RM180,000 in overdue payments")
           - Payment follow-ups (e.g., "Following up with clients on late payments")
           - Revenue generation plans (e.g., "Launching new product line for revenue")
           - Pricing changes (e.g., "Increasing product prices by 12%")
           - Product launches (e.g., "Launching new product in Southeast Asia")

        For each intent, use clear, specific language that describes the exact action or situation.
        Avoid vague terms like "staffing" - instead use specific descriptions like "Hiring 2 operations team members".
        
        Also identify:
        1. Alerts: Critical issues that need immediate attention (e.g., "Critical cash flow shortage expected by June")
        2. Suggestions: Recommendations for improvement (e.g., "Consider renegotiating supplier contracts to reduce costs")

        Text: {text}
        
        Return the analysis in JSON format with the following structure:
        {{
            "detected_intents": [
                {{
                    "description": "Specific, clear description of the financial intent",
                    "urgency_level": "low/medium/high",
                    "urgency_score": 0.0 to 1.0,
                    "timeline": "when this needs to be addressed",
                    "impact": "description of financial impact"
                }}
            ],
            "confidence_score": 0.0,
            "relevant_details": "any specific details mentioned",
            "financial_topics": ["list", "of", "all", "financial", "topics", "discussed"],
            "action_items": ["list", "of", "any", "financial", "actions", "needed"],
            "expenditures": [
                {{
                    "type": "type of expenditure",
                    "amount": "amount or range if specified",
                    "timeline": "when it will occur",
                    "description": "details about the expenditure"
                }}
            ],
            "revenue_actions": [
                {{
                    "type": "type of revenue action",
                    "target": "target amount or goal",
                    "timeline": "expected timeline",
                    "description": "details about the action"
                }}
            ],
            "alerts": [
                {{
                    "message": "description of the alert",
                    "severity": "low/medium/high",
                    "impact": "potential impact if not addressed",
                    "recommendation": "suggestion for addressing the alert"
                }}
            ],
            "suggestions": [
                {{
                    "message": "description of the suggestion",
                    "benefit": "expected benefit if implemented",
                    "implementation": "how to implement this suggestion",
                    "priority": "low/medium/high"
                }}
            ]
        }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a financial intent analyzer. Use specific, clear language to describe financial intents. Include urgency levels and identify both alerts and suggestions. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )
            
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return {
                "detected_intents": [],
                "confidence_score": 0.0,
                "relevant_details": f"Error: {str(e)}",
                "financial_topics": [],
                "action_items": [],
                "expenditures": [],
                "revenue_actions": [],
                "alerts": [],
                "suggestions": []
            }
    
    def analyze_financial_text(self, text: str) -> Dict:
        """
        Combined analysis of financial intents and insights.
        """
        analysis = self.extract_financial_intents(text)
        
        return {
            "financial_intents": analysis,
            "summary": {
                "total_intents": len(analysis.get("detected_intents", [])),
                "high_urgency_intents": len([i for i in analysis.get("detected_intents", []) if i.get("urgency_level") == "high"]),
                "total_alerts": len(analysis.get("alerts", [])),
                "total_suggestions": len(analysis.get("suggestions", [])),
                "overall_urgency": "high" if any(i.get("urgency_level") == "high" for i in analysis.get("detected_intents", [])) else "medium" if any(i.get("urgency_level") == "medium" for i in analysis.get("detected_intents", [])) else "low"
            }
        }

def main():
    # Example usage
    analyzer = FinancialIntentAnalyzer()
    
    # Example text
    example_text = """
    So during today's leadership meeting, the CFO brought up some concerns about our current cash flow situation.
    We're seeing delays in collections from Q1, with about RM180,000 still outstanding past 30 days.
    Most of that is tied up with two major clients, and if we don't receive payment by mid-May, the finance team may need to escalate things through legal.
    It's starting to affect our liquidity and could impact short-term operations if it continues.
    Looking ahead at Q2, the monthly burn rate is now hovering around RM120,000. If the new product line doesn't start generating consistent revenue in the next month or so, we might hit a shortfall by late June.
    To mitigate that, there was a suggestion to pause a couple of marketing initiatives and delay some non-critical spending until we have better visibility on incoming revenue.
    Everyone agreed to take a more conservative approach for the next 4 to 6 weeks.
    On the HR side, we're feeling the strain of being short-staffed. There's a need to hire two operations team members and one junior accountant to handle the growing workload.
    The CEO gave the green light to proceed with recruitment, but reminded the team to stay within the adjusted hiring budget. Any contract-based hires will need a quick cost-benefit review before moving forward.
    Operations also raised a red flag about rising supplier costs. One of our core vendors increased raw material prices by 12%, which is going to squeeze margins unless we renegotiate.
    The CEO offered to personally step in on the next call with suppliers to try and lock in a better long-term deal or at least explore some competitive alternatives.
    Lastly, we're actively exploring financing options to give ourselves more breathing room. Finance is preparing an application for a working capital credit line—targeting RM250,000—and we're also looking into a government SME grant that could help offset some upcoming payroll expenses. The plan is to have everything submitted by the end of next week so we can move quickly if approvals come through.
    """
    
    # Analyze the text
    results = analyzer.analyze_financial_text(example_text)
    print("Analysis Results:")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main() 