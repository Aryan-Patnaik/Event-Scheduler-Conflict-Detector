package com.eventscheduler.service;

import com.eventscheduler.model.*;
import java.util.*;

import org.springframework.stereotype.Service;

@Service
public class EventService {

    public ScheduleResponse processEvents(List<EventRequest> requests) {
        List<Event> events = new ArrayList<>();
        for (EventRequest r : requests) {
            events.add(new Event(r.name, r.start, r.end));
        }

        // Sort events by start time
        events.sort(Comparator.comparingInt(e -> e.start));

        List<EventResponse> sortedEvents = new ArrayList<>();
        for (Event e : events) {
            sortedEvents.add(new EventResponse(e.name, Event.toTime(e.start), Event.toTime(e.end)));
        }

        // Detect conflicts
        List<Conflict> conflicts = new ArrayList<>();
        for (int i = 0; i < events.size() - 1; i++) {
            Event current = events.get(i);
            Event next = events.get(i + 1);

            if (current.end > next.start) {
                int duration = next.end - next.start;
                int newStart = events.get(events.size() - 1).end;
                int newEnd = newStart + duration;

                conflicts.add(new Conflict(
                        current.name,
                        next.name,
                        Event.toTime(newStart),
                        Event.toTime(newEnd)
                ));
            }
        }

        return new ScheduleResponse(sortedEvents, conflicts);
    }
}
