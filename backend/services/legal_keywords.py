"""Keyword maps used for conservative issue classification.

Separate English and Hindi keyword sets keep the classifier simple and
testable. Hindi terms make the fallback/offline experience usable for
Hindi-speaking users even when the model is not connected.
"""
CATEGORY_KEYWORDS: dict[str, tuple[tuple[str, ...], tuple[str, ...]]] = {
    "Employment": (
        ("salary", "wage", "employer", "termination", "workplace", "job", "fired"),
        ("वेतन", "तनख्वाह", "सैलरी", "नौकरी", "नियोक्ता", "बर्खास्त"),
    ),
    "Rental/Housing": (
        ("rent", "landlord", "tenant", "evict", "lease", "maintenance", "notice to quit"),
        ("किराया", "मकान मालिक", "किरायेदार", "बेदखल", "पट्टा", "कमरा"),
    ),
    "Consumer": (
        ("refund", "defective", "seller", "purchase", "consumer", "shop", "warranty"),
        ("वापसी", "खराब", "विक्रेता", "दुकान", "उपभोक्ता", "गारंटी"),
    ),
    "Family": (
        ("divorce", "maintenance", "custody", "marriage", "domestic violence"),
        ("तलाक", "भरण पोषण", "कस्टडी", "शादी", "विवाह"),
    ),
    "Contract": (
        ("contract", "agreement", "clause", "breach", "terms"),
        ("अनुबंध", "समझौता", "करार", "शर्त"),
    ),
    "Cybercrime": (
        ("online fraud", "scam", "otp", "phishing", "cyber", "upi", "hacking"),
        ("धोखाधड़ी", "ठगी", "फिशिंग", "साइबर", "ओटीपी", "यूपीआई"),
    ),
    "Property": (
        ("property", "land", "title deed", "boundary", "encroachment"),
        ("संपत्ति", "ज़मीन", "पट्टा", "सीमा", "कब्ज़ा"),
    ),
    "Government services": (
        ("government", "certificate", "pension", "ration", "aadhaar"),
        ("सरकार", "प्रमाणपत्र", "पेंशन", "राशन", "आधार"),
    ),
    "Criminal complaint information": (
        ("police", "fir", "assault", "theft", "threat", "harassment"),
        ("पुलिस", "चोरी", "धमकी", "मारपीट", "प्राथमिकी", "परेशान"),
    ),
    "Civil dispute": (
        ("damages", "neighbour", "money owed", "dispute", "lawsuit"),
        ("हर्जाना", "पड़ोसी", "पैसा बकाया", "विवाद", "मुकदमा"),
    ),
}