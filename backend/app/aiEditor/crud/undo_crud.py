import json

from sqlalchemy import text


def restore_backup(

    engine,

    table_name,

    backup_json

):

    rows=json.loads(backup_json)

    if not rows:

        return

    columns=list(rows[0].keys())

    placeholders=",".join(

        [f":{c}" for c in columns]

    )

    with engine.begin() as conn:

        conn.execute(

            text(f"DELETE FROM {table_name}")

        )

        sql=f"""

        INSERT INTO {table_name}

        ({",".join(columns)})

        VALUES

        ({placeholders})

        """

        conn.execute(

            text(sql),

            rows

        )