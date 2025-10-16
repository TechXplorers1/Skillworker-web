import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ref, get, child, push, set, onValue, query, orderByChild, equalTo } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from '../firebase';
import BookingConfirmationPopup from '../components/BookingConfirmation';

// Helper function to generate time slots
const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 19; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = new Date();
            time.setHours(hour, minute, 0, 0);
            const formattedTime = time.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            slots.push(formattedTime);
        }
    }
    return slots.slice(0, -1); // Ends at 7:00 PM
};

// Helper function to parse time strings like "2:30 PM" into 24-hour format
const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) {
        hours += 12;
    }
    if (modifier === 'AM' && hours === 12) { // Handle 12 AM (midnight)
        hours = 0;
    }
    return { hours, minutes };
};

// --- NEW HELPER FUNCTION TO FILTER SLOTS BASED ON TECHNICIAN PREFERENCE ---
const getFilteredTimeSlots = (allSlots, preference) => {
    // If no preference is set or it's 'any slot', return all slots
    if (!preference || preference === 'Ok With Any Time Slot') {
        return allSlots;
    }

    // Filter slots based on the preference string
    return allSlots.filter(slot => {
        const { hours } = parseTime(slot);
        
        if (preference.includes('Morning')) {
            // Morning: 8:00 AM up to (but not including) 12:00 PM
            return hours >= 8 && hours < 12;
        }
        if (preference.includes('Afternoon')) {
            // Afternoon: 12:00 PM up to (but not including) 4:00 PM
            return hours >= 12 && hours < 16;
        }
        if (preference.includes('Evening')) {
            // Evening: 4:00 PM up to and including 7:00 PM
            return hours >= 16 && hours <= 19;
        }

        // If preference is something unexpected, return no slots by default
        return false; 
    });
};


