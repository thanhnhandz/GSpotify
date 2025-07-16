import logging
import logging.config
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional
from app.config import settings


# ANSI color codes for beautiful terminal output
class Colors:
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    
    # Levels
    DEBUG = '\033[36m'    # Cyan
    INFO = '\033[32m'     # Green
    WARNING = '\033[33m'  # Yellow
    ERROR = '\033[31m'    # Red
    CRITICAL = '\033[35m' # Magenta
    
    # Components
    TIMESTAMP = '\033[90m'  # Bright black (gray)
    LOGGER_NAME = '\033[94m'  # Bright blue
    MODULE = '\033[96m'     # Bright cyan
    MESSAGE = '\033[97m'    # Bright white
    SUCCESS = '\033[92m'    # Bright green
    REQUEST = '\033[95m'    # Bright magenta


class ColoredFormatter(logging.Formatter):
    """Beautiful colored formatter for console output"""
    
    LEVEL_COLORS = {
        'DEBUG': Colors.DEBUG,
        'INFO': Colors.INFO,
        'WARNING': Colors.WARNING,
        'ERROR': Colors.ERROR,
        'CRITICAL': Colors.CRITICAL
    }
    
    def format(self, record: logging.LogRecord) -> str:
        # Get color for level
        level_color = self.LEVEL_COLORS.get(record.levelname, Colors.RESET)
        
        # Format timestamp
        timestamp = datetime.fromtimestamp(record.created).strftime('%H:%M:%S.%f')[:-3]
        
        # Special handling for SQL logs - make them more compact
        if 'sqlalchemy.engine' in record.name:
            if 'CREATE TABLE' in record.getMessage() or 'CREATE INDEX' in record.getMessage():
                # Make table creation logs more readable
                message = record.getMessage().replace('\n', ' ').replace('\t', ' ')
                while '  ' in message:
                    message = message.replace('  ', ' ')
                formatted_parts = [
                    f"{Colors.TIMESTAMP}{timestamp}{Colors.RESET}",
                    f"{Colors.SUCCESS}SQL{Colors.RESET}",
                    f"{Colors.DIM}{message[:80]}{'...' if len(message) > 80 else ''}{Colors.RESET}"
                ]
            elif '[no key' in record.getMessage() or 'COMMIT' in record.getMessage():
                # Skip or make very brief for execution logs
                formatted_parts = [
                    f"{Colors.TIMESTAMP}{timestamp}{Colors.RESET}",
                    f"{Colors.DIM}SQL{Colors.RESET}",
                    f"{Colors.DIM}{record.getMessage()}{Colors.RESET}"
                ]
            else:
                # Regular SQL logs
                formatted_parts = [
                    f"{Colors.TIMESTAMP}{timestamp}{Colors.RESET}",
                    f"{level_color}SQL{Colors.RESET}",
                    f"{Colors.MESSAGE}{record.getMessage()}{Colors.RESET}"
                ]
        else:
            # Regular application logs
            logger_name = record.name.split('.')[-1] if '.' in record.name else record.name
            
            # Create beautiful formatted message
            formatted_parts = [
                f"{Colors.TIMESTAMP}{timestamp}{Colors.RESET}",
                f"{level_color}{record.levelname:<8}{Colors.RESET}",
                f"{Colors.LOGGER_NAME}{logger_name:<12}{Colors.RESET}",
                f"{Colors.MESSAGE}{record.getMessage()}{Colors.RESET}"
            ]
        
        # Add extra info if available
        extra_info = []
        request_id = getattr(record, 'request_id', None)
        if request_id:
            extra_info.append(f"req_id={request_id[:8]}")
        
        user_id = getattr(record, 'user_id', None)
        if user_id:
            extra_info.append(f"user={user_id}")
        
        duration = getattr(record, 'duration', None)
        if duration is not None:
            duration_color = Colors.SUCCESS if duration < 1.0 else Colors.WARNING if duration < 3.0 else Colors.ERROR
            extra_info.append(f"duration={duration_color}{duration:.3f}s{Colors.RESET}")
        
        status_code = getattr(record, 'status_code', None)
        if status_code is not None:
            if 200 <= status_code < 300:
                status_color = Colors.SUCCESS
                status_icon = "✅"
            elif 300 <= status_code < 400:
                status_color = Colors.WARNING
                status_icon = "↩️"
            else:
                status_color = Colors.ERROR
                status_icon = "❌"
            extra_info.append(f"{status_icon} {status_color}{status_code}{Colors.RESET}")
        
        if extra_info:
            formatted_parts.append(f"{Colors.DIM}[{' '.join(extra_info)}]{Colors.RESET}")
        
        # Add module info for errors
        if record.levelno >= logging.ERROR and 'sqlalchemy' not in record.name:
            formatted_parts.append(f"{Colors.DIM}({record.module}:{record.lineno}){Colors.RESET}")
        
        return " ".join(formatted_parts)


