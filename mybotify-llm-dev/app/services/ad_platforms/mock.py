import time
import random
from typing import Dict, Any
from .base import BaseAdPlatformAdapter

class MockAdPlatformAdapter(BaseAdPlatformAdapter):
    """
    Simulates interactions with an Ad Platform (Meta/Google).
    Useful for local testing and demonstration.
    """
    
    def deploy_campaign(self, campaign_data: Dict[str, Any]) -> str:
        """
        Simulates deploying an ad by sleeping for 3 seconds.
        """
        print(f"[MockAdPlatform] Deploying campaign: {campaign_data.get('name')} to {campaign_data.get('platform')}")
        print(f"[MockAdPlatform] Target Audience: {campaign_data.get('target_audience')}")
        print(f"[MockAdPlatform] Ad Copy: {campaign_data.get('generated_copy')}")
        
        # Simulate network latency
        time.sleep(3)
        
        # Generate a fake external campaign ID
        external_id = f"mock_camp_{random.randint(10000, 99999)}"
        print(f"[MockAdPlatform] Successfully deployed! External ID: {external_id}")
        return external_id

    def sync_metrics(self, external_campaign_id: str) -> Dict[str, float]:
        """
        Simulates fetching live metrics by generating realistic randomized increments.
        """
        # We simulate that the ad is running and gathering metrics
        spent_increment = random.uniform(0.5, 5.0)
        
        # Assume a good ROAS (Return On Ad Spend) for the demo, e.g. 2x to 5x
        roas = random.uniform(2.0, 5.0)
        revenue_increment = spent_increment * roas
        
        clicks_increment = random.randint(1, 15)
        
        print(f"[MockAdPlatform] Syncing metrics for {external_campaign_id}: "
              f"Spent +${spent_increment:.2f}, Rev +${revenue_increment:.2f}, Clicks +{clicks_increment}")
              
        return {
            "spent": spent_increment,
            "revenue": revenue_increment,
            "clicks": clicks_increment
        }
