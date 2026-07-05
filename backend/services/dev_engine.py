from typing import List, Dict, Any, Tuple

class DevEngine:
    @staticmethod
    def calculate_priority_score(cluster_complaints: List[Dict[str, Any]]) -> Tuple[int, Dict[str, int]]:
        """
        Calculates an AI Priority Score (out of 100) based on weighted factors:
        1. Demand Weight (up to 30) - based on complaint frequency/duplicates
        2. Urgency Weight (up to 25) - based on highest severity
        3. Infrastructure Gap (up to 25) - simulated facility gaps
        4. Population Weight (up to 20) - target ward sizes
        """
        # 1. Demand Weight
        num_complaints = len(cluster_complaints)
        if num_complaints >= 4:
            demand = 30
        elif num_complaints == 3:
            demand = 26
        elif num_complaints == 2:
            demand = 20
        else:
            demand = 12

        # 2. Urgency Weight
        urgency_score = 5
        for c in cluster_complaints:
            u = c.get("urgency", "low").lower()
            if u == "critical":
                urgency_score = max(urgency_score, 25)
            elif u == "high":
                urgency_score = max(urgency_score, 20)
            elif u == "medium":
                urgency_score = max(urgency_score, 12)
            else:
                urgency_score = max(urgency_score, 5)

        # 3. Infrastructure Gap (Simulated distance to nearest facility based on coordinate metrics)
        # In a real environment, we'd query local GIS datasets.
        # We simulate this based on the length of descriptions (representing complexity of reported gaps)
        gap = 15
        if any(keyword in str(c.get("description", "")).lower() for keyword in ["far", "kilometer", "away", "nearest", "lack", "missing", "broken"]):
            gap = 25
        elif num_complaints > 2:
            gap = 20

        # 4. Population Weight
        # Simulated based on category priority densities
        category = cluster_complaints[0].get("category", "Roads")
        if category in ["Roads", "Water", "Health"]:
            population = 18
        elif category in ["Education", "Electricity"]:
            population = 15
        else:
            population = 10

        total_score = demand + urgency_score + gap + population
        # Cap at 100
        total_score = min(total_score, 100)

        breakdown = {
            "demandWeight": demand,
            "gapWeight": gap,
            "urgencyWeight": urgency_score,
            "populationWeight": population
        }

        return total_score, breakdown

    @staticmethod
    def estimate_project_budget(category: str, score: int) -> int:
        """
        Estimates budget category ranges in INR.
        """
        budget_map = {
            "Roads": 1500000,
            "Water": 600000,
            "Waste": 250000,
            "Infrastructure": 2200000,
            "Health": 3500000,
            "Education": 1800000,
            "Electricity": 800000
        }
        base_budget = budget_map.get(category, 1000000)
        
        # Scale budget slightly based on project scope priority score
        multiplier = 0.8 + (score / 100.0) * 0.4
        return int(base_budget * multiplier)

    @staticmethod
    def estimate_beneficiaries(category: str, num_complaints: int) -> int:
        """
        Estimates count of beneficiaries.
        """
        multiplier_map = {
            "Roads": 3500,
            "Water": 2500,
            "Waste": 1200,
            "Infrastructure": 4500,
            "Health": 5000,
            "Education": 3000,
            "Electricity": 2000
        }
        multiplier = multiplier_map.get(category, 2000)
        return multiplier * num_complaints
        
    @classmethod
    def generate_recommendation(cls, cluster_id: str, category: str, complaints_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Assembles all parameters into a complete Recommendation schema.
        """
        first_comp = complaints_list[0]
        score, breakdown = cls.calculate_priority_score(complaints_list)
        budget = cls.estimate_project_budget(category, score)
        beneficiaries = cls.estimate_beneficiaries(category, len(complaints_list))
        
        titles = {
            "Roads": f"Asphalt Resurfacing & Drainage Channelization around {first_comp['location']['address'].split(',')[0]}",
            "Water": f"Installation of Local Water Filtration Unit and Piping Grid",
            "Waste": f"Establishment of Segregated Disposal Point and Regular Cleanups",
            "Infrastructure": f"Structural Reconstruction of Community Facility in Ward 4",
            "Health": f"Establishment of Local Primary Health Centre & Dispensary",
            "Education": f"Secondary School Roof Repair and Smart Classroom Upgrades",
            "Electricity": f"Installation of High-Capacity Transformer & Stabilizer lines"
        }
        
        descriptions = {
            "Roads": "Repairing foundation base, paving fresh bitumen asphalt, and laying concrete drainage pipes to channel rain gutters.",
            "Water": "Securing local distribution lines, mounting filtration systems, and deploying automated pressure valve regulators.",
            "Waste": "Setting up covered waste storage containers, planning bi-weekly municipal garbage pickup schedules, and clearing blockages.",
            "Infrastructure": "Renovating common structures, fixing pedestrian paths, and implementing safety guards.",
            "Health": "Equipping a minor local clinic with basic diagnostic tools, emergency triage supplies, and essential pharmacies.",
            "Education": "Fixing leakages in classroom ceilings, reinforcing structural pillars, and installing interactive boards.",
            "Electricity": "Upgrading local voltage capacity to eliminate frequent spiking and power feeder line cuts."
        }
        
        project_title = titles.get(category, f"Community Initiative: {category} Upgrades")
        project_desc = descriptions.get(category, "Renovating municipal systems to enhance civic quality of life.")

        explanation = f"AI identified a cluster of {len(complaints_list)} overlapping citizen complaints detailing critical {category.lower()} vulnerabilities. "
        explanation += f"The project receives a Priority Score of {score}/100. It directly serves an estimated {beneficiaries:,} residents. "
        if score >= 85:
            explanation += f"High priority rating is driven by urgent safety reports and significant infrastructure facilities gaps in the immediate coordinates."
        else:
            explanation += f"Priority rating reflects strong community demand and moderate accessibility gaps."

        return {
            "id": f"rec-{cluster_id}",
            "title": project_title,
            "description": project_desc,
            "reasoning": explanation,
            "priorityScore": score,
            "scoreBreakdown": breakdown,
            "budgetEstimation": budget,
            "expectedBeneficiaries": beneficiaries,
            "complaintIds": [c["id"] for c in complaints_list],
            "location": first_comp["location"],
            "status": "proposed",
            "timestamp": first_comp["timestamp"]
        }
