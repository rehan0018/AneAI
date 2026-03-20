import logging
import time
from fastapi import Request

# Logging configuration simulating robust APM monitoring
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("backend_performance.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("aneAI-APM")

async def performance_monitor_middleware(request: Request, call_next):
    """
    Performance monitoring Hook logging request latency and inference execution time
    for scalable MLOps tracking. Supported by Phase 13 mandates.
    """
    start_time = time.time()
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"Method={request.method} Path={request.url.path} Status={response.status_code} Latency={process_time:.4f}s")
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"Method={request.method} Path={request.url.path} Latency={process_time:.4f}s Error={str(e)}")
        raise e
