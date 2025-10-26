from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    send_otp_registration,
    send_otp_login,
    verify_otp,
    register,
    reset_password,
    login_view,
    get_user_details,
    get_skills,
    add_skill,
    delete_skill,
    verify_skill,
    upload_skill_certificate,
    upload_resume,
    download_resume,
    delete_resume,
    get_resume
)

urlpatterns = [
    path('send-otp-registration/', send_otp_registration, name='send_otp_registration'),
    path('send-otp-login/', send_otp_login, name='send_otp_login'),
    path('verify-otp/', verify_otp, name='verify_otp'),
    path('register/', register, name='register'),
    path('reset-password/', reset_password, name='reset_password'),
    path('login/', login_view, name='login'),
    path("get-user/", get_user_details, name="get_user"),

    # Skills APIs
    path("skills/", get_skills, name="get_skills"),
    path("skills/add/", add_skill, name="add_skill"),
    path("skills/delete/<int:skill_id>/", delete_skill, name="delete_skill"),
    path("skills/verify/<int:skill_id>/", verify_skill, name="verify_skill"),
    path("skills/upload/<int:skill_id>/", upload_skill_certificate, name="upload_certificate"),
    # Resume APIs
    path('resume/upload/', upload_resume, name='upload-resume'),
    path('resume/download/',download_resume, name='download-resume'),
    path('resume/delete/',delete_resume, name='delete-resume'),
    path('resume/get/',get_resume, name='get-resume'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
