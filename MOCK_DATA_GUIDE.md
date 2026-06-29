# Mock Data Templates & Testing Guide

Use the templates below to test DecisionFlow AI's uploader and decision recommendation engine.

---

## 1. Register a Custom Client

To add a new customer to the empty database, open your terminal in the `xlventure` folder and run:
```bash
python add_custom_client.py
```
This script will prompt you for the client's name, company, email, initial health score, and risk level, and save it immediately.

---

## 2. Mock Data Templates

Copy any of the text blocks below and save them as local files on your computer.

### Template A: Meeting Zoom Transcript (`zoom_transcript.txt`)
Save this content as a text file. It triggers renewal, competitor (Salesforce), and pricing concern signals in the decision engine.

```text
John (Client Lead): "Hi Vamshi, thanks for hopping on. To be completely honest, we are very frustrated with the slow load times of our signal agents. We experienced a massive API delay last Thursday that cost us hours of auditing delays."
Vamshi (CSM): "I understand John, and I sincerely apologize. Our engineering team is currently investigating Webhook latency spikes and is working on a fix."
John (Client Lead): "That's good, but we have a contract renewal in 30 days and we are actively evaluating Salesforce as a cheaper, more stable alternative. Their sales representative offered us a 20% discount. We are seriously considering churning unless we can negotiate a pricing restructure."
Vamshi (CSM): "I appreciate your transparency. Let me check what restructuring plans or pricing discounts we can offer for a multi-year commit."
```

### Template B: Support Escalation Email (`email_latency.txt`)
Save this content as a text file. It triggers a product complaint and payment overdue warning flags.

```text
From: sarah.jenkins@initech.solutions
To: success@decisionflow.ai
Subject: Urgent: Webhook Latency Spikes and Payment Status Query

Hi Vamshi,

Our operations team is reporting persistent slow speeds when reloading next-best-action panels. This is delaying our daily workflow, and we are disappointed with the platform performance this week. 

Additionally, our finance department received a warning regarding an overdue payment for invoice #INV-2921. We need to audit these latency issues first before we clear the charge. Can we schedule an urgent tech sync?

Best,
Sarah Jenkins
Initech Inc
```

### Template C: Product Usage CSV (`usage_metrics.csv`)
Save this content as a CSV file. It maps seat drop indicators to demonstrate product adoption decline.

```csv
month,mau,logins
Jan,1200,24
Feb,1150,22
Mar,950,18
Apr,700,12
May,520,8
Jun,450,5
```

---

## 3. Ingesting & Running Analysis

1. Go to your local browser: [http://localhost:5173/](http://localhost:5173/).
2. Select your newly created customer in the dropdown under **Playbook Ingest** tab.
3. Drag & drop or upload one of the saved mock files above.
4. Click **Run Analysis Agents**.
5. Watch the dynamic graph trace complete, then review the recommended actions in the **Next Best Actions** panel!
