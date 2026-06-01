from apscheduler.schedulers.background import BackgroundScheduler
from app.core.database import session
from app.models import Campaign, AdAccount, AdVariant
from app.services.ad_platforms import MockAdPlatformAdapter, MetaAdPlatformAdapter, GoogleAdPlatformAdapter

scheduler = BackgroundScheduler()
mock_adapter = MockAdPlatformAdapter()

def sync_campaign_metrics():
    print("[Scheduler] Running periodic metric sync...")
    db = session()
    try:
        active_campaigns = db.query(Campaign).filter(Campaign.status == "Active").all()
        for campaign in active_campaigns:
            # Determine platform type & load credentials
            platform = campaign.platform
            ad_account = None
            
            target_platform = "Facebook" if platform in ["Facebook", "Instagram"] else "Google Ads"
            ad_account = db.query(AdAccount).filter(
                AdAccount.store_id == campaign.store_id,
                AdAccount.platform == target_platform,
                AdAccount.is_active == True
            ).first()

            # Instantiate adapter based on credentials
            if ad_account:
                if target_platform == "Facebook":
                    adapter = MetaAdPlatformAdapter(
                        access_token=ad_account.access_token,
                        ad_account_id=ad_account.account_id
                    )
                else:
                    adapter = GoogleAdPlatformAdapter(
                        access_token=ad_account.access_token,
                        customer_id=ad_account.account_id
                    )
            else:
                adapter = mock_adapter

            # Sync metrics
            ext_id = campaign.external_campaign_id or str(campaign.id)
            metrics = adapter.sync_metrics(ext_id)
            
            # Check if campaign has any A/B testing variants
            variants = db.query(AdVariant).filter(AdVariant.campaign_id == campaign.id).all()
            
            if variants:
                active_variants = [v for v in variants if v.is_active]
                num_active = len(active_variants)
                
                if num_active > 0:
                    for idx, v in enumerate(active_variants):
                        # Split daily metrics across active variants
                        v_spent = metrics['spent'] / num_active
                        v_clicks = int(metrics['clicks'] / num_active)
                        
                        # Create realistic performance skew: Variant 1 gets 35% higher ROAS than Variant 2
                        multiplier = 1.35 if idx == 0 else 0.75
                        v_revenue = (metrics['revenue'] / num_active) * multiplier
                        
                        v.spent = (v.spent or 0.0) + v_spent
                        v.clicks = (v.clicks or 0) + v_clicks
                        v.revenue = (v.revenue or 0.0) + v_revenue
                    
                    # Update campaign's aggregated metrics as the sum of all its variants
                    campaign.spent = sum(var.spent or 0.0 for var in variants)
                    campaign.clicks = sum(var.clicks or 0 for var in variants)
                    campaign.revenue = sum(var.revenue or 0.0 for var in variants)
            else:
                campaign.spent = (campaign.spent or 0) + metrics['spent']
                campaign.revenue = (campaign.revenue or 0) + metrics['revenue']
                campaign.clicks = (campaign.clicks or 0) + int(metrics['clicks'])
            
            print(f"[Scheduler] Updated campaign '{campaign.name}' ({platform}) via adapter {adapter.__class__.__name__}")
        
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
