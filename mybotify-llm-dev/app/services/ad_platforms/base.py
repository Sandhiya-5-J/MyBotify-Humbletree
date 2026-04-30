from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseAdPlatformAdapter(ABC):
    """
    Abstract base class for all Ad Platform integrations.
    """
    
    @abstractmethod
    def deploy_campaign(self, campaign_data: Dict[str, Any]) -> str:
        """
        Deploy the campaign to the platform.
        Returns the external campaign ID.
        """
        pass

    @abstractmethod
    def sync_metrics(self, external_campaign_id: str) -> Dict[str, float]:
        """
        Fetch latest metrics for the given campaign.
        Returns a dict with 'spent', 'revenue', and 'clicks'.
        """
        pass
