"""
Store data tools for AI agents.

Fetches real store data from the database and formats it as a context string
that gets injected into agent prompts.
"""

import logging

from app.core.database import session
from app.models import Customer, Order, Product, Store

logger = logging.getLogger(__name__)


def get_store_context(store_id: int) -> str:
    """
    Fetch store data and return a formatted markdown summary for agent prompts.

    Uses a synchronous DB session since this runs before the async LangGraph execution.
    """
    if not store_id:
        return ""

    db = session()
    try:
        store = db.query(Store).filter(Store.id == store_id).first()
        if not store:
            return ""

        products = db.query(Product).filter(Product.store_id == store_id).all()
        orders = db.query(Order).filter(Order.store_id == store_id).all()
        customers = db.query(Customer).filter(Customer.store_id == store_id).all()

        return _format_store_context(store, products, orders, customers)
    except Exception as e:
        logger.error(f"Failed to fetch store context for store_id={store_id}: {e}")
        return ""
    finally:
        db.close()


def _format_store_context(
    store: Store,
    products: list[Product],
    orders: list[Order],
    customers: list[Customer],
) -> str:
    """Format store data into a readable summary for agent prompts."""
    sections = []

    # --- Store Info ---
    sections.append(f"""## Store: {store.store_name}
- URL: {store.store_url or 'N/A'}
- Currency: {store.currency or 'N/A'}
- Country: {store.country or 'N/A'}
- Plan: {store.shopify_plan or 'N/A'}""")

    # --- Products Summary ---
    prices = [p.price for p in products if p.price and p.price > 0]
    categories = {}
    for p in products:
        cat = p.product_type or "Uncategorized"
        categories[cat] = categories.get(cat, 0) + 1

    top_products = sorted(
        [p for p in products if p.price],
        key=lambda x: x.price, reverse=True
    )[:5]

    low_inventory = [
        p for p in products
        if p.inventory_quantity is not None and p.inventory_quantity < 10
    ]

    products_section = f"""## Products ({len(products)} total)
- Avg Price: ${round(sum(prices) / len(prices), 2) if prices else 0}
- Price Range: ${min(prices) if prices else 0} – ${max(prices) if prices else 0}
- Total Inventory: {sum(p.inventory_quantity for p in products if p.inventory_quantity) or 0}
- Categories: {', '.join(f'{k} ({v})' for k, v in sorted(categories.items(), key=lambda x: x[1], reverse=True)[:8])}"""

    if top_products:
        products_section += "\n- Top Products by Price:"
        for p in top_products:
            products_section += f"\n  - {p.title}: ${p.price} (inventory: {p.inventory_quantity or 'N/A'})"

    if low_inventory:
        products_section += f"\n- ⚠ Low Inventory ({len(low_inventory)} items):"
        for p in low_inventory[:5]:
            products_section += f"\n  - {p.title}: {p.inventory_quantity} left"

    sections.append(products_section)

    # --- Sales Summary ---
    revenues = [o.total_price for o in orders if o.total_price and o.total_price > 0]
    total_revenue = sum(revenues) if revenues else 0
    unique_customers_count = len(set(o.customer_email for o in orders if o.customer_email))

    # Financial status breakdown
    financial_status = {}
    for o in orders:
        s = o.financial_status or "unknown"
        financial_status[s] = financial_status.get(s, 0) + 1

    # Monthly revenue (last 6 months)
    monthly_revenue = {}
    for o in orders:
        if o.order_date:
            month_key = o.order_date.strftime("%Y-%m")
            if month_key not in monthly_revenue:
                monthly_revenue[month_key] = {"revenue": 0, "orders": 0}
            monthly_revenue[month_key]["revenue"] += o.total_price or 0
            monthly_revenue[month_key]["orders"] += 1
    monthly_sorted = sorted(monthly_revenue.items(), key=lambda x: x[0], reverse=True)[:6]

    sales_section = f"""## Sales ({len(orders)} orders)
- Total Revenue: ${round(total_revenue, 2)}
- Avg Order Value: ${round(total_revenue / len(revenues), 2) if revenues else 0}
- Unique Buying Customers: {unique_customers_count}
- Payment Status: {', '.join(f'{k}: {v}' for k, v in financial_status.items())}"""

    if monthly_sorted:
        sales_section += "\n- Monthly Trends:"
        for month, data in monthly_sorted:
            sales_section += f"\n  - {month}: ${round(data['revenue'], 2)} ({data['orders']} orders)"

    sections.append(sales_section)

    # --- Customer Summary ---
    marketing_opt_in = len([c for c in customers if c.accepts_marketing])

    # Top locations
    locations = {}
    for c in customers:
        loc = f"{c.city}, {c.province}" if c.city and c.province else c.province or c.city or None
        if loc:
            locations[loc] = locations.get(loc, 0) + 1
    top_locations = sorted(locations.items(), key=lambda x: x[1], reverse=True)[:5]

    total_spent = sum(c.total_spent for c in customers if c.total_spent)

    customers_section = f"""## Customers ({len(customers)} total)
- Marketing Opt-In: {marketing_opt_in}/{len(customers)} ({round(marketing_opt_in / len(customers) * 100) if customers else 0}%)
- Avg Customer Spend: ${round(total_spent / len(customers), 2) if customers else 0}
- Total Customer Spend: ${round(total_spent, 2)}"""

    if top_locations:
        customers_section += "\n- Top Locations: " + ", ".join(
            f"{loc} ({count})" for loc, count in top_locations
        )

    sections.append(customers_section)

    return "\n\n".join(sections)
