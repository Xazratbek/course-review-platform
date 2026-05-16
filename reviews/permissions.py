from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsReviewOwner(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            return True
        else:
            return False

    def has_object_permission(self, request, view, obj):
        if request in SAFE_METHODS:
            return True

        return obj.user == request.user