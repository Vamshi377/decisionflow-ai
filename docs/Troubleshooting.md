# Troubleshooting Common Issues

* **IMAP Auth Failures**: Double check app password is configured without spaces on Gmail console.
* **Missing sqlite db errors**: Execute database migrations or seed scripts first (`python backend/app/database/session.py` or run Uvicorn server).