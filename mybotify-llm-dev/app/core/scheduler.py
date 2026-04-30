from apscheduler.schedulers.background import BackgroundScheduler
from app.core.database import session
from app.models import Campaign
from app.services.ad_platforms.mock import MockAdPlatformAdapter

scheduler = BackgroundScheduler()
ad_platform = MockAdPlatformAdapter()

def sync_campaign_metrics():
    print("[Scheduler] Running periodic metric sync...")
    db = session()
    try:
        active_campaigns = db.query(Campaign).filter(Campaign.status == "Active").all()
        for campaign in active_campaigns:
            metrics = ad_platform.sync_metrics(str(campaign.id))
            
            campaign.spent = (campaign.spent or 0) + metrics['spent']
            campaign.revenue = (campaign.revenue or 0) + metrics['revenue']
            campaign.clicks = (campaign.clicks or 0) + int(metrics['clicks'])
            
            print(f"[Scheduler] Updated campaign '{campaign.name}'")
        
        db.commit()
    except Exception as e:
        print(f"[Scheduler] Error during sync: {e}")
        db.rollback()
    finally:
        db.close()

def start_scheduler():
    # Runs every 1 minute for demonstration purposes
    scheduler.add_job(sync_campaign_metrics, 'interval', minutes=1, id='sync_metrics_job')
    scheduler.start()
    print("[Scheduler] Started periodic metric sync job.")
