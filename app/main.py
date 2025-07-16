import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

# Import routers
from app.routers import auth, users, songs, admin, artist, misc, files

# Import configuration and logging
from app.config import settings
from app.logging_config import setup_logging, log_request, log_response, get_logger
from app.database import create_tables, check_db_connection

# Setup logging
setup_logging()
logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging requests and responses"""
    
    async def dispatch(self, request: Request, call_next):
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Log request
        start_time = time.time()
        user_id = getattr(request.state, 'user_id', None) if hasattr(request.state, 'user_id') else None
        log_request(request_id, request.method, str(request.url), user_id)
        
        # Process request
        try:
            response = await call_next(request)
            
            # Log response
            duration = time.time() - start_time
            log_response(request_id, response.status_code, duration)
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"Request failed: {e}", extra={"request_id": request_id})
            log_response(request_id, 500, duration)
            raise


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting middleware"""
    
    def __init__(self, app, requests_per_minute: int = 100):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = {}
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/metrics"]:
            return await call_next(request)
            
        client_ip = request.client.host if request.client else "unknown"
        current_time = int(time.time() / 60)  # Current minute
        
        # Clean old entries
        self.requests = {k: v for k, v in self.requests.items() if k[1] >= current_time - 1}
        
        # Check rate limit
        key = (client_ip, current_time)
        self.requests[key] = self.requests.get(key, 0) + 1
        
        if self.requests[key] > self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )
        
        return await call_next(request)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting GSpotify API...")
    
    # Check database connection
    if not check_db_connection():
        logger.error("Failed to connect to database")
        raise Exception("Database connection failed")
    
    # Create tables
    create_tables()
    
    logger.info("GSpotify API started successfully")
    yield
    
    # Shutdown
    logger.info("Shutting down GSpotify API...")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A comprehensive music streaming platform API",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan
)

# Add security middleware
if settings.is_production:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"]  # Configure with your actual domains
    )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

# Add custom middleware
app.add_middleware(RequestLoggingMiddleware)
if settings.is_production:
    app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.rate_limit_requests)


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error: {exc}", extra={"request_id": getattr(request.state, 'request_id', None)})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "type": "validation_error"}
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning(f"HTTP error {exc.status_code}: {exc.detail}", 
                  extra={"request_id": getattr(request.state, 'request_id', None)})
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "type": "http_error"}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, 'request_id', None)
    logger.error(f"Unhandled exception: {exc}", extra={"request_id": request_id}, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error" if settings.is_production else str(exc),
            "type": "internal_error",
            "request_id": request_id
        }
    )


# Health check endpoints
@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    db_healthy = check_db_connection()
    
    return {
        "status": "healthy" if db_healthy else "unhealthy",
        "version": settings.app_version,
        "environment": settings.environment,
        "database": "connected" if db_healthy else "disconnected",
        "timestamp": time.time()
    }


@app.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with component status"""
    db_healthy = check_db_connection()
    
    # Add more health checks here (Redis, S3, etc.)
    components = {
        "database": "healthy" if db_healthy else "unhealthy",
        "api": "healthy"
    }
    
    overall_status = "healthy" if all(status == "healthy" for status in components.values()) else "unhealthy"
    
    return {
        "status": overall_status,
        "version": settings.app_version,
        "environment": settings.environment,
        "components": components,
        "timestamp": time.time()
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to GSpotify API",
        "version": settings.app_version,
        "environment": settings.environment,
        "docs": "/docs" if not settings.is_production else "Documentation disabled in production",
        "health": "/health"
    }


# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(songs.router)
app.include_router(admin.router)
app.include_router(artist.router)
app.include_router(misc.router)
app.include_router(files.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 