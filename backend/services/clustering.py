import math
from typing import List, Dict, Any, Tuple

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculates the geographical distance between two coordinates in meters.
    """
    R = 6371000.0  # Earth's radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    a = (math.sin(delta_phi / 2.0) ** 2 + 
         math.cos(phi1) * math.cos(phi2) * 
         math.sin(delta_lambda / 2.0) ** 2)
         
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def calculate_jaccard_similarity(text1: str, text2: str) -> float:
    """
    Computes lexical similarity between two text descriptions.
    """
    # Simple tokenization
    words1 = set(text1.lower().replace('.', '').replace(',', '').split())
    words2 = set(text2.lower().replace('.', '').replace(',', '').split())
    
    if not words1 or not words2:
        return 0.0
        
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    
    return len(intersection) / len(union)

def detect_duplicates(new_complaint: Dict[str, Any], existing_complaints: List[Dict[str, Any]], distance_threshold: float = 300.0, similarity_threshold: float = 0.35) -> Tuple[bool, Optional[str]]:
    """
    Scans existing complaints to find if the new complaint is a duplicate.
    Returns: (is_duplicate, parent_id)
    """
    new_lat = new_complaint.get("location", {}).get("lat")
    new_lng = new_complaint.get("location", {}).get("lng")
    new_category = new_complaint.get("category")
    new_desc = new_complaint.get("translatedDescription", new_complaint.get("description", ""))
    
    if new_lat is None or new_lng is None or not new_category:
        return False, None

    for existing in existing_complaints:
        # Ignore resolved complaints or duplicate child-complaints themselves
        if existing.get("status") == "resolved" or existing.get("parentId"):
            continue
            
        # 1. Match category
        if existing.get("category") != new_category:
            continue
            
        # 2. Check geographical distance (must be within 300 meters)
        ext_lat = existing.get("location", {}).get("lat")
        ext_lng = existing.get("location", {}).get("lng")
        if ext_lat is None or ext_lng is None:
            continue
            
        distance = haversine_distance(new_lat, new_lng, ext_lat, ext_lng)
        if distance > distance_threshold:
            continue
            
        # 3. Check description token similarity
        ext_desc = existing.get("translatedDescription", existing.get("description", ""))
        similarity = calculate_jaccard_similarity(new_desc, ext_desc)
        if similarity >= similarity_threshold:
            # Overlapping incident discovered!
            return True, existing.get("id")

    return False, None
