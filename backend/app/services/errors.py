class ServiceError(Exception):
    """Base class for service-level errors (no FastAPI dependency)."""


class NotFoundError(ServiceError):
    pass


class ValidationError(ServiceError):
    pass


class UnauthorizedError(ServiceError):
    pass


class ConflictError(ServiceError):
    pass
