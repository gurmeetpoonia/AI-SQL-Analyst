import json

from sqlalchemy import text

from app.aiEditor.model.edit_history import EditHistory


def create_backup(

    engine,

    table_name

):

    with engine.connect() as conn:

        result=conn.execute(

            text(f"SELECT * FROM {table_name}")

        )

        rows=[dict(r._mapping) for r in result]

    return json.dumps(rows)


def save_history(

    db,

    user_id,

    table_name,

    action,

    sql,

    backup_json

):

    history=EditHistory(

        user_id=user_id,

        table_name=table_name,

        action=action,

        sql=sql,

        backup_json=backup_json

    )

    db.add(history)

    db.commit()

    db.refresh(history)

    return history