from sqlalchemy import inspect

def get_all_columns(engine, table_name):
    inspector = inspect(engine)
    return [col["name"] for col in inspector.get_columns(table_name)]



def build_sql(step: dict, engine=None):
    action = step.get("action", "").upper().strip()
    if not action:
        raise KeyError(f"Missing 'action' key. Keys: {list(step.keys())}")

    table_name = step.get("table_name", "dataset_table")
    params_block = step.get("parameters", {}) or {}

    column = (
        step.get("column") or step.get("column_name")
        or step.get("target_column") or params_block.get("column")
    )
    condition = step.get("condition") or step.get("where") or params_block.get("condition")
    if condition and "ctid" in condition.lower():
        condition = condition.replace("ctid", "rowid").replace("CTID", "rowid")
    preview_params = {}

    if action == "BULK_REPLACE":
        transform_columns = step.get("columns") or params_block.get("columns") or []
        transform = (step.get("transform") or params_block.get("transform") or "").upper()
        if not transform_columns or transform not in ("LOWER", "UPPER", "TRIM"):
            raise KeyError(f"BULK_REPLACE needs 'columns' and valid 'transform'. Got: {step}")

        # Actual UPDATE — sirf transform columns touch honge
        set_clause = ", ".join([f"{c} = {transform}({c})" for c in transform_columns])
        sql = f"UPDATE {table_name} SET {set_clause};"

        # Preview — SAARE columns dikhao, bas transform wale columns ki value change dikhao
        if engine is not None:
            all_columns = get_all_columns(engine, table_name)
        else:
            all_columns = transform_columns  # fallback

        select_parts = []
        for c in all_columns:
            if c in transform_columns:
                select_parts.append(f"{transform}({c}) AS {c}")
            else:
                select_parts.append(c)

        preview = f"SELECT {', '.join(select_parts)} FROM {table_name} ;"

    elif action == "ADD_COLUMN":
        if not column:
            raise KeyError("Missing 'column' key in ADD_COLUMN step.")
        data_type = step.get("data_type", "VARCHAR(255)")
        default_value = step.get("default_value")  # optional, agar Gemini bheje

        sql = f"ALTER TABLE {table_name} ADD COLUMN {column} {data_type};"

        # Preview: naya column bhi dikhao, default NULL (ya specified default) ke saath
        if default_value is not None:
            preview = f"SELECT *, '{default_value}' AS {column} FROM {table_name} ;"
        else:
            preview = f"SELECT *, NULL AS {column} FROM {table_name} ;"

    elif action == "DELETE_ROWS":
        if not condition:
            raise ValueError("DELETE_ROWS missing a valid 'condition'. Refusing unconditional delete.")
        sql = f"DELETE FROM {table_name} WHERE {condition};"
        preview = f"SELECT * FROM {table_name} WHERE {condition} ;"

    elif action == "UPDATE_VALUE":
        if not column:
            raise KeyError(f"Missing 'column' key in UPDATE_VALUE step. Keys: {list(step.keys())}")
        if not condition:
            raise ValueError("UPDATE_VALUE missing a valid 'condition'.")
        val = step.get("new_value", params_block.get("new_value", ""))
        sql = f"UPDATE {table_name} SET {column}='{val}' WHERE {condition};"

        # Preview: poori row dikhao, bas is column ki value "after update" wali dikhao
        if engine is not None:
            all_columns = get_all_columns(engine, table_name)
        else:
            all_columns = [column]

        select_parts = []
        for c in all_columns:
            if c == column:
                select_parts.append(f"'{val}' AS {c}")   # naya value dikhega
            else:
                select_parts.append(c)

        preview = f"SELECT {', '.join(select_parts)} FROM {table_name} WHERE {condition} ;"
    elif action == "INSERT_ROW":
        values = step.get("values", {})
        columns = step.get("columns")

        if isinstance(values, dict) and values:
            cols = list(values.keys())
            vals = list(values.values())
        elif isinstance(values, list) and columns:
            cols = columns
            vals = values
        else:
            raise KeyError(f"INSERT_ROW needs 'values' as dict. Got: {step}")

        cols_sql = ",".join(cols)
        vals_sql = ",".join([f"'{v}'" for v in vals])
        sql = f"INSERT INTO {table_name} ({cols_sql}) VALUES ({vals_sql});"

        # Preview: naya row jo insert hoga, uske literal values dikhao
        if engine is not None:
            all_columns = get_all_columns(engine, table_name)
        else:
            all_columns = cols

        values_map = dict(zip(cols, vals))
        select_parts = []
        for c in all_columns:
            if c in values_map:
                select_parts.append(f"'{values_map[c]}' AS {c}")
            else:
                select_parts.append(f"NULL AS {c}")

        preview = f"SELECT {', '.join(select_parts)} ;"
    elif action == "ALTER_COLUMN_NAME":
        old_column = (
            step.get("old_column") or step.get("column") 
            or step.get("old_name") or params_block.get("old_column")
        )
        new_column = (
            step.get("new_column") or step.get("new_name") 
            or params_block.get("new_column")
        )
        if not old_column or not new_column:
            raise KeyError(f"ALTER_COLUMN_NAME needs 'old_column' and 'new_column'. Got: {step}")

        sql = f"ALTER TABLE {table_name} RENAME COLUMN {old_column} TO {new_column};"

        # Preview: renamed column ko naye naam se alias karke dikhao
        if engine is not None:
            all_columns = get_all_columns(engine, table_name)
        else:
            all_columns = [old_column]

        select_parts = []
        for c in all_columns:
            if c == old_column:
                select_parts.append(f"{c} AS {new_column}")
            else:
                select_parts.append(c)

        preview = f"SELECT {', '.join(select_parts)} FROM {table_name} ;"
    else:
        raise ValueError(f"Unsupported action: '{action}'")

    return {
        "sql": sql.strip(),
        "preview_sql": preview.strip() if preview else None,
        "preview_params": preview_params
    }