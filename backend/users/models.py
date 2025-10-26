from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.conf import settings
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)   # 👈 used as login field
    mobile = models.CharField(max_length=15, blank=True, null=True)
    tenth_school = models.CharField(max_length=255, blank=True, null=True)
    tenth_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    inter_college = models.CharField(max_length=255, blank=True, null=True)
    inter_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    passout_year = models.IntegerField(blank=True, null=True)
    current_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)  # PDF resume upload
    


    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"   #  THIS is where you check
    REQUIRED_FIELDS = ["full_name"]  #  extra fields required when creating superuser

    def __str__(self):
        return self.email


# -----------------------------
# New Skill model (linked to CustomUser)
# -----------------------------
class Skill(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="skills")
    name = models.CharField(max_length=100)
    verified = models.BooleanField(default=False)
    certificate = models.FileField(upload_to="certificates/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "name")
        ordering = ["-verified", "name"]

    def __str__(self):
        return f"{self.user.email} - {self.name} ({'Verified' if self.verified else 'Pending'})"
