from rest_framework import serializers
from .models import Skill, CustomUser

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "verified","certificate"]

class UserSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    resume = serializers.SerializerMethodField()
    class Meta:
        model = CustomUser
        fields = ["id", "full_name", "email", "resume","skills"]
    def get_resume(self, obj):
        if obj.resume:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.resume.url)
            return obj.resume.url
        return None

