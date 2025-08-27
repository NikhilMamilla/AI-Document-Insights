import os
import sqlite3
from contextlib import contextmanager


DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")


def initialize_database() -> None:
	connection = sqlite3.connect(DB_PATH)
	cursor = connection.cursor()
	cursor.execute(
		"""
		CREATE TABLE IF NOT EXISTS documents (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			filename TEXT NOT NULL,
			original_name TEXT NOT NULL,
			file_path TEXT NOT NULL,
			ai_summary TEXT,
			fallback_words TEXT,
			processing_status TEXT DEFAULT 'completed',
			upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
			file_size INTEGER
		);
		"""
	)
	connection.commit()
	connection.close()


@contextmanager
def get_db_connection():
	connection = sqlite3.connect(DB_PATH)
	try:
		yield connection
	finally:
		connection.close()


