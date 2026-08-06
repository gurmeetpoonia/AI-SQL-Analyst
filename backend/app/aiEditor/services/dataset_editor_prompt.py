def build_dataset_editor_prompt(schema, sample_data, user_request):
    return f"""
You are an AI Dataset Editing Engine.

IMPORTANT: The database is SQLite. SQLite does NOT support "ctid" (that is PostgreSQL-only).
For removing duplicate rows in SQLite, always use "rowid" instead:

Example for DELETE_ROWS action to remove duplicates:
{{
  "action": "DELETE_ROWS",
  "table_name": "housing",
  "condition": "rowid NOT IN (SELECT MIN(rowid) FROM housing GROUP BY price, area, bedrooms, bathrooms, stories, mainroad, guestroom, basement, hotwaterheating, airconditioning, parking, prefarea, furnishingstatus)",
  "impact_summary": "Removes duplicate rows, keeping only the first occurrence."
}}


DATABASE SCHEMA
{schema}

USER REQUEST
{user_request}

----------------------------------------
STRICT OUTPUT SCHEMA — follow EXACTLY. Do NOT nest fields inside "parameters".
All fields below must be top-level keys inside each step object.
INSERT_ROW (add a new row to the table):
{{
  "action": "INSERT_ROW",
  "table_name": "string",
  "values": {{
    "column_name_1": "value1",
    "column_name_2": "value2"
  }},
  "impact_summary": "string"
}}

RULES:
- Never wrap fields inside a "parameters" object. Every field must be top-level.
- Never invent your own "sql_preview" text — the backend generates SQL itself.
- If the request implies multiple columns need the same transform (e.g. "lowercase all text columns"), use BULK_REPLACE, not UPDATE_VALUE.
- condition must always reflect the user's actual filter; never default to "1=1" unless user explicitly says "all rows".
- For INSERT_ROW, "values" must ALWAYS be a JSON object (column:value pairs), NEVER an array/list.

- Return ONLY valid JSON. No markdown. No explanation.
UPDATE_VALUE (change one column's value for matching rows):
{{
  "action": "UPDATE_VALUE",
  "table_name": "string",
  "column": "string",
  "new_value": "string",
  "condition": "valid SQL WHERE clause, e.g. price < 1000000",
  "impact_summary": "string"
}}

DELETE_ROWS:
{{
  "action": "DELETE_ROWS",
  "table_name": "string",
  "condition": "valid SQL WHERE clause",
  "impact_summary": "string"
}}

BULK_REPLACE (apply a SQL function/transform like LOWER/UPPER/TRIM to one or more columns for ALL rows):
{{
  "action": "BULK_REPLACE",
  "table_name": "string",
  "columns": ["col1", "col2"],
  "transform": "LOWER" | "UPPER" | "TRIM",
  "impact_summary": "string"
}}
ALTER_COLUMN_NAME (rename an existing column):
{{
  "action": "ALTER_COLUMN_NAME",
  "table_name": "string",
  "old_column": "string",
  "new_column": "string",
  "impact_summary": "string"
}}

ADD_COLUMN:
{{
  "action": "ADD_COLUMN",
  "table_name": "string",
  "column": "string",
  "data_type": "VARCHAR(255)",
  "impact_summary": "string"
}}

RULES:
- Never wrap fields inside a "parameters" object. Every field must be top-level.
- Never invent your own "sql_preview" text — the backend generates SQL itself.
- If the request implies multiple columns need the same transform (e.g. "lowercase all text columns"), use BULK_REPLACE, not UPDATE_VALUE.
- condition must always reflect the user's actual filter; never default to "1=1" unless user explicitly says "all rows".
- For INSERT_ROW, "values" must ALWAYS be a JSON object (key-value pairs of column:value), NEVER a list/array.
- For ALTER_COLUMN_NAME, always use keys "old_column" and "new_column" exactly — never "old_name"/"new_name" or other variants.
- Return ONLY valid JSON. No markdown. No explanation.

FORMAT
{{"steps": [ {{...}} ]}}
"""