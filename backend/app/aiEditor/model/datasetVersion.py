from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text, String, Float
from sqlalchemy.sql import func
from app.database import Base


class DatasetVersion(Base):
    __tablename__ = "dataset_versions"

    id = Column(Integer, primary_key=True)

    uploaded_file_id = Column(
        Integer,
        ForeignKey("uploaded_files.id")
    )

    version = Column(Integer)

    snapshot_json = Column(Text)

    edit_prompt = Column(Text)

    ai_summary = Column(Text)

    sql_executed = Column(Text)

    # Naye fields — History ke "Version Details" modal ke liye
    custom_name = Column(String, nullable=True)          # Rename feature ke liye
    rows_changed = Column(Integer, nullable=True)
    columns_affected = Column(Text, nullable=True)        # comma-separated column names
    execution_time = Column(Float, nullable=True)         # seconds
    backup_id = Column(String, nullable=True)
    status = Column(String, nullable=True, default="success")

    created_at = Column(
        DateTime,
        server_default=func.now()
    )