from django.contrib.auth import get_user_model, authenticate, login as django_login
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
import random, json
from .models import Skill
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from .models import Skill
from .serializers import SkillSerializer
from django.conf import settings


User = get_user_model()

# Temporary storage for OTPs
otp_storage = {}


# ------------------ OTP for Registration ------------------
@csrf_exempt
def send_otp_registration(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            if not email:
                return JsonResponse({"success": False, "message": "Email is required."})

            #  check with email (not username)
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    "success": False,
                    "message": "Email already registered. Please login instead."
                })

            otp = str(random.randint(100000, 999999))
            otp_storage[email] = otp

            send_mail(
                subject="Your Registration OTP",
                message=f"Your OTP is: {otp}",
                from_email="moizmohd0728@gmail.com",
                recipient_list=[email],
                fail_silently=False,
            )
            return JsonResponse({"success": True, "message": "OTP sent successfully."})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})
    return JsonResponse({"success": False, "message": "Invalid request method."})


# ------------------ OTP for Login ------------------
@csrf_exempt
def send_otp_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            if not email:
                return JsonResponse({"success": False, "message": "Email is required."})

            if not User.objects.filter(email=email).exists():
                return JsonResponse({
                    "success": False,
                    "message": "Email not registered. Please register first."
                })

            otp = str(random.randint(100000, 999999))
            otp_storage[email] = otp

            send_mail(
                subject="Your Login OTP",
                message=f"Your OTP is: {otp}",
                from_email="moizmohd0728@gmail.com",
                recipient_list=[email],
                fail_silently=False,
            )
            return JsonResponse({"success": True, "message": "OTP sent successfully."})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})
    return JsonResponse({"success": False, "message": "Invalid request method."})


# ------------------ Verify OTP ------------------
@csrf_exempt
def verify_otp(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            otp = data.get("otp")

            if otp_storage.get(email) == otp:
                return JsonResponse({"success": True, "message": "OTP verified successfully."})
            else:
                return JsonResponse({"success": False, "message": "Invalid OTP."})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})
    return JsonResponse({"success": False, "message": "Invalid request method."})


# ------------------ Register ------------------
@csrf_exempt
def register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            full_name = data.get('fullName')
            email = data.get('email')
            mobile = data.get('mobile')
            tenth_school = data.get('school10')
            tenth_percentage = data.get('percent10')
            inter_college = data.get('college12')
            inter_percentage = data.get('percent12')
            passout_year = data.get('passoutYear')
            current_percentage = data.get('currentPercent')
            password = data.get('password')
            confirm_password = data.get('confirmPassword')
            otp = data.get('otp')

            # Validate required fields
            if not all([full_name, email, mobile, password, confirm_password, otp]):
                return JsonResponse({"success": False, "message": "Missing required fields."})

            if password != confirm_password:
                return JsonResponse({"success": False, "message": "Passwords do not match."})

            # Check OTP validity (assumes you have otp_storage dict elsewhere)
            if otp_storage.get(email) != otp:
                return JsonResponse({"success": False, "message": "Invalid or missing OTP."})

            # Check for existing user
            if User.objects.filter(email=email).exists():
                return JsonResponse({"success": False, "message": "User already exists. Please login."})

            # Create user with all details
            user = User.objects.create(
                email=email,
                full_name=full_name,
                mobile=mobile,
                tenth_school=tenth_school,
                tenth_percentage=tenth_percentage,
                inter_college=inter_college,
                inter_percentage=inter_percentage,
                passout_year=passout_year,
                current_percentage=current_percentage,
                password=make_password(password),
            )

            # Clear OTP after successful registration
            otp_storage.pop(email, None)

            return JsonResponse({"success": True, "message": "User registered successfully!"})

        except IntegrityError as ie:
            return JsonResponse({"success": False, "message": "Email already exists."})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})

    return JsonResponse({"success": False, "message": "Invalid request method."})



