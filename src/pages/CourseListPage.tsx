import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useCourse } from "@/contexts/CourseContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronDown } from "lucide-react";
import CourseCard from "@/components/course/CourseCard";
import CourseCardSkeleton from "@/components/course/CourseCardSkeleton";
import PaginationControls from "@/components/ui/pagination-controls";
import { Course } from "@/types/course";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { coursesApi } from "@/lib/api";

const CourseListPage = () => {
  const { courses, isLoading, pagination } = useCourse();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedCourses, setPaginatedCourses] = useState<Course[]>([]);
  const [currentPagination, setCurrentPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Collect all unique categories
  const allCategories = Array.from(
    new Set(courses.flatMap((course) => course.categories))
  );

  // Collect all unique levels
  const allLevels = Array.from(
    new Set(courses.map((course) => course.level).filter(Boolean))
  );

  // Load paginated courses with filters
  const loadCoursesWithFilters = async (page: number = 1) => {
    try {
      const response = await coursesApi.getAll(page, 12);
      let result = [...response.results];
      
      console.log('CourseListPage Debug - Raw API Response:', response.results.map(course => ({
        id: course.id,
        title: course.title,
        price: course.price,
        discounted_price: course.discounted_price,
        discount_percentage: course.discount_percentage
      })));
      
      // Apply client-side filters
      if (searchTerm) {
        result = result.filter(
          (course) =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedCategories.length > 0) {
        result = result.filter((course) =>
          course.categories.some((cat) => selectedCategories.includes(cat))
        );
      }
      
      if (selectedLevels.length > 0) {
        result = result.filter((course) => 
          course.level && selectedLevels.includes(course.level)
        );
      }
      
      if (priceRange === "free") {
        result = result.filter((course) => course.price === 0);
      } else if (priceRange === "paid") {
        result = result.filter((course) => course.price > 0);
      }
      
      setPaginatedCourses(result);
      setCurrentPagination({
        currentPage: response.current_page,
        totalPages: response.total_pages,
        totalCount: result.length, // Use filtered count
        hasNext: !!response.next,
        hasPrevious: !!response.previous
      });
    } catch (error) {
      console.error('Error loading courses:', error);
      setPaginatedCourses([]);
    }
  };

  // Load courses on initial render and when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadCoursesWithFilters(1);
  }, [searchTerm, selectedCategories, selectedLevels, priceRange]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadCoursesWithFilters(page);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handlePriceChange = (value: string) => {
    setPriceRange(value);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setPriceRange("all");
    setSearchTerm("");
  };

  const levelTranslation = {
    "beginner": "مقدماتی",
    "intermediate": "متوسط",
    "advanced": "پیشرفته"
  };

  return (
    <Layout>
      <div className="trader-container py-6">
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h1 className="text-2xl font-bold mb-6">دوره‌های آموزشی</h1>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute top-3 right-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="جستجو در دوره‌ها..."
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading.courses}
              />
            </div>
            
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex gap-2" disabled={isLoading.courses}>
                    <Filter className="h-4 w-4" />
                    فیلترها
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    {/* Category filter */}
                    <div>
                      <h3 className="font-medium mb-2">دسته‌بندی</h3>
                      <div className="space-y-2">
                        {allCategories.map((category) => (
                          <div key={category} className="flex items-center">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                            />
                            <Label
                              htmlFor={`category-${category}`}
                              className="mr-2 text-sm"
                            >
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Level filter */}
                    <div>
                      <h3 className="font-medium mb-2">سطح</h3>
                      <div className="space-y-2">
                        {allLevels.map((level) => level && (
                          <div key={level} className="flex items-center">
                            <Checkbox
                              id={`level-${level}`}
                              checked={selectedLevels.includes(level)}
                              onCheckedChange={() => toggleLevel(level)}
                            />
                            <Label
                              htmlFor={`level-${level}`}
                              className="mr-2 text-sm"
                            >
                              {levelTranslation[level as keyof typeof levelTranslation] || level}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Price filter */}
                    <div>
                      <h3 className="font-medium mb-2">قیمت</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Checkbox
                            id="price-all"
                            checked={priceRange === "all"}
                            onCheckedChange={() => handlePriceChange("all")}
                          />
                          <Label
                            htmlFor="price-all"
                            className="mr-2 text-sm"
                          >
                            همه
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="price-free"
                            checked={priceRange === "free"}
                            onCheckedChange={() => handlePriceChange("free")}
                          />
                          <Label
                            htmlFor="price-free"
                            className="mr-2 text-sm"
                          >
                            رایگان
                          </Label>
                        </div>
                        {/* <div className="flex items-center">
                          <Checkbox
                            id="price-paid"
                            checked={priceRange === "paid"}
                            onCheckedChange={() => handlePriceChange("paid")}
                          />
                          <Label
                            htmlFor="price-paid"
                            className="mr-2 text-sm"
                          >
                            پولی
                          </Label>
                        </div> */}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      پاک کردن فیلترها
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Selected Filters */}
          {(selectedCategories.length > 0 || selectedLevels.length > 0 || priceRange !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedCategories.map((category) => (
                <div
                  key={`selected-${category}`}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {category}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {selectedLevels.map((level) => (
                <div
                  key={`selected-${level}`}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {levelTranslation[level as keyof typeof levelTranslation] || level}
                  <button
                    onClick={() => toggleLevel(level)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {priceRange !== "all" && (
                <div
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {priceRange === "free" ? "رایگان" : "پولی"}
                  <button
                    onClick={() => setPriceRange("all")}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Courses Grid */}
        <div className="mb-8">
          {isLoading.courses ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <CourseCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          ) : paginatedCourses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    instructor={course.instructor}
                    thumbnail={course.thumbnail}
                    price={course.price}
                    isFree={course.price === 0}
                    is_enrolled={course.is_enrolled}
                    discounted_price={course.discounted_price}
                    discount_percentage={course.discount_percentage}
                    requires_identity_verification={course.requires_identity_verification}
                  />
                ))}
              </div>
              
              {/* Pagination Controls */}
              <div className="mt-8">
                <PaginationControls
                  pagination={currentPagination}
                  onPageChange={handlePageChange}
                  isLoading={isLoading.courses}
                  itemsName="دوره"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">هیچ دوره‌ای با فیلترهای انتخاب شده یافت نشد.</p>
              <Button 
                variant="link" 
                onClick={clearFilters}
                className="mt-2"
              >
                پاک کردن فیلترها
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CourseListPage;
