from django.shortcuts import render
from django.template.context_processors import request
from rest_framework import viewsets, permissions, status, mixins, filters, generics
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from .models import (
    Course, Chapter, Lesson, Discount, Enrollment,
    CourseRating, LessonProgress, Tag, CourseProgress
)
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, ChapterSerializer,
    LessonSerializer, DiscountSerializer, EnrollmentSerializer,
    CourseRatingSerializer, LessonProgressSerializer, TagSerializer,
    CourseEnrollSerializer, LessonProgressUpdateSerializer,
    CourseProgressSerializer, ChapterProgressSerializer,
    EnrollmentDetailSerializer, CourseInfoSerializer, CommentSerializer
)
from .filters import CourseFilter
from course.permissions import (
    IsInstructorOrReadOnly, IsEnrolledOrPreview,
    IsInstructorOrAdmin
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone

# Create your views here.

class TagListCreateView(APIView):
    permission_classes = [IsInstructorOrReadOnly]

    def get(self, request):
        tags = Tag.objects.all()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TagSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TagDetailView(APIView):
    permission_classes = [IsInstructorOrReadOnly]

    def get_object(self, slug):
        return get_object_or_404(Tag, slug=slug)

    def get(self, request, slug):
        tag = self.get_object(slug)
        serializer = TagSerializer(tag)
        return Response(serializer.data)

    def put(self, request, slug):
        tag = self.get_object(slug)
        serializer = TagSerializer(tag, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug):
        tag = self.get_object(slug)
        tag.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CourseListCreateView(APIView):
    permission_classes = [IsInstructorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CourseFilter
    search_fields = ['title', 'description', 'instructor__first_name', 'instructor__last_name', 'tags__name']
    ordering_fields = ['created_at', 'price', 'rating_avg', 'student_count']

    def get(self, request):
        courses = Course.objects.filter(status='published')
        # Apply filters, search, and ordering
        for backend in self.filter_backends:
            courses = backend().filter_queryset(request, courses, self)
        serializer = CourseListSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = CourseDetailSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(instructor=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CourseDetailView(APIView):
    permission_classes = [IsInstructorOrReadOnly]

    def get_object(self, slug):
        return get_object_or_404(Course, slug=slug)

    def get(self, request, slug):
        course = self.get_object(slug)
        include_chapters = request.query_params.get('include_chapters', 'false').lower() == 'true'
        include_comments = request.query_params.get('include_comments', 'false').lower() == 'true'
        
        data = {
            'info': CourseInfoSerializer(course).data
        }

        if include_chapters:
            data['chapters'] = ChapterSerializer(course.chapters.all(), many=True, context={'request': request}).data

        if include_comments:
            data['comments'] = CommentSerializer(course.comments.all(), many=True, context={'request': request}).data

        # Add user progress if user is authenticated and enrolled
        if request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
            if enrollment:
                data['user_progress'] = self.get_user_progress(request, request.user, course, enrollment)

        return Response(data)

    def get_user_progress(self, request, user, course, enrollment):
        progress_data = {}
        context_for_progress = {
            'request': request,
            'user': user,
            'course_pk': course.pk,
        }

        progress_data['enrollment'] = EnrollmentDetailSerializer(enrollment, context=context_for_progress).data

        course_progress_obj = CourseProgress(user, course)
        progress_data['course_progress'] = CourseProgressSerializer(course_progress_obj, context=context_for_progress).data

        chapters_for_progress = course.chapters.all().prefetch_related('lessons', 'lessons__progress')
        progress_data['chapter_progress'] = ChapterProgressSerializer(
            chapters_for_progress,
            many=True,
            context=context_for_progress
        ).data

        return progress_data

    def put(self, request, slug):
        course = self.get_object(slug)
        serializer = CourseInfoSerializer(course, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug):
        course = self.get_object(slug)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CourseEnrollView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        course = get_object_or_404(Course, slug=slug)
        serializer = CourseEnrollSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            enrollment = serializer.save()
            return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CourseRateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        course = get_object_or_404(Course, slug=slug)
        serializer = CourseRatingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            rating = serializer.save(course=course)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CourseProgressView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseProgressSerializer

    def get_object(self):
        course = get_object_or_404(Course, pk=self.kwargs['course_pk'])
        return CourseProgress(self.request.user, course)

class ChapterProgressView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChapterProgressSerializer

    def get_queryset(self):
        course = get_object_or_404(Course, pk=self.kwargs['course_pk'])
        return course.chapters.all().prefetch_related(
            'lessons',
            'lessons__progress'
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['course_pk'] = self.kwargs['course_pk']
        return context

class EnrollmentProgressView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EnrollmentDetailSerializer

    def get_object(self):
        return get_object_or_404(
            Enrollment,
            user=self.request.user,
            course_id=self.kwargs['course_pk']
        )

class UserCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("*****************")
        enrollments = Enrollment.objects.filter(user=request.user).select_related('course')
        courses = [enrollment.course for enrollment in enrollments]
        serializer = CourseListSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class CourseLearnView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Course, pk=pk)

    def get(self, request, pk):
        course = self.get_object(pk)
        enrollment = get_object_or_404(Enrollment, user=request.user, course=course)
        course_progress = CourseProgress(request.user, course)

        # Get chapters with lessons and progress
        chapters = []
        for chapter in course.chapters.all():
            chapter_data = ChapterSerializer(chapter, context={'request': request}).data
            chapter_data['progress_percentage'] = course_progress.get_chapter_progress(chapter)
            chapters.append(chapter_data)

        return Response({
            'course': CourseInfoSerializer(course).data,
            'chapters': chapters,
            'progress': course_progress.completion_percentage,
            'next_lesson': course_progress.get_next_lesson(),
            'total_duration': course_progress.total_duration,
            'watched_duration': course_progress.watched_duration,
            'last_activity': course_progress.last_activity
        })

class LessonProgressUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Lesson, pk=pk)

    def post(self, request, pk):
        lesson = self.get_object(pk)
        progress, created = LessonProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson
        )

        # Update watched duration
        if 'watched_duration' in request.data:
            progress.watched_duration = request.data['watched_duration']
        
        # Mark as completed if specified
        if request.data.get('mark_completed', False):
            progress.is_completed = True
            progress.watched_duration = lesson.duration
        
        progress.last_activity = timezone.now()
        progress.save()

        return Response(LessonProgressSerializer(progress).data)

class LessonNoteView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Lesson, pk=pk)

    def get(self, request, pk):
        lesson = self.get_object(pk)
        progress = get_object_or_404(LessonProgress, user=request.user, lesson=lesson)
        return Response({'notes': progress.notes})

    def post(self, request, pk):
        lesson = self.get_object(pk)
        progress, created = LessonProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson
        )
        
        note = request.data.get('note')
        if note:
            if not progress.notes:
                progress.notes = []
            progress.notes.append({
                'content': note,
                'timestamp': timezone.now().isoformat()
            })
            progress.save()
        
        return Response({'notes': progress.notes})

    def delete(self, request, pk):
        lesson = self.get_object(pk)
        progress = get_object_or_404(LessonProgress, user=request.user, lesson=lesson)
        note_index = request.data.get('note_index')
        
        if note_index is not None and 0 <= note_index < len(progress.notes):
            progress.notes.pop(note_index)
            progress.save()
        
        return Response({'notes': progress.notes})

class LessonBookmarkView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Lesson, pk=pk)

    def get(self, request, pk):
        lesson = self.get_object(pk)
        progress = get_object_or_404(LessonProgress, user=request.user, lesson=lesson)
        return Response({'bookmarks': progress.bookmarks})

    def post(self, request, pk):
        lesson = self.get_object(pk)
        progress, created = LessonProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson
        )
        
        bookmark = request.data.get('bookmark')
        if bookmark:
            if not progress.bookmarks:
                progress.bookmarks = []
            progress.bookmarks.append({
                'timestamp': bookmark.get('timestamp'),
                'title': bookmark.get('title'),
                'description': bookmark.get('description', '')
            })
            progress.save()
        
        return Response({'bookmarks': progress.bookmarks})

    def delete(self, request, pk):
        lesson = self.get_object(pk)
        progress = get_object_or_404(LessonProgress, user=request.user, lesson=lesson)
        bookmark_index = request.data.get('bookmark_index')
        
        if bookmark_index is not None and 0 <= bookmark_index < len(progress.bookmarks):
            progress.bookmarks.pop(bookmark_index)
            progress.save()
        
        return Response({'bookmarks': progress.bookmarks})
