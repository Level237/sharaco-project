# app/main.py
import logging
import sentry_sdk
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.core.config import settings
from app.core.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.db.engine import async_session  # ⚠️ adapte selon ton chemin
from app.services.overdueService import OverdueService
from app.services.reminderService import reminder_service
from app.services.pdfRenderer import pdf_renderer

# Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.client import router as client_router
from app.api.v1.template import router as template_router
from app.api.v1.document import router as document_router
from app.api.v1.reminder import router as reminder_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.project import router as project_router
from app.api.v1.activity import router as activity_router
from app.api.v1.billing_settings import router as billing_settings_router
from app.api.v1.payment_schedule import router as payment_schedule_router
from app.api.v1.cron import router as cron_router  # ⚠️ à ajouter si pas fait
from app.api.v1.specification import router as specification_router

sentry_sdk.init(
    dsn="https://ca3962273c5362a943c64e025a581466@o4508954538082304.ingest.us.sentry.io/4512193670217728",
    traces_sample_rate=1.0,
    environment="production"
)

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════
# APScheduler : jobs quotidiens
# ═══════════════════════════════════════════════════════════════
scheduler = AsyncIOScheduler(timezone="UTC")


async def _job_check_overdue():
    """Job quotidien : marque les factures en retard."""
    logger.info("⏰ Cron OVERDUE démarré")
    async with async_session() as db:
        summary = await OverdueService.check_overdue_invoices(db)
        logger.info(f"🔴 Cron OVERDUE terminé: {summary}")


async def _job_quote_reminders():
    """Job quotidien : relances devis (max 1 mail par devis et par passage)."""
    logger.info("📬 Cron relances devis démarré")
    async with async_session() as db:
        summary = await reminder_service.process_quote_reminders(db)
        logger.info(f"📬 Cron relances devis terminé: {summary}")


async def _job_due_invoices():
    """Job quotidien : rappels facture J-3 et J-1 au client."""
    logger.info("⏰ Cron rappels facture J-3/J-1 démarré")
    async with async_session() as db:
        summary = await reminder_service.check_due_invoices(db)
        logger.info(f"⏰ Cron rappels facture terminé: {summary}")


# ═══════════════════════════════════════════════════════════════
# Lifespan (remplace @app.on_event startup/shutdown)
# ═══════════════════════════════════════════════════════════════
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ===== STARTUP =====
    logger.info("🚀 Démarrage de Sharaco API")
    
    # Démarrer le scheduler
    scheduler.add_job(
        _job_check_overdue,
        CronTrigger(hour=18, minute=48),  # Tous les jours à 00:05 UTC
        id="check_overdue",
        replace_existing=True,
    )
    scheduler.add_job(
        _job_quote_reminders,
        CronTrigger(hour=7, minute=0),
        id="check_quote_reminders",
        replace_existing=True,
    )
    scheduler.add_job(
        _job_due_invoices,
        CronTrigger(hour=7, minute=10),
        id="check_due_invoices",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("⏰ Scheduler démarré (OVERDUE, devis 07:00 UTC, factures J-3/J-1 07:10 UTC)")

    # Préchauffer Chromium pour un rendu PNG/PDF immédiat
    asyncio.create_task(pdf_renderer.warmup())
    
    yield
    
    # ===== SHUTDOWN =====
    logger.info("🛑 Arrêt de Sharaco API")
    scheduler.shutdown()
    await pdf_renderer.close()


# ═══════════════════════════════════════════════════════════════
# App FastAPI
# ═══════════════════════════════════════════════════════════════
_expose_docs = settings.EXPOSE_API_DOCS
app = FastAPI(
    title="Sharaco API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if _expose_docs else None,
    redoc_url="/redoc" if _expose_docs else None,
    openapi_url="/openapi.json" if _expose_docs else None,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ═══════════════════════════════════════════════════════════════
# Middlewares
# ═══════════════════════════════════════════════════════════════
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.EFFECTIVE_SESSION_SECRET_KEY,
    https_only=settings.FRONTEND_URL.lower().startswith("https://"),
    max_age=3600,
    same_site="lax",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$|https?://(192\.168|10)\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════
# Routers
# ═══════════════════════════════════════════════════════════════
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(client_router, prefix="/api/v1/clients", tags=["clients"])
app.include_router(template_router, prefix="/api/v1/templates", tags=["templates"])
app.include_router(document_router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(reminder_router, prefix="/api/v1/reminders", tags=["reminders"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(project_router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(activity_router, prefix="/api/v1/activity", tags=["activity"])
app.include_router(billing_settings_router, prefix="/api/v1/billing-settings", tags=["billing-settings"])
app.include_router(payment_schedule_router, prefix="/api/v1/payment-schedule", tags=["payment-schedule"])
app.include_router(cron_router, prefix="/api/v1/cron", tags=["cron"])  # ← AJOUTÉ
app.include_router(specification_router, prefix="/api/v1/specifications", tags=["specifications"])


@app.get("/")
async def root():
    return {"message": "Welcome to Sharaco API", "version": "0.1.0"}