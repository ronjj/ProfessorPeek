def levenshtein_distance(s1, s2):
    if len(s1) < len(s2):
        s1, s2 = s2, s1

    # Create a distance matrix
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]

def are_similar(s1, s2, threshold_ratio=0.3):
    # Calculate the Levenshtein distance
    distance = levenshtein_distance(s1, s2)
    # Calculate the threshold based on the length of the shorter string
    threshold = threshold_ratio * min(len(s1), len(s2))
    return distance <= threshold
