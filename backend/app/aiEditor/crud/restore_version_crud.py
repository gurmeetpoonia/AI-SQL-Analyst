import json

from sqlalchemy import text


def restore_snapshot(

    engine,

    table_name,

    snapshot_json

):

    rows=json.loads(snapshot_json)

    if not rows:

        return

    columns=list(rows[0].keys())

    placeholders=",".join(
        [f":{c}" for c in columns]
    )

    sql=f"""

    INSERT INTO "{table_name}"

    ({",".join(columns)})

    VALUES

    ({placeholders})

    """

    with engine.begin() as conn:

        conn.execute(
            text(f'DELETE FROM "{table_name}"')
        )

        conn.execute(
            text(sql),
            rows
        )