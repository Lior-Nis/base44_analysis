import React, { useState, useEffect } from "react";
import { Course } from "@/api/entities";
import { Purchase } from "@/api/entities";
import { User } from "@/api/entities";
import { AppSettings } from "@/api/entities";
import { Bookmark } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BookOpen, Clock, DollarSign, Search, Filter, Star, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CourseCard from "../components/catalog/CourseCard";
import FilterBar from "../components/catalog/FilterBar";
import HeroSection from "../components/catalog/HeroSection";
import PaymentModal from "../components/catalog/PaymentModal";
import NotificationToast from "../components/catalog/NotificationToast";

export default function Catalog() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [appSettings, setAppSettings] = useState(null);
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    message: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me().catch(() => null);
      setUser(currentUser);
      
      // Load ALL active courses (not just approved ones)
      const courseDataPromise = Course.filter({ is_active: true }, "-created_date");
      const settingsDataPromise = AppSettings.list();
      
      let bookmarkDataPromise = Promise.resolve([]);
      if (currentUser) {
        bookmarkDataPromise = Bookmark.filter({ student_email: currentUser.email });
      }
      
      const [coursesResult, settingsResult, userBookmarksResult] = await Promise.all([courseDataPromise, settingsDataPromise, bookmarkDataPromise]);
      
      setCourses(coursesResult);
      if (settingsResult.length > 0) {
          setAppSettings(settingsResult[0]);
      }
      setBookmarks(userBookmarksResult);

    } catch (error) {
      console.error("Error loading initial data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedSubject, selectedGrade, selectedDifficulty, priceRange]);

  const filterCourses = () => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject === "all" || course.subject === selectedSubject;
      const matchesGrade = selectedGrade === "all" || course.grade_level === selectedGrade;
      const matchesDifficulty = selectedDifficulty === "all" || course.difficulty === selectedDifficulty;
      
      let matchesPrice = true;
      if (priceRange === "free") matchesPrice = course.price === 0;
      else if (priceRange === "under20") matchesPrice = course.price < 20;
      else if (priceRange === "20to50") matchesPrice = course.price >= 20 && course.price <= 50;
      else if (priceRange === "over50") matchesPrice = course.price > 50;

      return matchesSearch && matchesSubject && matchesGrade && matchesDifficulty && matchesPrice;
    });

    setFilteredCourses(filtered);
  };

  const handlePurchaseClick = (course) => {
    setSelectedCourse(course);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedCourse) return;
    
    try {
      const currentUser = await User.me(); 
      
      await Purchase.create({
        course_id: selectedCourse.id,
        student_email: currentUser.email,
        amount_paid: selectedCourse.price,
        status: 'pending_verification',
        access_granted: false
      });
      
      setShowPaymentModal(false);
      
      setNotification({
        show: true,
        type: 'success',
        message: 'The item has been added successfully!'
      });
      
    } catch (error) {
      console.error("Error creating purchase record:", error);
      
      setNotification({
        show: true,
        type: 'error',
        message: 'It did not add successfully!'
      });
    }
  };

  const handleBookmarkToggle = async (courseId, isCurrentlyBookmarked) => {
    if (!user) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please log in to bookmark courses.'
      });
      return;
    }

    try {
      if (isCurrentlyBookmarked) {
        const bookmarkToDelete = bookmarks.find(b => b.course_id === courseId && b.student_email === user.email);
        if (bookmarkToDelete) {
          await Bookmark.delete(bookmarkToDelete.id);
          setNotification({
            show: true,
            type: 'success',
            message: 'Bookmark removed successfully!'
          });
        }
      } else {
        await Bookmark.create({
          course_id: courseId,
          student_email: user.email,
        });
        setNotification({
          show: true,
          type: 'success',
          message: 'Course bookmarked successfully!'
        });
      }
      const updatedBookmarks = await Bookmark.filter({ student_email: user.email });
      setBookmarks(updatedBookmarks);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      setNotification({
        show: true,
        type: 'error',
        message: 'There was an error updating your bookmark. Please try again.'
      });
    }
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <HeroSection 
        totalCourses={courses.length}
        subjects={["mathematics", "science", "ela"]}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedGrade={selectedGrade}
          setSelectedGrade={setSelectedGrade}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />

        <div id="available-courses" className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Available Courses</h2>
            <p className="text-slate-600 mt-1">
              {filteredCourses.length} courses found
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="w-full h-48 bg-slate-200 rounded-xl mb-4"></div>
                    <div className="h-6 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded mb-4"></div>
                    <div className="h-10 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
            >
              <AnimatePresence>
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onPurchase={handlePurchaseClick}
                    isBookmarked={bookmarks.some(b => b.course_id === course.id)}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && filteredCourses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No courses found</h3>
            <p className="text-slate-500">Try adjusting your filters or search terms</p>
          </motion.div>
        )}
      </div>
      
      {/* Contact Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="text-sm text-slate-300">
              © Copyright all rights reserved
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-slate-300 leading-relaxed">
                For inquiries or academic correspondence, I welcome you to reach out via phone at{" "}
                <a href="tel:+13364931293" className="text-blue-400 hover:text-blue-300 font-medium">
                  (336) 493-1293
                </a>
                {" "}or email at{" "}
                <a href="mailto:alzfaryamr@gmail.com" className="text-blue-400 hover:text-blue-300 font-medium">
                  alzfaryamr@gmail.com
                </a>
                {" "}or{" "}
                <a href="mailto:ayaaldhaf@gmail.com" className="text-blue-400 hover:text-blue-300 font-medium">
                  ayaaldhaf@gmail.com
                </a>
                . I am committed to responding within 24 hours. Dedicated availability is offered on weekends—Saturday and Sunday—from 4:00 PM to 6:30 PM. Your engagement is always valued and encouraged.
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      {appSettings && (
        <PaymentModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          course={selectedCourse}
          settings={appSettings}
          onConfirm={handleConfirmPayment}
        />
      )}
      
      <NotificationToast
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={closeNotification}
      />
    </div>
  );
}