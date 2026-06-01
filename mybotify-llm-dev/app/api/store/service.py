import csv
import io
from datetime import datetime

import requests
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.Order import Order
from app.models.Product import Product
from app.models.Store import Store
from app.models.Customer import Customer


SHOPIFY_API_VERSION = "2024-01"


# ==================== Shopify API (existing) ====================


def fetch_shopify_store_details(store_url: str, access_token: str) -> dict:
    """Call the Shopify Admin API to fetch store details."""
    store_url = store_url.strip().rstrip("/")
    if not store_url.startswith("http"):
        store_url = f"https://{store_url}"
    if "/admin" in store_url:
        store_url = store_url.split("/admin")[0]

    api_url = f"{store_url}/admin/api/{SHOPIFY_API_VERSION}/shop.json"
    headers = {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
    }

    try:
        response = requests.get(api_url, headers=headers, timeout=15)
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not connect to {store_url}. Please check the store URL.",
        )
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Request to Shopify timed out. Please try again.",
        )

    if response.status_code == 401:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token. Please check your Shopify Admin API token.",
        )
    elif response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found. Please check the store URL.",
        )
    elif response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Shopify API error: {response.status_code} - {response.text[:200]}",
        )

    return response.json().get("shop", {})


def connect_store(store_url: str, access_token: str, user_id: int, db: Session) -> dict:
    """Validate Shopify token, fetch store details, save to DB."""
    existing = (
        db.query(Store)
        .filter(Store.store_url == store_url, Store.user_id == user_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This store is already connected to your account.",
        )

    shop_data = fetch_shopify_store_details(store_url, access_token)

    db_store = Store(
        user_id=user_id,
        store_name=shop_data.get("name", store_url),
        store_url=store_url,
        shopify_domain=shop_data.get("domain"),
        shopify_email=shop_data.get("email"),
        shopify_plan=shop_data.get("plan_display_name"),
        currency=shop_data.get("currency"),
        country=shop_data.get("country_name"),
        access_token=access_token,
        is_active=True,
    )

    db.add(db_store)
    db.commit()
    db.refresh(db_store)

    return store_with_counts(db_store, db)


# ==================== Manual Entry (new) ====================


def add_store_manual(
    store_name: str,
    user_id: int,
    db: Session,
    store_url: str = None,
    description: str = None,
    shopify_email: str = None,
    currency: str = None,
    country: str = None,
) -> dict:
    """Create a store from manually entered data."""
    db_store = Store(
        user_id=user_id,
        store_name=store_name,
        store_url=store_url,
        description=description,
        shopify_email=shopify_email,
        currency=currency,
        country=country,
        is_active=True,
    )

    db.add(db_store)
    db.commit()
    db.refresh(db_store)

    return store_with_counts(db_store, db)


# ==================== CSV Parsing ====================


async def parse_and_save_products_csv(file: UploadFile, store_id: int, db: Session) -> dict:
    """Parse a products CSV and save rows to the products table."""
    contents = await file.read()
    text = contents.decode("utf-8-sig")  # handles BOM
    reader = csv.DictReader(io.StringIO(text))

    products_added = 0
    for row in reader:
        product = Product(
            store_id=store_id,
            title=row.get("Title", row.get("title", "")),
            description=row.get("Body (HTML)", row.get("Description", row.get("description", ""))),
            price=safe_float(row.get("Variant Price", row.get("Price", row.get("price")))),
            compare_at_price=safe_float(row.get("Variant Compare At Price", row.get("Compare At Price"))),
            sku=row.get("Variant SKU", row.get("SKU", row.get("sku", ""))),
            status=row.get("Status", row.get("status", "active")),
            product_type=row.get("Type", row.get("Product Type", row.get("product_type", ""))),
            vendor=row.get("Vendor", row.get("vendor", "")),
            inventory_quantity=safe_int(row.get("Variant Inventory Qty", row.get("Inventory", row.get("inventory_quantity")))),
            image_url=row.get("Image Src", row.get("Image URL", row.get("image_url", ""))),
        )
        db.add(product)
        products_added += 1

    db.commit()
    return {"message": f"{products_added} products uploaded successfully", "count": products_added}


async def parse_and_save_orders_csv(file: UploadFile, store_id: int, db: Session) -> dict:
    """Parse an orders CSV and save rows to the orders table."""
    contents = await file.read()
    text = contents.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    orders_added = 0
    for row in reader:
        order = Order(
            store_id=store_id,
            order_number=row.get("Name", row.get("Order", row.get("order_number", ""))),
            customer_name=build_customer_name(row),
            customer_email=row.get("Email", row.get("email", row.get("customer_email", ""))),
            total_price=safe_float(row.get("Total", row.get("total_price"))),
            currency=row.get("Currency", row.get("currency", "")),
            financial_status=row.get("Financial Status", row.get("financial_status", "")),
            fulfillment_status=row.get("Fulfillment Status", row.get("fulfillment_status", "")),
            items_count=safe_int(row.get("Lineitem quantity", row.get("Items", row.get("items_count")))),
            order_date=safe_datetime(row.get("Created at", row.get("Date", row.get("order_date")))),
        )
        db.add(order)
        orders_added += 1

    db.commit()
    return {"message": f"{orders_added} orders uploaded successfully", "count": orders_added}


async def parse_and_save_customers_csv(file: UploadFile, store_id: int, db: Session) -> dict:
    """Parse a customers CSV and save rows to the customers table."""
    contents = await file.read()
    text = contents.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    customers_added = 0
    for row in reader:
        accepts_marketing = str(row.get("Accepts Marketing", row.get("accepts_marketing", ""))).lower() in ["yes", "true", "1"]
        customer = Customer(
            store_id=store_id,
            first_name=row.get("First Name", row.get("first_name", "")),
            last_name=row.get("Last Name", row.get("last_name", "")),
            email=row.get("Email", row.get("email", "")),
            accepts_marketing=accepts_marketing,
            total_spent=safe_float(row.get("Total Spent", row.get("total_spent", 0.0))),
            total_orders=safe_int(row.get("Total Orders", row.get("total_orders", 0))),
            city=row.get("City", row.get("city", "")),
            province=row.get("Province", row.get("Province Code", row.get("province", ""))),
            country=row.get("Country", row.get("Country Code", row.get("country", ""))),
            tags=row.get("Tags", row.get("tags", "")),
        )
        db.add(customer)
        customers_added += 1

    db.commit()
    return {"message": f"{customers_added} customers uploaded successfully", "count": customers_added}


# ==================== Queries ====================


def get_user_stores(user_id: int, db: Session) -> list:
    """Get all stores for a user, with product/order counts."""
    stores = db.query(Store).filter(Store.user_id == user_id).all()
    return [store_with_counts(s, db) for s in stores]


def get_all_stores(db: Session) -> list:
    """Get all stores (admin only), with product/order counts."""
    stores = db.query(Store).all()
    return [store_with_counts(s, db) for s in stores]


def get_store_products(store_id: int, db: Session) -> list:
    return db.query(Product).filter(Product.store_id == store_id).all()


def get_store_orders(store_id: int, db: Session) -> list:
    return db.query(Order).filter(Order.store_id == store_id).all()


def disconnect_store(store_id: int, user_id: int, db: Session, is_admin: bool = False) -> dict:
    """Delete a store (cascades to products + orders)."""
    query = db.query(Store).filter(Store.id == store_id)
    if not is_admin:
        query = query.filter(Store.user_id == user_id)

    store = query.first()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found.")

    db.delete(store)
    db.commit()
    return {"message": "Store disconnected successfully."}


def get_store_analytics(store_id: int, db: Session) -> dict:
    """Compute market + sales analytics for a store."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    products = db.query(Product).filter(Product.store_id == store_id).all()
    orders = db.query(Order).filter(Order.store_id == store_id).all()
    customers = db.query(Customer).filter(Customer.store_id == store_id).all()

    # === Market Analysis (Products) ===
    prices = [p.price for p in products if p.price and p.price > 0]
    inventories = [p.inventory_quantity for p in products if p.inventory_quantity is not None]

    # Category breakdown
    categories = {}
    for p in products:
        cat = p.product_type or "Uncategorized"
        if cat not in categories:
            categories[cat] = {"count": 0, "total_value": 0}
        categories[cat]["count"] += 1
        categories[cat]["total_value"] += p.price or 0

    # Price distribution
    price_ranges = {"$0-25": 0, "$25-50": 0, "$50-100": 0, "$100-200": 0, "$200+": 0}
    for price in prices:
        if price <= 25:
            price_ranges["$0-25"] += 1
        elif price <= 50:
            price_ranges["$25-50"] += 1
        elif price <= 100:
            price_ranges["$50-100"] += 1
        elif price <= 200:
            price_ranges["$100-200"] += 1
        else:
            price_ranges["$200+"] += 1

    # Top products by price
    top_products = sorted(
        [{"title": p.title, "price": p.price, "type": p.product_type, "inventory": p.inventory_quantity}
         for p in products if p.price],
        key=lambda x: x["price"], reverse=True
    )[:10]

    # Low inventory alerts
    low_inventory = [
        {"title": p.title, "inventory": p.inventory_quantity, "price": p.price}
        for p in products
        if p.inventory_quantity is not None and p.inventory_quantity < 10
    ]

    market_analysis = {
        "total_products": len(products),
        "avg_price": round(sum(prices) / len(prices), 2) if prices else 0,
        "min_price": min(prices) if prices else 0,
        "max_price": max(prices) if prices else 0,
        "total_inventory": sum(inventories) if inventories else 0,
        "categories": categories,
        "price_distribution": price_ranges,
        "top_products": top_products,
        "low_inventory": low_inventory,
    }

    # === Sales Analysis (Orders) ===
    revenues = [o.total_price for o in orders if o.total_price and o.total_price > 0]
    unique_customers = list(set(o.customer_email for o in orders if o.customer_email))

    # Financial status breakdown
    financial_status = {}
    for o in orders:
        s = o.financial_status or "unknown"
        financial_status[s] = financial_status.get(s, 0) + 1

    # Fulfillment status breakdown
    fulfillment_status = {}
    for o in orders:
        s = o.fulfillment_status or "unfulfilled"
        fulfillment_status[s] = fulfillment_status.get(s, 0) + 1

    # Top customers by spend
    customer_spend = {}
    for o in orders:
        email = o.customer_email or "unknown"
        name = o.customer_name or email
        if email not in customer_spend:
            customer_spend[email] = {"name": name, "email": email, "total": 0, "orders": 0}
        customer_spend[email]["total"] += o.total_price or 0
        customer_spend[email]["orders"] += 1
    top_customers = sorted(customer_spend.values(), key=lambda x: x["total"], reverse=True)[:10]

    # Monthly revenue
    monthly_revenue = {}
    for o in orders:
        if o.order_date:
            month_key = o.order_date.strftime("%Y-%m")
            if month_key not in monthly_revenue:
                monthly_revenue[month_key] = {"month": month_key, "revenue": 0, "orders": 0}
            monthly_revenue[month_key]["revenue"] += o.total_price or 0
            monthly_revenue[month_key]["orders"] += 1
    monthly_sorted = sorted(monthly_revenue.values(), key=lambda x: x["month"])

    sales_analysis = {
        "total_orders": len(orders),
        "total_revenue": round(sum(revenues), 2) if revenues else 0,
        "avg_order_value": round(sum(revenues) / len(revenues), 2) if revenues else 0,
        "unique_customers": len(unique_customers),
        "financial_status": financial_status,
        "fulfillment_status": fulfillment_status,
        "top_customers": top_customers,
        "monthly_revenue": monthly_sorted,
    }

    # === Customer Analysis (Customers) ===
    marketing_opt_in = len([c for c in customers if c.accepts_marketing])
    marketing_opt_out = len(customers) - marketing_opt_in

    # Top locations
    locations = {}
    for c in customers:
        loc = f"{c.city}, {c.province}" if c.city and c.province else c.province or c.city or "Unknown"
        if loc != "Unknown":
            locations[loc] = locations.get(loc, 0) + 1
    top_locations = sorted(
        [{"location": loc, "count": count} for loc, count in locations.items()],
        key=lambda x: x["count"], reverse=True
    )[:10]

    total_spent = sum([c.total_spent for c in customers if c.total_spent])
    avg_customer_spend = round(total_spent / len(customers), 2) if customers else 0

    customer_analysis = {
        "total_customers": len(customers),
        "marketing_opt_in": {"subscribed": marketing_opt_in, "unsubscribed": marketing_opt_out},
        "top_locations": top_locations,
        "avg_customer_spend": avg_customer_spend,
        "total_spent": round(total_spent, 2),
    }

    return {
        "store": store_with_counts(store, db),
        "market_analysis": market_analysis,
        "sales_analysis": sales_analysis,
        "customer_analysis": customer_analysis,
    }


# ==================== Helpers ====================


def store_with_counts(store: Store, db: Session) -> dict:
    """Convert a Store model to a dict with product/order counts."""
    products_count = db.query(Product).filter(Product.store_id == store.id).count()
    orders_count = db.query(Order).filter(Order.store_id == store.id).count()
    customers_count = db.query(Customer).filter(Customer.store_id == store.id).count()
    return {
        "id": store.id,
        "user_id": store.user_id,
        "store_name": store.store_name,
        "store_url": store.store_url,
        "description": store.description,
        "shopify_domain": store.shopify_domain,
        "shopify_email": store.shopify_email,
        "shopify_plan": store.shopify_plan,
        "currency": store.currency,
        "country": store.country,
        "is_active": store.is_active,
        "connected_at": store.connected_at,
        "updated_at": store.updated_at,
        "products_count": products_count,
        "orders_count": orders_count,
        "customers_count": customers_count,
    }


def safe_float(val) -> float | None:
    if not val:
        return None
    try:
        return float(str(val).replace(",", "").strip())
    except (ValueError, TypeError):
        return None


def safe_int(val) -> int | None:
    if not val:
        return None
    try:
        return int(float(str(val).replace(",", "").strip()))
    except (ValueError, TypeError):
        return None


def safe_datetime(val) -> datetime | None:
    if not val:
        return None
    for fmt in ["%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%m/%d/%Y"]:
        try:
            return datetime.strptime(str(val).strip(), fmt)
        except ValueError:
            continue
    return None


def build_customer_name(row: dict) -> str:
    first = row.get("Billing Name", row.get("First Name", row.get("customer_name", "")))
    last = row.get("Last Name", "")
    name = f"{first} {last}".strip()
    return name if name else "Unknown"


def get_store_prediction(store_id: int, db: Session) -> dict:
    from langchain.chat_models import init_chat_model
    from langchain_core.messages import HumanMessage
    from app.api.chat.utils.config import ChatSettings
    import json
    
    # 1. Gather historical data using get_store_analytics
    try:
        analytics = get_store_analytics(store_id, db)
    except HTTPException:
        raise
        
    monthly_revenue = analytics.get("sales_analysis", {}).get("monthly_revenue", [])
    low_inventory = analytics.get("market_analysis", {}).get("low_inventory", [])
    top_customers = analytics.get("sales_analysis", {}).get("top_customers", [])
    avg_customer_spend = analytics.get("customer_analysis", {}).get("avg_customer_spend", 0)
    total_customers = analytics.get("customer_analysis", {}).get("total_customers", 0)
    
    # Format data for prompt
    data_summary = f"Monthly Revenue Trend: {monthly_revenue}\n"
    data_summary += f"Total Revenue: {analytics['sales_analysis'].get('total_revenue', 0)}\n"
    data_summary += f"Total Orders: {analytics['sales_analysis'].get('total_orders', 0)}\n"
    data_summary += f"Total Products: {analytics['market_analysis'].get('total_products', 0)}\n"
    data_summary += f"Low Inventory Products (stock < 10): {low_inventory}\n"
    data_summary += f"Total Customers: {total_customers}\n"
    data_summary += f"Average Customer Spend: {avg_customer_spend}\n"
    data_summary += f"Top Customers: {top_customers}\n"
    
    prompt_text = f"""
    You are an expert e-commerce financial analyst, growth marketer, and inventory strategist. 
    Analyze the following store data and predict the upcoming week's performance, stockout risks, and customer churn.
    
    Data:
    {data_summary}
    
    Return your response strictly as a JSON object matching this schema:
    {{
        "predicted_revenue": float, // Predicted revenue for next week
        "growth_percentage": string, // e.g. "+8.4%" or "-2.5%"
        "insights": list of strings, // 3 premium, highly actionable growth strategies or insights
        "inventory_forecast": [ // Forecast low-inventory items or products selling fast
            {{
                "product_title": string,
                "current_inventory": int,
                "days_to_sell_out": int, // predicted days before stock is gone
                "sales_velocity_weekly": int, // predicted items sold per week
                "risk_level": string // "High" (sells out < 7 days), "Medium" (sells out < 20 days), "Low"
            }}
        ],
        "churn_risk_analysis": {{
            "overall_churn_rate": string, // e.g. "12.5%"
            "risk_segments": [ // analysis of customer retention groups
                {{
                    "segment_name": string, // e.g. "VIP Customers", "One-time Buyers", etc.
                    "size": int, // number of customers
                    "churn_probability": string, // e.g. "25%"
                    "actionable_recommendation": string // highly specific email sequence idea or strategy to retain them
                }}
            ]
        }}
    }}
    Do not include markdown blocks (like ```json) or any other text outside the JSON object. Just return raw JSON.
    """
    
    CONFIG = ChatSettings()
    model = init_chat_model(
        f"{CONFIG.PROVIDER}:{CONFIG.MODEL}",
        api_key=CONFIG.API_KEY,
    )
    
    try:
        response = model.invoke([HumanMessage(content=prompt_text)])
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
        prediction = json.loads(content)
        return prediction
    except Exception as e:
        import sys
        print(f"Prediction Error: {e}", file=sys.stderr, flush=True)
        return {
            "predicted_revenue": 0.0,
            "growth_percentage": "0%",
            "insights": ["Not enough data to generate predictions."],
            "inventory_forecast": [],
            "churn_risk_analysis": {
                "overall_churn_rate": "0%",
                "risk_segments": []
            }
        }


