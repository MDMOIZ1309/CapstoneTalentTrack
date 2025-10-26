from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Skill
from django.utils.html import format_html



class SkillInline(admin.TabularInline):   #  show skills inline with user
    model = Skill
    extra = 1   # number of empty rows to show for new skills


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = (
        "email", "full_name", "mobile",
        "tenth_school", "tenth_percentage",
        "inter_college", "inter_percentage",
        "passout_year", "current_percentage",
        "resume_link",   # custom method to show resume link
        "is_staff", "is_active",
    )
    search_fields = ("email", "full_name", "mobile")
    ordering = ("email",)

    fieldsets = (
        
        (None, {"fields": ("email", "password", "full_name", "mobile","resume")}),
        ("10th Details", {"fields": ("tenth_school", "tenth_percentage")}),
        ("Inter/Diploma Details", {"fields": ("inter_college", "inter_percentage")}),
        ("Degree Details", {"fields": ("passout_year", "current_percentage")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "groups", "user_permissions")}),
    )

    inlines = [SkillInline]   # 👈 include skills inside user admin
    def resume_link(self, obj):
        if obj.resume:
            return format_html('<a href="{}" target="_blank">View Resume</a>', obj.resume.url)
        return "No Resume"
    resume_link.short_description = "Resume"


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("user", "name", "verified", "created_at", "verified_at")
    list_filter = ("verified",)
    search_fields = ("name", "user__email")



# Register CustomUser with the updated admin
admin.site.register(CustomUser, CustomUserAdmin)
