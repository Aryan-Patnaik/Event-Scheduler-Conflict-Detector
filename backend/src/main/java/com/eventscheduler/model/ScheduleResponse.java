package com.eventscheduler.model;

import java.util.List;

public class ScheduleResponse {
    public List<EventResponse> sortedEvents;
    public List<Conflict> conflicts;

    public ScheduleResponse(List<EventResponse> sortedEvents, List<Conflict> conflicts) {
        this.sortedEvents = sortedEvents;
        this.conflicts = conflicts;
    }
}
