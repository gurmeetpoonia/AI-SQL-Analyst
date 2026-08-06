from google import genai
from app.config import GEMINI_API_KEY
from sqlalchemy import inspect
from sqlalchemy.orm import Session
from app.models import User
from google.genai import types
import re

client = genai.Client(api_key=GEMINI_API_KEY)


def test_gemini():
    response = client.models.generate_content(model="gemini-2.5-flash", contents="Say Hello Bro!")
    return response.text


def get_database_schema(engine, table_names: list[str]):

    inspector = inspect(engine)

    schema = ""

    for table in table_names:

        schema += f"Table: {table}\n\n"

        pk = inspector.get_pk_constraint(table)

        primary_keys = pk.get("constrained_columns", [])

        columns = inspector.get_columns(table)

        for column in columns:

            schema += f"Column: {column['name']}\n"

            schema += f"Type: {column['type']}\n"

            schema += f"Nullable: {column['nullable']}\n"

            if column["name"] in primary_keys:
                schema += "Primary Key: Yes\n"

            schema += "\n"

    return schema


def build_prompt(schema: str, question: str) -> str:
    return f"""You are a strict and highly accurate SQLite SQL Generator.
Your sole task is to generate ONE executable, optimized, and secure SQLite SELECT query based strictly on the provided schema and user question.

==================================================
1. DATABASE SCHEMA
==================================================
{schema}

==================================================
2. INPUT QUESTION
==================================================
Question: "{question}"

==================================================
3. INTENT & COLUMN SELECTION RULES (CRITICAL)
==================================================
- IF the user asks for "top N [column]", "highest [column]", "largest [column]", or "maximum [column]":
  -> DO NOT select only that single column.
  -> Select ALL relevant columns (or `SELECT *`) from the row so the user gets complete context.
  -> Always ORDER BY that specified column in DESCENDING order (`ORDER BY [column] DESC`).
  -> Apply `LIMIT N`.

- IF the user asks about "column data types", "describe table", "table structure", "schema", or "what columns exist":
  -> Use SQLite's pragma_table_info() table-valued function INSIDE a SELECT (this is a valid, safe, read-only SELECT statement).
  -> Example: SELECT name, type FROM pragma_table_info('table_name');
  -> NEVER use the bare "PRAGMA table_info(table_name);" form (without SELECT) — always wrap it as SELECT ... FROM pragma_table_info(...).

- Examples of Intent Interpretation:
  * "Show top 10 area" -> SELECT * FROM table ORDER BY area DESC LIMIT 10;
  * "Highest salary employees" -> SELECT * FROM employees ORDER BY salary DESC LIMIT 1;
  * "Show column data types" -> SELECT name, type FROM pragma_table_info('table_name');

==================================================
4. GENERAL STRICT RULES
==================================================
- Output ONLY valid SQLite SELECT query.
- DO NOT wrap output in markdown (NO ```sql, NO ```).
- DO NOT include explanations, comments, or extra text.
- Use ONLY tables and columns explicitly present in the SCHEMA.
- NEVER generate destructive operations (INSERT, UPDATE, DELETE, DROP, etc.).
- If numeric values are stored as TEXT, use `CAST(column AS REAL)` or `CAST(column AS INTEGER)` before sorting.

==================================================
5. FEW-SHOT EXAMPLES
==================================================
Schema:
Table: properties
Column: id | Type: INTEGER | Primary Key: Yes
Column: title | Type: TEXT
Column: price | Type: REAL
Column: area | Type: REAL
Column: city | Type: TEXT

User Question: show top 10 area
Output:
SELECT * FROM properties ORDER BY CAST(area AS REAL) DESC LIMIT 10;

User Question: show 5 most expensive properties
Output:
SELECT * FROM properties ORDER BY CAST(price AS REAL) DESC LIMIT 5;

User Question: show column data types
Output:
SELECT name, type FROM pragma_table_info('properties');

==================================================
6. OUTPUT
==================================================
Return ONLY the raw SQL SELECT string:"""


def generate_sql(
    db: Session,
    engine,
    question: str,
    table_name: str,
    current_user: User
):
    schema = get_database_schema(
        engine,
        [table_name]
    )

    prompt = build_prompt(schema=schema, question=question)
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.0
        )
    )
    sql = clean_sql_response(response.text)
    validate_sql(sql)
    return sql


def clean_sql_response(sql: str) -> str:
    # Remove markdown formatting if generated
    sql = re.sub(r'```(?:sql)?', '', sql, flags=re.IGNORECASE)
    sql = sql.strip("` \n\r\t;")

    # Take only the first query if multiple statements are returned
    if ";" in sql:
        sql = sql.split(";")[0]

    return sql.strip() + ";"


def validate_sql(sql: str):
    sql_upper = sql.upper()
    if not sql_upper.startswith("SELECT"):
        raise ValueError(
            "Only SELECT queries are allowed."
        )

    # Forbidden keywords ab WHOLE-WORD match hote hain (word boundary ke sath),
    # taaki "pragma_table_info" jaisa safe function name galti se block na ho,
    # aur "delete_flag"/"updated_at" jaise column names bhi false-positive na banein.
    forbidden = [
        "SQLITE_MASTER",
        "ATTACH",
        "DETACH",
        "DROP",
        "DELETE",
        "UPDATE",
        "INSERT",
        "ALTER"
    ]

    for word in forbidden:
        if re.search(rf"\b{word}\b", sql_upper):
            raise ValueError(
                "Unsafe SQL detected."
            )

    # PRAGMA sirf standalone keyword ke roop me block karo
    # (bare "PRAGMA ...;" statement), lekin "pragma_table_info(...)"
    # jaisa safe table-valued function SELECT ke andar allow karo.
    if re.search(r"\bPRAGMA\s", sql_upper) and "PRAGMA_TABLE_INFO" not in sql_upper:
        raise ValueError(
            "Unsafe SQL detected."
        )

    return sql


def fix_sql(schema: str, question: str, failed_sql: str, error: str) -> str:
    prompt = f"""You are an expert SQLite SQL Debugger.
The previous SQL query failed execution against SQLite. Analyze the error and generate a corrected SELECT query.

==================================================
DATABASE SCHEMA
==================================================
{schema}

==================================================
CONTEXT
==================================================
User Question: "{question}"
Failed Query: `{failed_sql}`
SQLite Error: "{error}"

==================================================
REPAIR INSTRUCTIONS
==================================================
1. Fix the error while strictly preserving the intent of the user question.
2. Ensure all column and table names strictly match the provided Schema.
3. Return ONLY the raw executable SQL query string.
4. NO markdown code blocks, NO commentary, NO explanations.

==================================================
OUTPUT
==================================================
Return ONLY the corrected SQL query:"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    sql = clean_sql_response(response.text)
    validate_sql(sql)
    print("DEBUG -> RAW GEMINI RESPONSE:", sql)
    return sql