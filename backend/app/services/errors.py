class ServiceError(Exception):
    """Base class for service-level errors (no FastAPI dependency).
    Note: stable API error codes are mapped at the route layer via http_error(...).
    """


class NotFoundError(ServiceError):
    pass


class ValidationError(ServiceError):
    pass


class UnauthorizedError(ServiceError):
    pass


class ConflictError(ServiceError):
    pass


class RateLimitError(ServiceError):
    pass
