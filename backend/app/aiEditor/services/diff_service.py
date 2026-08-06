def preview_diff(before, after):
    """
    Compare before and after dataset rows.
    """

    diffs = []

    before_map = {}

    for row in before:
        key = tuple(row.items())
        before_map[key] = row

    after_map = {}

    for row in after:
        key = tuple(row.items())
        after_map[key] = row

    # Updated rows
    for old, new in zip(before, after):

        changes = {}

        for col in old.keys():

            if old[col] != new[col]:

                changes[col] = {
                    "before": old[col],
                    "after": new[col]
                }

        if changes:

            diffs.append({
                "type": "UPDATE",
                "changes": changes
            })

    # Added rows
    if len(after) > len(before):

        for row in after[len(before):]:

            diffs.append({
                "type": "INSERT",
                "row": row
            })

    # Deleted rows
    elif len(before) > len(after):

        for row in before[len(after):]:

            diffs.append({
                "type": "DELETE",
                "row": row
            })

    return diffs