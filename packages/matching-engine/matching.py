def jaccard(a: set[str], b: set[str]) -> float:
    return len(a & b) / max(1, len(a | b))

def match(student_profile, consultants):
    scored = [
        (c, jaccard(set(student_profile["tags"]), set(c["tags"])))
        for c in consultants
    ]
    scored.sort(key=lambda t: t[1], reverse=True)
    return scored[0][0]  # best consultant
