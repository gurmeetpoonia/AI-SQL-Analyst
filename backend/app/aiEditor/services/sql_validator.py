def validate_edit_sql(sql: str):
    if not sql:
        return sql

    sql_upper = sql.upper().strip()

    # SELECT include kiya gaya hai taaki Preview Query pass ho sake
    allowed = [
        "SELECT",
        "UPDATE",
        "DELETE",
        "INSERT",
        "ALTER TABLE",
        "ALTER"
    ]

    # Check if SQL starts with any allowed command
    if not any(sql_upper.startswith(a) for a in allowed):
        raise ValueError("Invalid SQL Operation")

    forbidden = [
        "DROP TABLE",
        "DROP DATABASE",
        "VACUUM",
        "ATTACH",
        "DETACH",
        "PRAGMA",
        "TRIGGER",
        "VIEW",
        "INDEX"
    ]

    for word in forbidden:
        if word in sql_upper:
            raise ValueError("Unsafe SQL detected.")

    return sql