# ------------------ Reset Password ------------------
@csrf_exempt
def reset_password(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            new_password = data.get("newPassword")
            confirm_password = data.get("confirmPassword")

            if not all([email, new_password, confirm_password]):
                return JsonResponse({"success": False, "message": "Missing fields."})

            if new_password != confirm_password:
                return JsonResponse({"success": False, "message": "Passwords do not match."})

            if len(new_password) < 6:
                return JsonResponse({"success": False, "message": "Password must be at least 6 characters."})

            try:
                user = User.objects.get(email=email)
                user.password = make_password(new_password)
                user.save()
                return JsonResponse({"success": True, "message": "Password reset successfully."})
            except User.DoesNotExist:
                return JsonResponse({"success": False, "message": "User not found."})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})
    return JsonResponse({"success": False, "message": "Invalid request method."})


# ------------------ Login ------------------
from django.contrib.auth import get_user_model, authenticate, login as django_login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
import json

User = get_user_model()

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return JsonResponse({"success": False, "message": "Email and password are required."})

            user = authenticate(request, email=email, password=password)
            if user is not None:
                django_login(request, user)
                refresh = RefreshToken.for_user(user)

                return JsonResponse({
                    "success": True,
                    "message": "Logged in successfully.",
                    "full_name": user.full_name,
                    "email": user.email,
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                })
            else:
                return JsonResponse({"success": False, "message": "Invalid email or password."})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})
    return JsonResponse({"success": False, "message": "Invalid request method."})




# Get_user_details for side bar
from .serializers import UserSerializer
from django.http import JsonResponse

def get_user_details(request):
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user, context={'request': request})  
        return JsonResponse(serializer.data, safe=False)
    return JsonResponse({"success": False, "message": "Not logged in"})

# ------------------ Skills ------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_skills(request):
    """Get all skills of logged-in user"""
    skills = request.user.skills.all()
    serializer = SkillSerializer(skills, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_skill(request):
    """Add a new skill for the logged-in user"""
    name = request.data.get("name")
    if not name:
        return Response({"error": "Skill name is required"}, status=400)

    # Prevent duplicate skill for same user
    if request.user.skills.filter(name__iexact=name).exists():
        return Response({"error": "Skill already exists"}, status=400)

    skill = Skill.objects.create(user=request.user, name=name, verified=False)
    return Response(SkillSerializer(skill).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_skill(request, skill_id):
    """Remove a skill"""
    try:
        skill = Skill.objects.get(id=skill_id, user=request.user)
        skill.delete()
        return Response({"message": "Skill removed successfully"})
    except Skill.DoesNotExist:
        return Response({"error": "Skill not found"}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_skill(request, skill_id):
    """Verify a skill manually (later link to certificate check)"""
    try:
        skill = Skill.objects.get(id=skill_id, user=request.user)
        skill.verified = True
        skill.save()
        return Response({"message": "Skill verified", "skill": SkillSerializer(skill).data})
    except Skill.DoesNotExist:
        return Response({"error": "Skill not found"}, status=404)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_skill_certificate(request, skill_id):
    skill = get_object_or_404(Skill, id=skill_id, user=request.user)
    file_obj = request.FILES.get('verification_file')

    if not file_obj:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    skill.certificate = file_obj
    skill.save()

    serializer = SkillSerializer(skill, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)
# ------------------ Resume Upload/Download/Delete ------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_resume(request):
    user = request.user
    file_obj = request.FILES.get('resume')

    if not file_obj:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
    if not file_obj.name.lower().endswith('.pdf'):
        return Response({'error': 'Only PDF files allowed'}, status=status.HTTP_400_BAD_REQUEST)

    # Delete existing resume file if any
    if user.resume:
        user.resume.delete(save=False)

    user.resume = file_obj
    user.save()

    absolute_url = request.build_absolute_uri(user.resume.url)
    return Response({'message': 'Resume uploaded successfully', 'resume_url': absolute_url}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
#------------------ Resume Download ------------------
def download_resume(request):
    user = request.user
    if not user.resume:
        raise Http404

    response = FileResponse(user.resume.open('rb'), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{user.resume.name.split("/")[-1]}"'
    return response


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
#------------------ Resume Delete ------------------
def delete_resume(request):
    user = request.user
    if not user.resume:
        return Response({'error': 'No resume to delete'}, status=status.HTTP_404_NOT_FOUND)

    user.resume.delete(save=True)
    return Response({'message': 'Resume deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_resume(request):
    user = request.user
    if user.resume:
        request_obj = request  # to build absolute URI
        resume_url = request_obj.build_absolute_uri(user.resume.url)
        return Response({"resume_url": resume_url})
    else:
        return Response({"resume_url": None})
