import React, { useState, useEffect } from 'react';
import { Course, CalendarEvent } from '../types';
import Card from './common/Card';
import * as api from '../services/apiService';
import { Calendar, FileText, CheckSquare, RefreshCw } from 'lucide-react';
import LoadingSpinner from './common/LoadingSpinner';
import Button from './common/Button';
import Toast from './common/Toast';

const CalendarPage: React.FC<{ courses: Course[] }> = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const calendarEvents = await api.getCalendarEvents();
        setEvents(calendarEvents);
      } catch (error) {
        console.error("Failed to fetch calendar events", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const groupEventsByDate = (eventList: CalendarEvent[]) => {
    return eventList.reduce((acc, event) => {
      const dateKey = new Date(event.date).toLocaleDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);
  };

  const handleSyncCalendar = () => {
      setToastMessage("Calendar sync initiated successfully!");
  };

  const groupedEvents = groupEventsByDate(events);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
            <Calendar size={32} className="text-primary-600" />
            <div>
                <h1 className="text-3xl font-bold text-gray-800">My Calendar</h1>
                <p className="text-gray-500">A unified view of all your deadlines and important dates.</p>
            </div>
        </div>
        <Button onClick={handleSyncCalendar} variant="secondary">
            <RefreshCw size={16} className="mr-2"/> Sync with Google Calendar
        </Button>
      </div>
      
      <div className="space-y-6">
        {Object.keys(groupedEvents).length > 0 ? (
          Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <div key={date}>
              <h2 className="font-bold text-xl text-gray-700 mb-2 pb-2 border-b">
                {new Date(dateEvents[0].date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              <div className="space-y-3">
                {dateEvents.map(event => (
                  <Card key={event.id} className="p-4">
                    <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-full ${event.type === 'test' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            {event.type === 'test' ? <CheckSquare className="text-blue-600" /> : <FileText className="text-green-600" />}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{event.title}</p>
                            <p className="text-sm text-gray-500">{event.courseTitle}</p>
                        </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          <Card className="p-10 text-center">
            <Calendar size={48} className="mx-auto text-gray-300" />
            <p className="mt-4 font-semibold text-gray-700">Your calendar is clear!</p>
            <p className="text-gray-500">No upcoming deadlines found.</p>
          </Card>
        )}
      </div>
       {toastMessage && (
        <Toast
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
          icon={<CheckSquare className="text-green-500" />}
        />
      )}
    </div>
  );
};

export default CalendarPage;