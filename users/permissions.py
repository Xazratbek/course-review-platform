from rest_framework.permissions import BasePermission

class IsProfileOwner(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return (request.user and request.user.is_authenticated) and request.user == obj