class CompactJSONFormatter(logging.Formatter):
    """More readable JSON formatter for development"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "time": datetime.fromtimestamp(record.created).strftime('%H:%M:%S.%f')[:-3],
            "level": record.levelname,
            "logger": record.name.split('.')[-1],  # Only last part of logger name
            "message": record.getMessage(),
        }
        
        # Add extra fields if present
        user_id = getattr(record, 'user_id', None)
        if user_id:
            log_entry['user'] = user_id
        
        request_id = getattr(record, 'request_id', None)
        if request_id:
            log_entry['req_id'] = request_id[:8]  # Shorter request ID
        
        endpoint = getattr(record, 'endpoint', None)
        if endpoint:
            log_entry['endpoint'] = endpoint
        
        duration = getattr(record, 'duration', None)
        if duration is not None:
            log_entry['duration'] = f"{duration:.3f}s"
        
        status_code = getattr(record, 'status_code', None)
        if status_code is not None:
            log_entry['status'] = status_code
            
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
            
        return json.dumps(log_entry, separators=(',', ':'))


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add extra fields if present
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = getattr(record, 'user_id')
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = getattr(record, 'request_id')
        if hasattr(record, 'endpoint'):
            log_entry['endpoint'] = getattr(record, 'endpoint')
            
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
            
        return json.dumps(log_entry)


def setup_logging():
    """Configure logging for the application"""
    
    # Determine log level
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    
    # Choose formatter based on environment and format
    if settings.log_format.lower() == "json":
        if settings.is_development:
            formatter = CompactJSONFormatter()  # More readable JSON for dev
        else:
            formatter = JSONFormatter()  # Full JSON for production
    elif settings.log_format.lower() == "colored" or (settings.is_development and sys.stdout.isatty()):
        # Use colored formatter for development when terminal supports colors
        formatter = ColoredFormatter()
    else:
        # Fallback to simple text formatter
        formatter = logging.Formatter(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%H:%M:%S"
        )
    
    # Configure handlers
    handlers = []
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    handlers.append(console_handler)
    
    # File handler for production
    if settings.is_production:
        file_handler = logging.FileHandler("/var/log/gspotify/app.log")
        file_handler.setFormatter(JSONFormatter())  # Always JSON for files
        file_handler.setLevel(log_level)
        handlers.append(file_handler)
        
        # Error file handler
        error_handler = logging.FileHandler("/var/log/gspotify/error.log")
        error_handler.setFormatter(JSONFormatter())
        error_handler.setLevel(logging.ERROR)
        handlers.append(error_handler)
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        handlers=handlers,
        force=True
    )
    
    # Set specific loggers with cleaner output
    logging.getLogger("uvicorn").setLevel(log_level)
    
    # Make SQLAlchemy logs less verbose but still informative
    sql_logger = logging.getLogger("sqlalchemy.engine")
    if settings.debug:
        sql_logger.setLevel(logging.INFO)
    else:
        sql_logger.setLevel(logging.WARNING)
    
    # Silence some noisy loggers
    if settings.is_production:
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
        logging.getLogger("httpx").setLevel(logging.WARNING)
        logging.getLogger("botocore").setLevel(logging.WARNING)
        logging.getLogger("boto3").setLevel(logging.WARNING)
    else:
        # In development, make uvicorn access logs less verbose
        logging.getLogger("uvicorn.access").setLevel(logging.INFO)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the given name"""
    return logging.getLogger(name)


# Request logging middleware helper
def log_request(request_id: str, method: str, url: str, user_id: Optional[str] = None):
    """Log incoming request with beautiful formatting"""
    logger = get_logger("gspotify.requests")
    
    # Add emoji and formatting for development
    if settings.is_development and settings.log_format != "json":
        emoji = "🔵" if method == "GET" else "🟢" if method == "POST" else "🟡" if method == "PUT" else "🔴"
        logger.info(
            f"{emoji} {method} {url}",
            extra={
                "request_id": request_id,
                "user_id": user_id,
                "endpoint": f"{method} {url}"
            }
        )
    else:
        logger.info(
            f"{method} {url}",
            extra={
                "request_id": request_id,
                "user_id": user_id,
                "endpoint": f"{method} {url}"
            }
        )


def log_response(request_id: str, status_code: int, duration: float):
    """Log outgoing response with beautiful formatting"""
    logger = get_logger("gspotify.responses")
    
    # Add emoji and formatting for development
    if settings.is_development and settings.log_format != "json":
        if 200 <= status_code < 300:
            emoji = "✅"
        elif 300 <= status_code < 400:
            emoji = "↩️"
        else:
            emoji = "❌"
            
        logger.info(
            f"{emoji} Response {status_code} in {duration:.3f}s",
            extra={
                "request_id": request_id,
                "status_code": status_code,
                "duration": duration
            }
        )
    else:
        logger.info(
            f"Response {status_code} in {duration:.3f}s",
            extra={
                "request_id": request_id,
                "status_code": status_code,
                "duration": duration
            }
        ) 