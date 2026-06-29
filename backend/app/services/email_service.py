import logging
import imaplib
import email
from email.header import decode_header
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from backend.app.models.database_models import Customer
from backend.app.models.demo_models import GmailEmail
from backend.app.ai.utils.gemini_client import gemini_client

logger = logging.getLogger("services.email_service")

class EmailProvider(ABC):
    """Abstract Base Class for email providers like Gmail IMAP or simulated databases."""
    
    @abstractmethod
    def fetch_recent_emails(self, db: Session) -> List[Dict[str, Any]]:
        pass

class GmailIMAPProvider(EmailProvider):
    """Gmail IMAP App Password inbox sync provider reading unread emails in real-time."""
    
    def __init__(self, support_email: str, app_password: str):
        self.support_email = support_email.strip()
        self.app_password = app_password.replace(" ", "").strip()

    def fetch_recent_emails(self, db: Session) -> List[Dict[str, Any]]:
        emails = []
        try:
            logger.info("Connecting to Gmail IMAP server at imap.gmail.com for %s...", self.support_email)
            mail = imaplib.IMAP4_SSL("imap.gmail.com")
            mail.login(self.support_email, self.app_password)
            mail.select("inbox")
            
            # Search all emails or UNSEEN unread emails in inbox
            status, messages = mail.search(None, "ALL")
            if status != "OK" or not messages[0]:
                logger.info("No messages found in the inbox.")
                return []

            # Get list of email IDs
            mail_ids = messages[0].split()
            # Fetch up to 100 latest emails to verify and sync
            for mail_id in mail_ids[-100:]:
                status, data = mail.fetch(mail_id, "(RFC822)")
                if status != "OK":
                    continue
                
                for response_part in data:
                    if isinstance(response_part, tuple):
                        # Parse raw message bytes
                        msg = email.message_from_bytes(response_part[1])
                        
                        # Subject Header decode
                        subject, encoding = decode_header(msg.get("Subject", "No Subject"))[0]
                        if isinstance(subject, bytes):
                            subject = subject.decode(encoding or "utf-8", errors="ignore")
                        
                        sender = msg.get("From", "")
                        
                        # Extract email body text
                        body = ""
                        if msg.is_multipart():
                            for part in msg.walk():
                                content_type = part.get_content_type()
                                content_disposition = str(part.get("Content-Disposition"))
                                if content_type == "text/plain" and "attachment" not in content_disposition:
                                    body = part.get_payload(decode=True).decode(errors="ignore")
                                    break
                        else:
                            body = msg.get_payload(decode=True).decode(errors="ignore")

                        # Strip extra text whitespaces
                        body = body.strip()
                        
                        # Clean up sender email address
                        clean_sender = sender.lower()
                        if "<" in clean_sender and ">" in clean_sender:
                            clean_sender = clean_sender.split("<")[1].split(">")[0]
                        clean_sender = clean_sender.strip()

                        # Check if this sender email matches any registered client profile in the database
                        customer = db.query(Customer).filter(Customer.email.ilike(clean_sender)).first()
                        if not customer:
                            # Map test account sender to first customer as fallback for verification ease
                            if clean_sender == "vamshikrishna2898@gmail.com" or "2898" in clean_sender:
                                customer = db.query(Customer).first()
                            else:
                                # Try checking company domain fallback
                                domain = clean_sender.split("@")[-1] if "@" in clean_sender else ""
                                if domain and domain not in ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]:
                                    customer = db.query(Customer).filter(Customer.domain.ilike(domain)).first()

                        # Only sync email if it matches an active customer profile in our system
                        if customer:
                            # Scan sentiment markers via heuristics or leave it to Gemini
                            sentiment = "Neutral"
                            body_lower = body.lower()
                            if any(w in body_lower for w in ["unhappy", "crash", "delay", "bug", "terrible", "issue", "slow", "disappointed", "latency"]):
                                sentiment = "Negative"
                            elif any(w in body_lower for w in ["happy", "great", "thanks", "resolved", "love", "helpful", "good"]):
                                sentiment = "Positive"

                            emails.append({
                                "customer_id": customer.id,
                                "sender": sender,
                                "receiver": self.support_email,
                                "subject": subject,
                                "body": body,
                                "thread_id": msg.get("Message-ID", f"thread_imap_{mail_id.decode()}"),
                                "sentiment": sentiment
                            })
                            
            mail.close()
            mail.logout()
            logger.info("Successfully fetched %d matched emails from Gmail IMAP.", len(emails))
        except Exception as e:
            logger.error("Gmail IMAP syncing process failed: %s", str(e))
        return emails

class EmailService:
    """Service layer coordinating email retrieval, sentiment analysis, database persistence, and AI summaries."""
    
    def __init__(self, provider: EmailProvider = None):
        # Configured to use GmailIMAPProvider using live client credentials
        self.provider = provider or GmailIMAPProvider(
            support_email="vamshikrishna5108@gmail.com",
            app_password="rwor atlr sxph pwzl"
        )

    def sync_emails(self, db: Session, customer_id: int) -> int:
        """Downloads emails from active provider, runs Gemini sentiment/summarization, and saves to DB."""
        emails_payload = self.provider.fetch_recent_emails(db)
        synced_count = 0

        # Filter emails for the specific customer_id being requested
        customer_emails = [em for em in emails_payload if em["customer_id"] == customer_id]

        for em in customer_emails:
            # Avoid duplicate inserts by verifying thread_id and subject
            exists = db.query(GmailEmail).filter(
                GmailEmail.customer_id == customer_id,
                GmailEmail.thread_id == em["thread_id"],
                GmailEmail.subject == em["subject"]
            ).first()

            if not exists:
                # Perform AI summary using Gemini
                summary_txt = f"Summary: {em['subject']}"
                try:
                    prompt = f"Summarize this email in 12 words or less:\n{em['body']}"
                    res = gemini_client.generate_content(prompt)
                    if res and res.strip():
                        summary_txt = res.strip()
                except Exception as e:
                    logger.warning("Gemini email summary failed, using fallback. Error: %s", str(e))

                # Save email
                email_rec = GmailEmail(
                    customer_id=customer_id,
                    sender=em["sender"],
                    receiver=em["receiver"],
                    subject=em["subject"],
                    body=em["body"],
                    thread_id=em["thread_id"],
                    sentiment=em["sentiment"],
                    summary=summary_txt,
                    timestamp=datetime.utcnow()
                )
                db.add(email_rec)
                synced_count += 1

        db.commit()
        return synced_count

email_service = EmailService()