const BookingPage = () => {
    const { serviceName, technicianId } = useParams();
    const navigate = useNavigate();

    // State declarations
    const [technician, setTechnician] = useState(null);
    const [serviceDetails, setServiceDetails] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCalendarPopup, setShowCalendarPopup] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [instructionsError, setInstructionsError] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [bookingId, setBookingId] = useState('');
    const [creatingBooking, setCreatingBooking] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    
    // NEW STATE: For profile completion popup
    const [showProfilePopup, setShowProfilePopup] = useState(false);

    const handleInstructionsChange = (e) => {
        const value = e.target.value;
        const hasTenConsecutiveDigits = /\d{10}/.test(value);

        if (hasTenConsecutiveDigits) {
            setInstructionsError('Error: Sharing phone numbers in the instructions is not allowed.');
        } else {
            setSpecialInstructions(value);
            if (instructionsError) {
                setInstructionsError('');
            }
        }
    };

    const allTimeSlots = generateTimeSlots();
    const availableTimeSlots = getFilteredTimeSlots(allTimeSlots, technician?.availableTimings);

    // Helper function to create a date object from YYYY-MM-DD treating it as UTC midnight
    const createUtcDate = (dateStr) => {
        if (!dateStr) return null;
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    };

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                fetchServiceData();
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribeAuth();
    }, [navigate]);

    useEffect(() => {
        if (!technicianId) return;

        const technicianRef = ref(database, `users/${technicianId}`);
        const unsubscribeTechnician = onValue(technicianRef, (snapshot) => {
            const fetchedTechnician = snapshot.val();
            if (fetchedTechnician) {
                setTechnician(fetchedTechnician);
                setLoading(false);
            } else {
                console.log("Technician not found.");
                setLoading(false);
            }
        }, (error) => {
            console.error("Error fetching real-time technician data:", error);
            setLoading(false);
        });
        return () => unsubscribeTechnician();
    }, [technicianId]);

    // --- LOGIC UPDATED HERE ---
    // This effect now checks the status and timestamp of bookings.
    useEffect(() => {
        if (!technicianId || !selectedDate) {
            setBookedSlots([]);
            return;
        }

        const bookingsRef = ref(database, 'bookings');
        const bookingsQuery = query(
            bookingsRef,
            orderByChild('technicianId'),
            equalTo(technicianId)
        );

        const unsubscribeBookings = onValue(bookingsQuery, (snapshot) => {
            const now = Date.now();
            const TEN_MINUTES_IN_MS = 10 * 60 * 1000;
            const slots = [];

            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const booking = childSnapshot.val();

                    if (booking.date === selectedDate) {
                        const status = (booking.status || 'pending').toLowerCase();
                        const timestamp = booking.timestamp;

                        // A slot is booked if it's 'accepted' OR if it's 'pending'
                        // and was created less than 10 minutes ago.
                        const isAccepted = status === 'accepted';
                        const isRecentPending = status === 'pending' && (now - timestamp < TEN_MINUTES_IN_MS);

                        if (isAccepted || isRecentPending) {
                            slots.push(booking.timing);
                        }
                    }
                });
            }
            setBookedSlots(slots);
        });

        // Set up an interval to re-check pending slots every minute
        // This ensures that expired pending slots will become available without a page refresh
        const interval = setInterval(() => {
            // This is a way to trigger a re-render and re-evaluation of the booked slots
            // by creating a new date object, which will be different from the previous one
            // if we were to pass it as a dependency. Here, we just re-run the logic.
            const now = Date.now();
            const TEN_MINUTES_IN_MS = 10 * 60 * 1000;
            const currentSlots = [];
            if (snapshot.exists()) {
                 snapshot.forEach(childSnapshot => {
                    const booking = childSnapshot.val();
                    if (booking.date === selectedDate) {
                        const status = (booking.status || 'pending').toLowerCase();
                        const timestamp = booking.timestamp;
                        const isAccepted = status === 'accepted';
                        const isRecentPending = status === 'pending' && (now - timestamp < TEN_MINUTES_IN_MS);
                        if (isAccepted || isRecentPending) {
                           currentSlots.push(booking.timing);
                        }
                    }
                 });
            }
            setBookedSlots(currentSlots);
        }, 60000); // Re-check every 60 seconds

        return () => {
            unsubscribeBookings();
            clearInterval(interval); // Clean up interval on component unmount or dependency change
        };

    }, [technicianId, selectedDate]);


    const fetchServiceData = async () => {
        setLoading(true);
        const dbRef = ref(database);
        try {
            const servicesSnapshot = await get(child(dbRef, 'services'));
            if (servicesSnapshot.exists()) {
                const servicesData = servicesSnapshot.val();
                const serviceEntry = Object.values(servicesData).find(s =>
                    s.title?.toLowerCase()?.replace(/\s/g, '-') === serviceName.toLowerCase()
                );
                if (serviceEntry) {
                    setServiceDetails(serviceEntry);
                }
            }
        } catch (error)
        {
            console.error("Error fetching data:", error);
        }
    };

    const getInitial = (name) => {
        if (name) {
            const nameParts = name.split(' ');
            if (nameParts.length > 1) {
                return nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase();
            }
            return name.charAt(0).toUpperCase();
        }
        return 'T';
    };

    // Calendar functionality
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const generateCalendar = (year, month) => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const calendar = [];
        const blockedDates = technician?.unavailableDates || [];

        for (let i = 0; i < firstDay; i++) calendar.push({ day: null, date: null });

        for (let day = 1; day <= daysInMonth; day++) {
            const date = createUtcDate(`${year}-${month + 1}-${day}`);
            const dateStr = date.toISOString().split('T')[0];

            calendar.push({
                day,
                date: dateStr,
                isToday: isToday(date),
                isPast: isPastDate(date),
                isBlocked: blockedDates.includes(dateStr)
            });
        }
        return calendar;
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getUTCFullYear() === today.getFullYear() &&
            date.getUTCMonth() === today.getMonth() &&
            date.getUTCDate() === today.getDate();
    };

    const isPastDate = (date) => {
        const today = new Date();
        const todayUtc = createUtcDate(today.toISOString().split('T')[0]);
        return createUtcDate(date.toISOString().split('T')[0]) < todayUtc;
    };

    const calendar = generateCalendar(currentYear, currentMonth);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const navigateMonth = (direction) => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    const handleDateSelect = (dayInfo) => {
        if (!dayInfo.date || dayInfo.isPast || dayInfo.isBlocked) return;
        setSelectedDate(dayInfo.date);
        setSelectedTime(null);
        setShowCalendarPopup(false);
    };

    const getDisplayDate = (dateStr) => {
        if (!dateStr) return { label: 'Choose Date', sub: 'Tap to select' };

        const todayStr = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(new Date().getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const displayOptions = { weekday: 'short', month: 'short', day: 'numeric' };

        if (dateStr === todayStr) return { label: 'Today', sub: '' };
        if (dateStr === tomorrowStr) return { label: 'Tomorrow', sub: '' };

        const displayDate = new Date(dateStr + 'T00:00:00Z');
        return { label: displayDate.toLocaleDateString('en-US', displayOptions), sub: '' };
    };

    const displayDate = getDisplayDate(selectedDate);

    const subtotal = (technician?.price?.type === 'hourly' ? technician.price.amount * 1 : technician?.price?.amount) || 0;
    const serviceFee = 5;
    const total = subtotal + serviceFee;

    const isBookingDisabled = creatingBooking || !selectedDate || !selectedTime || technician?.unavailableDates?.includes(selectedDate);

    // UPDATED: Check if user profile is complete before booking
    const checkProfileComplete = async () => {
        const user = auth.currentUser;
        if (user) {
            const userRef = ref(database, 'users/' + user.uid);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const userData = snapshot.val();
                return userData.isProfileComplete;
            }
        }
        return false;
    };

    const createBooking = async () => {
        if (!currentUser || !technician || !serviceDetails || !selectedTime) {
            console.error('Missing required data for booking');
            return null;
        }

        const blockedDates = technician?.unavailableDates || [];
        if (blockedDates.includes(selectedDate)) {
            alert(`The technician is unavailable on ${selectedDate}. Please select another date.`);
            return null;
        }

        setCreatingBooking(true);
        try {
            const bookingsRef = ref(database, 'bookings');
            const newBookingRef = push(bookingsRef);

            const bookingData = {
                id: newBookingRef.key,
                uid: currentUser.uid,
                technicianId: technicianId,
                serviceName: serviceDetails.title,
                serviceId: Object.keys(serviceDetails)[0],
                date: selectedDate,
                timing: selectedTime,
                address: 'Address to be provided',
                description: specialInstructions || 'No special instructions',
                price: total,
                status: 'pending',
                timestamp: Date.now(),
                createdAt: new Date().toISOString(),
                customerName: `${currentUser.displayName || 'Customer'}`,
                technicianName: `${technician.firstName} ${technician.lastName}`
            };

            await set(newBookingRef, bookingData);
            return newBookingRef.key;
        } catch (error) {
            console.error('Error creating booking:', error);
            return null;
        } finally {
            setCreatingBooking(false);
        }
    };

    // UPDATED: Added profile completion check with custom popup
    const handleConfirmBooking = async () => {
        // Check if user has completed profile with address
        const isProfileComplete = await checkProfileComplete();
        if (!isProfileComplete) {
            setShowProfilePopup(true);
            return;
        }
        
        if (isBookingDisabled) return;

        const bookingKey = await createBooking();
        if (bookingKey) {
            setBookingId(bookingKey);
            setShowPopup(true);
        } else {
            if (!technician?.unavailableDates?.includes(selectedDate)) {
                alert('Failed to create booking. Please try again.');
            }
        }
    };

    // NEW: Handle profile popup actions
    const handleProfilePopupAction = (action) => {
        setShowProfilePopup(false);
        if (action === 'completeNow') {
            navigate('/profile');
        }
        // If 'later', just close the popup
    };

    const handleBack = () => navigate(-1);

    if (loading || !technician || !currentUser) return <div>Loading...</div>;

    return (
        <div className="booking-page-container">
            <Header />
            <style>
                {`
                .times-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                  gap: 10px;
                }

                .chip.time-chip {
                  padding: 8px 12px;
                  min-height: 40px;
                  font-size: 13px;
                }

                .chip.booked {
                  background-color: #fee2e2;
                  border-color: #fca5a5;
                  color: #b91c1c;
                  cursor: not-allowed;
                  text-decoration: line-through;
                  opacity: 0.8;
                }
                .chip.booked:hover {
                    background-color: #fee2e2;
                    border-color: #fca5a5;
                }
                
                .chip.past {
                  background-color: #f3f4f6;
                  border-color: #e5e7eb;
                  color: #9ca3af;
                  cursor: not-allowed;
                  opacity: 0.7;
                }
                .chip.past:hover {
                    background-color: #f3f4f6;
                    border-color: #e5e7eb;
                }

                .time-placeholder {
                  padding: 20px;
                  text-align: center;
                  color: #6b7280;
                  background-color: #f9fafb;
                  border: 1px dashed #e5e7eb;
                  border-radius: 8px;
                  font-size: 14px;
                }

                /* Profile Popup Styles */
                .profile-popup-overlay {
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: rgba(0, 0, 0, 0.5);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 2000;
                  padding: 20px;
                }

                .profile-popup {
                  background: white;
                  border-radius: 12px;
                  padding: 24px;
                  max-width: 400px;
                  width: 90%;
                  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                  text-align: center;
                }

                .profile-popup-icon {
                  font-size: 48px;
                  margin-bottom: 16px;
                }

                .profile-popup-title {
                  font-size: 20px;
                  font-weight: 700;
                  color: #111827;
                  margin-bottom: 12px;
                }

                .profile-popup-message {
                  color: #6b7280;
                  font-size: 16px;
                  line-height: 1.5;
                  margin-bottom: 24px;
                }

                .profile-popup-actions {
                  display: flex;
                  gap: 12px;
                  justify-content: center;
                }

                .profile-popup-btn {
                  padding: 12px 24px;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 14px;
                  cursor: pointer;
                  border: none;
                  transition: all 0.2s;
                }

                .profile-popup-btn.primary {
                  background: #0d6efd;
                  color: white;
                }

                .profile-popup-btn.primary:hover {
                  background: #0b5ed7;
                }

                .profile-popup-btn.secondary {
                  background: #f3f4f6;
                  color: #374151;
                }

                .profile-popup-btn.secondary:hover {
                  background: #e5e7eb;
                }

                /* Other existing styles... */
                .booking-page-container { display: flex; flex-direction: column; min-height: 100vh; background: #f5f7fb; padding-top: 60px; }
                .booking-main-content { flex: 1; max-width: 1180px; margin: 0 auto; width: 100%; padding: 16px; }
                .page-title { text-align: center; margin-bottom: 18px; }
                .page-title h1 { margin: 0 0 4px; font-size: 28px; font-weight: 700; color: #111827; }
                .page-title p { margin: 0; color: #6b7280; font-size: 14px; }
                .booking-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 18px; align-items: start; }
                .card { background: #fff; border-radius: 10px; box-shadow: 0 2px 10px rgba(16,24,40,.06); border: 1px solid #eef0f4; padding: 16px; }
                .left-col { display: flex; flex-direction: column; gap: 16px; }
                .service-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
                .service-title { display: flex; align-items: center; gap: 10px; }
                .service-title h2 { margin: 0; font-size: 18px; color: #111827; font-weight: 700; }
                .service-badge { background: #e7f0ff; color: #0d6efd; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; border: 1px solid #d6e6ff; }
                .pro-row { display: grid; grid-template-columns: 56px 1fr; gap: 12px; align-items: center; }
                .avatar { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #0d6efd; color: white; font-weight: 700; font-size: 24px; }
                .pro-info { display: flex; flex-direction: column; gap: 6px; }
                .pro-top { display: flex; align-items: center; gap: 12px; }
                .pro-name { margin: 0; font-size: 18px; color: #0f172a; font-weight: 700; }
                .stars { display: inline-flex; align-items: center; gap: 6px; color: #6b7280; font-size: 14px; }
                .star { color: #fbbf24; }
                .muted { color: #9ca3af; }
                .pro-meta { display: flex; gap: 16px; color: #6b7280; font-size: 13px; }
                .pro-meta svg { width: 14px; height: 14px; }
                .pro-meta span { display: inline-flex; align-items: center; gap: 6px; }
                .date-time { order: 1; }
                .included { min-height: auto; order: 2; }
                .included h3 { margin: 0 0 6px; font-size: 16px; font-weight: 700; color: #111827; }
                .included > p { margin: 0 0 8px; color: #6b7280; font-size: 14px; }
                .included ul { list-style: none; margin: 0; padding: 0; }
                .included li { display: flex; align-items: center; gap: 8px; color: #374151; font-size: 14px; padding: 2px 0; }
                .included li svg { width: 14px; height: 14px; color: #16a34a; }
                .section-title { margin: 0 0 10px; font-size: 18px; color: #111827; font-weight: 700; }
                .subsection { margin-top: 8px; }
                .subsection h4 { margin: 0 0 8px; font-size: 14px; color: #111827; font-weight: 700; }
                .date-display { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
                .date-chip { display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px; background: #f9fafb; font-size: 14px; cursor: pointer; transition: border-color .15s; }
                .date-chip.no-selection { color: #6b7280; font-style: italic; }
                .date-chip:hover { border-color: #0d6efd; }
                .date-chip span:first-child { font-weight: 700; }
                .date-chip span:last-child { opacity: 0.8; }
                .chip { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 52px; gap: 4px; border: 1px solid #e5e7eb; border-radius: 10px; background: #f9fafb; font-size: 14px; cursor: pointer; transition: border-color .15s, background .15s, color .15s; }
                .chip:hover { border-color: #0d6efd; }
                .chip.selected { background: #0d6efd; color: #fff; border-color: #0d6efd; }
                .chip.disabled { opacity: .55; cursor: not-allowed; }
                .instructions-input { width: 100%; min-height: 90px; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 10px; resize: vertical; font-size: 14px; font-family: inherit; }
                .instructions-input:focus { outline: none; border-color: #0d6efd; }
                .calendar-popup-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
                .calendar-popup { background: white; border-radius: 10px; padding: 20px; max-width: 400px; width: 100%; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); }
                .calendar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
                .calendar-nav { display: flex; align-items: center; gap: 10px; }
                .calendar-nav button { background: #f3f4f6; border: none; border-radius: 5px; padding: 5px 10px; cursor: pointer; font-size: 14px; }
                .calendar-nav button:hover { background: #e5e7eb; }
                .calendar-month { font-weight: 700; font-size: 16px; }
                .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-bottom: 15px; }
                .calendar-day-header { text-align: center; font-weight: 600; font-size: 12px; color: #6b7280; padding: 5px; }
                .calendar-day { text-align: center; padding: 10px 5px; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background 0.2s; }
                .calendar-day:hover:not(.past):not(.empty):not(.blocked-date) { background: #f3f4f6; }
                .calendar-day.selected { background: #0d6efd; color: white; }
                .calendar-day.past, .calendar-day.blocked-date { color: #d1d5db; cursor: not-allowed; position: relative; }
                .calendar-day.blocked-date { background: #fee2e2; color: #b91c1c; font-weight: 600; border: 1px dashed #fca5a5; }
                .calendar-day.past:hover, .calendar-day.blocked-date:hover { background: transparent; }
                .calendar-day.empty { background: transparent; cursor: default; }
                .calendar-actions { display: flex; justify-content: flex-end; gap: 10px; }
                .calendar-actions button { padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 600; }
                .calendar-actions .btn-cancel { background: #f3f4f6; color: #374151; }
                .calendar-actions .btn-cancel:hover { background: #e5e7eb; }
                .right-col { display: flex; flex-direction: column; gap: 16px; }
                .booking-summary .section-title { margin-bottom: 10px; }
                .summary-rows { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
                .summary-rows .row { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eef0f4; padding-bottom: 8px; font-size: 14px; color: #111827; }
                .summary-rows .row.total { border-bottom: none; padding-top: 8px; border-top: 2px solid #e5e7eb; font-weight: 800; font-size: 16px; }
                .hint { margin-top: 8px; padding: 12px; background: #fff7ed; border: 1px solid #fde7c7; border-radius: 10px; color: #92400e; font-size: 13px; }
                .appt-mini { display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 10px; }
                .appt-mini .mini { display: inline-flex; align-items: center; gap: 8px; color: #111827; font-size: 14px; }
                .appt-mini .mini svg { width: 14px; height: 14px; }
                .actions { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
                .rowed { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .btn { display: inline-flex; align-items: center; gap: 8px; justify-content: center; width: 100%; padding: 12px 14px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
                .btn.primary { background: #0d6efd; color: #fff; }
                .btn.primary:hover { background: #0b5ed7; }
                .btn.primary:disabled { background: #6c757d; cursor: not-allowed; }
                .btn.outline { background: #ffffff; border-color: #e5e7eb; color: #111827; }
                .btn.outline:hover { background: #f8fafc; }
                .btn.ghost { background: #f3f4f6; color: #111827; }
                .btn.ghost:hover { background: #e5e7eb; }
                .btn svg { width: 14px; height: 14px; }
                .guarantee { margin-top: 12px; padding: 12px; background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 10px; text-align: left; }
                .guarantee h4 { margin: 0 0 4px; font-size: 14px; color: #065f46; }
                .guarantee p { margin: 0; font-size: 13px; color: #065f46; }
                .help h3 { margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #111827; }
                .help .help-line { font-size: 14px; color: #374151; padding: 6px 0; }
                @media (max-width: 1024px) { .booking-layout { grid-template-columns: 1fr; } }
                @media (max-width: 640px) { .times-grid { grid-template-columns: repeat(3, 1fr); } .rowed { grid-template-columns: 1fr; } }
                `}
            </style>

            <div className="booking-main-content">
                <div className="page-title">
                    <h1>Confirm Your Booking</h1>
                    <p>Review the details and confirm your service booking</p>
                </div>
                <div className="booking-layout">
                    <div className="left-col">
                        <div className="card service-details">
                            <div className="service-head">
                                <div className="service-title">
                                    <h2>Service Details</h2>
                                    <span className="service-badge">{serviceDetails?.title || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="pro-row">
                                <div className="avatar">{getInitial(technician?.firstName + ' ' + technician?.lastName)}</div>
                                <div className="pro-info">
                                    <div className="pro-top">
                                        <h3 className="pro-name">{technician?.firstName || 'TECHY'} {technician?.lastName || '1'}</h3>
                                        <div className="stars">
                                            <span className="star">&#9733;</span>
                                            <span>{technician?.averageRating?.toFixed(1) || 'N/A'}</span>
                                            <span className="muted">({technician?.totalRatings || 0} reviews)</span>
                                        </div>
                                    </div>
                                    <div className="pro-meta">
                                        <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.5 4.7 32.9-6.3s4.7-25.5-6.3-32.9L280 232V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" /></svg> {technician?.experience || 'N/A'} experience</span>
                                        <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" /></svg> {technician?.city}</span>
                                        <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" /></svg> {technician?.email || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card date-time">
                            <h2 className="section-title">Select Date & Time</h2>
                            <div className="subsection">
                                <h4>Select Date</h4>
                                <div className="date-display">
                                    <button
                                        className={`date-chip ${!selectedDate ? 'no-selection' : ''}`}
                                        onClick={() => setShowCalendarPopup(true)}
                                    >
                                        <span>{displayDate.label}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="subsection">
                                <h4>Available Times</h4>
                                {selectedDate ? (
                                    availableTimeSlots.length > 0 ? (
                                        <div className="times-grid">
                                            {availableTimeSlots.map(time => {
                                                const isBooked = bookedSlots.includes(time);
                                                let isPast = false;

                                                const todayStr = new Date().toISOString().split('T')[0];
                                                if (selectedDate === todayStr) {
                                                    const now = new Date();
                                                    const slotTime = parseTime(time);

                                                    const slotDateTime = new Date();
                                                    slotDateTime.setHours(slotTime.hours, slotTime.minutes, 0, 0);

                                                    isPast = now > slotDateTime;
                                                }

                                                const isDisabled = isBooked || isPast;

                                                return (
                                                    <button
                                                        key={time}
                                                        type="button"
                                                        onClick={() => !isDisabled && setSelectedTime(time)}
                                                        className={`chip time-chip ${selectedTime === time ? 'selected' : ''} ${isBooked ? 'booked' : ''} ${isPast ? 'past' : ''}`}
                                                        disabled={isDisabled}
                                                    >
                                                        {isBooked ? 'Booked' : time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="time-placeholder">
                                            <p>This technician has no available slots in their preferred time range for this day.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="time-placeholder">
                                        <p>Please select a date to view available time slots.</p>
                                    </div>
                                )}
                            </div>

                            <div className="subsection">
                                <h4>Special Instructions (Optional)</h4>
                                <textarea
                                    className="instructions-input"
                                    placeholder="Any specific requirements or details about the job..."
                                    value={specialInstructions}
                                    onChange={handleInstructionsChange}
                                />
                                {instructionsError && <p style={{ color: '#b91c1c', fontSize: '13px', marginTop: '5px' }}>{instructionsError}</p>}
                            </div>
                        </div>

                        <div className="card included">
                            <h3>What's included:</h3>
                            <p>Professional {serviceDetails?.title || 'N/A'} repair and maintenance service</p>
                            <ul>
                                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" /></svg> Professional consultation and assessment</li>
                                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" /></svg> All necessary tools and basic materials</li>
                                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" /></svg> Quality guarantee on work performed</li>
                                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" /></svg> Clean-up after service completion</li>
                            </ul>
                        </div>
                    </div>
                    <div className="right-col">
                        <div className="card booking-summary">
                            <h2 className="section-title">Booking Summary</h2>
                            <div className="summary-rows">
                                <div className="row">
                                    <span>{technician?.price?.type === 'hourly' ? 'Hourly Rate' : 'Daily Rate'}</span>
                                    <span>&#8377;{technician?.price?.amount || 'N/A'}/{technician?.price?.type === 'hourly' ? 'hr' : 'day'}</span>
                                </div>
                                {technician?.price?.type === 'hourly' && (
                                    <div className="row">
                                        <span>Estimated Hours</span>
                                        <span>1 hour</span>
                                    </div>
                                )}
                                <div className="row">
                                    <span>Subtotal</span>
                                    <span>&#8377;{subtotal}</span>
                                </div>
                                <div className="row">
                                    <span>Service Fee</span>
                                    <span>&#8377;{serviceFee}</span>
                                </div>
                                <div className="row total">
                                    <span>Total</span>
                                    <span>&#8377;{total}</span>
                                </div>
                            </div>
                            <div className="hint">
                                <strong>Note:</strong> Final cost may vary based on actual time and materials used.
                            </div>
                            <div className="appt-mini">
                                <div className="mini">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z" /></svg>
                                    <span>{selectedDate ? `${displayDate.label}` : 'No date selected'}</span>
                                </div>
                                <div className="mini">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.5 4.7 32.9-6.3s4.7-25.5-6.3-32.9L280 232V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" /></svg>
                                    <span>{selectedTime || 'No time selected'}</span>
                                </div>
                            </div>
                            <div className="actions">
                                <button
                                    className={`btn primary ${isBookingDisabled ? 'disabled' : ''}`}
                                    onClick={handleConfirmBooking}
                                    disabled={isBookingDisabled}
                                >
                                    {creatingBooking ? 'Creating Booking...' :
                                        !selectedDate ? 'Select a Date' :
                                            !selectedTime ? 'Select a Time Slot' :
                                                (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                                                        Confirm Booking
                                                    </>
                                                )}
                                </button>
                                <div className="rowed">
                                    <button className="btn outline" onClick={handleBack}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" /></svg>
                                        Back
                                    </button>
                                    <button className="btn ghost" onClick={() => navigate('/')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor"><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" /></svg>
                                        Home
                                    </button>
                                </div>
                            </div>
                            <div className="guarantee">
                                <h4>Service Guarantee</h4>
                                <p>Your satisfaction is guaranteed. If you're not happy with the service, we'll work to make it right.</p>
                            </div>
                        </div>
                        <div className="card help">
                            <h3>Need help?</h3>
                            <div className="help-line">Call us: +91 9879879871</div>
                            <div className="help-line">Email: support@skillworkers.com</div>
                            <div className="help-line">Chat with us online</div>
                        </div>
                    </div>
                </div>
            </div>

            {showCalendarPopup && (
                <div className="calendar-popup-overlay" onClick={() => setShowCalendarPopup(false)}>
                    <div className="calendar-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="calendar-header">
                            <div className="calendar-nav">
                                <button onClick={() => navigateMonth('prev')}>&larr; </button>
                                <span className="calendar-month">{monthNames[currentMonth]} {currentYear}</span>
                                <button onClick={() => navigateMonth('next')}> &rarr;</button>
                            </div>
                        </div>
                        <div className="calendar-grid">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day} className="calendar-day-header">{day}</div>)}
                            {calendar.map((dayInfo, index) => (
                                <div
                                    key={index}
                                    className={`calendar-day ${dayInfo.day === null ? 'empty' : dayInfo.isPast ? 'past' : dayInfo.isBlocked ? 'blocked-date' : dayInfo.date === selectedDate ? 'selected' : ''}`}
                                    onClick={() => handleDateSelect(dayInfo)}
                                >
                                    {dayInfo.day}
                                </div>
                            ))}
                        </div>
                        <div className="calendar-actions">
                            <button className="btn-cancel" onClick={() => setShowCalendarPopup(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Completion Popup */}
            {showProfilePopup && (
                <div className="profile-popup-overlay">
                    <div className="profile-popup">
                        <div className="profile-popup-icon">📝</div>
                        <h3 className="profile-popup-title">Complete Your Profile</h3>
                        <p className="profile-popup-message">
                            Please complete your profile with address details before booking services. 
                            This helps technicians reach your location accurately.
                        </p>
                        <div className="profile-popup-actions">
                            <button 
                                className="profile-popup-btn primary"
                                onClick={() => handleProfilePopupAction('completeNow')}
                            >
                                Complete Profile Now
                            </button>
                            <button 
                                className="profile-popup-btn secondary"
                                onClick={() => handleProfilePopupAction('later')}
                            >
                                I'll Do It Later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPopup && (
                <BookingConfirmationPopup
                    show={showPopup}
                    bookingId={bookingId}
                    technician={technician}
                    serviceDetails={serviceDetails}
                    selectedDate={selectedDate ? displayDate : null}
                    selectedTime={selectedTime}
                    total={total}
                    onBack={() => setShowPopup(false)}
                    onNavigateHome={() => {
                        setShowPopup(false);
                        navigate('/dashboard');
                    }}
                />
            )}
            <Footer />
        </div>
    );
};

export default BookingPage;