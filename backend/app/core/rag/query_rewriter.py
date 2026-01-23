"""
Query Rewriter Tool

Rewrites user queries into focused, guideline-style queries for better RAG retrieval.
Implements the Query Rewriting strategy from the spec:
- Takes user question + profile + constraints
- Produces focused, guideline-style query for retrieval
"""

from typing import Optional, Dict, Any


class QueryRewriter:
    """
    Rewrites user queries for optimal guideline retrieval.
    
    As per spec example:
    - Input: "I work night shifts and can't afford a gym. What can I do for my blood pressure?"
    - Rewritten: "low-cost home-based physical activity options for adults with 
                  hypertension risk who work night shifts and live in unsafe neighborhoods"
    """

    def __init__(self):
        """Initialize the query rewriter."""
        # Keywords that suggest specific conditions
        self.condition_keywords = {
            "hypertension": ["blood pressure", "bp", "hypertension", "high pressure"],
            "diabetes": ["blood sugar", "glucose", "diabetes", "sugar levels", "insulin"],
            "general_ncd": ["heart", "cardiovascular", "stroke", "kidney"],
        }
        
        # Keywords that suggest specific topics
        self.topic_keywords = {
            "diet": ["eat", "food", "diet", "nutrition", "meal", "salt", "sugar", "vegetable"],
            "activity": ["exercise", "walk", "gym", "active", "movement", "physical"],
            "red_flags": ["emergency", "urgent", "dangerous", "warning", "symptom", "pain", "chest"],
            "sdoh": ["afford", "cost", "time", "work", "shift", "safety", "neighborhood"],
        }

    def detect_condition(self, query: str) -> Optional[str]:
        """Detect the health condition from the query."""
        query_lower = query.lower()
        
        for condition, keywords in self.condition_keywords.items():
            for keyword in keywords:
                if keyword in query_lower:
                    return condition
        
        return None

    def detect_topic(self, query: str) -> Optional[str]:
        """Detect the topic from the query."""
        query_lower = query.lower()
        
        for topic, keywords in self.topic_keywords.items():
            for keyword in keywords:
                if keyword in query_lower:
                    return topic
        
        return None

    def rewrite_query(
        self,
        query: str,
        profile: Optional[Dict[str, Any]] = None,
        constraints: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Rewrite a user query into a focused retrieval query.
        
        Args:
            query: Original user query
            profile: User health profile (age_band, risk factors, etc.)
            constraints: SDOH constraints (exercise_safety, income_band, etc.)
            
        Returns:
            Dictionary with:
            - rewritten_query: The enhanced query for retrieval
            - detected_condition: Detected health condition
            - detected_topic: Detected topic
            - filters: Suggested metadata filters
        """
        if profile is None:
            profile = {}
        if constraints is None:
            constraints = {}
        
        # Detect condition and topic
        detected_condition = self.detect_condition(query)
        detected_topic = self.detect_topic(query)
        
        # Build context from profile
        context_parts = []
        
        # Add age context
        if profile.get("age_band"):
            context_parts.append(f"adults aged {profile['age_band']}")
        else:
            context_parts.append("adults")
        
        # Add risk context
        if profile.get("risk_bands"):
            risk_bands = profile["risk_bands"]
            high_risk = [k for k, v in risk_bands.items() if v in ["high", "moderate"]]
            if high_risk:
                context_parts.append(f"with {', '.join(high_risk)} risk")
        
        # Add constraint context
        if constraints.get("exercise_safety") == "unsafe_at_night":
            context_parts.append("who cannot exercise at night due to safety")
        elif constraints.get("exercise_safety") == "unsafe":
            context_parts.append("with limited safe exercise options")
        
        if constraints.get("income_band") == "low":
            context_parts.append("with limited budget")
        
        if constraints.get("food_access") == "limited_fresh":
            context_parts.append("with limited access to fresh produce")
        
        if constraints.get("time_availability") == "limited":
            context_parts.append("with time constraints")
        
        # Build enhanced query
        context_str = " ".join(context_parts)
        
        # Clean and enhance the original query
        enhanced_parts = []
        
        # Add topic-specific prefix
        if detected_topic == "diet":
            enhanced_parts.append("dietary recommendations and nutrition guidelines")
        elif detected_topic == "activity":
            enhanced_parts.append("physical activity recommendations and exercise options")
        elif detected_topic == "red_flags":
            enhanced_parts.append("warning signs symptoms when to seek medical care")
        elif detected_topic == "sdoh":
            enhanced_parts.append("practical low-resource behavior change strategies")
        
        # Add condition context
        if detected_condition:
            enhanced_parts.append(f"for {detected_condition} prevention")
        
        # Add user context
        enhanced_parts.append(f"for {context_str}")
        
        # Combine with original query
        rewritten_query = f"{query} {' '.join(enhanced_parts)}"
        
        # Suggest filters
        filters = {}
        if detected_condition:
            filters["condition"] = detected_condition
        if detected_topic:
            filters["topic"] = detected_topic
        
        return {
            "original_query": query,
            "rewritten_query": rewritten_query.strip(),
            "detected_condition": detected_condition,
            "detected_topic": detected_topic,
            "filters": filters,
        }

    def rewrite_simple(self, query: str) -> str:
        """
        Simple rewrite without profile/constraints.
        
        Args:
            query: Original query
            
        Returns:
            Enhanced query string
        """
        result = self.rewrite_query(query)
        return result["rewritten_query"]
